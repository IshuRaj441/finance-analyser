<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\User;
use App\Models\FraudAlert;
use App\Models\AuditLog;
use App\Services\NotificationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class FraudDetectionService
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function analyzeTransaction(Transaction $transaction): ?FraudAlert
    {
        $rules = [
            'large_amount' => $this->checkLargeAmount($transaction),
            'unusual_time' => $this->checkUnusualTime($transaction),
            'duplicate_transaction' => $this->checkDuplicateTransaction($transaction),
            'velocity_check' => $this->checkVelocity($transaction),
            'new_location' => $this->checkNewLocation($transaction),
            'account_anomaly' => $this->checkAccountAnomaly($transaction),
        ];

        foreach ($rules as $type => $result) {
            if ($result !== null) {
                return $this->createFraudAlert($transaction, $type, $result);
            }
        }

        return null;
    }

    public function analyzeLoginAttempt(User $user, string $ipAddress, string $userAgent): ?FraudAlert
    {
        $rules = [
            'multiple_failed_logins' => $this->checkMultipleFailedLogins($user, $ipAddress),
            'new_location_login' => $this->checkNewLocationLogin($user, $ipAddress),
            'new_device_login' => $this->checkNewDeviceLogin($user, $userAgent),
        ];

        foreach ($rules as $type => $result) {
            if ($result !== null) {
                return $this->createLoginFraudAlert($user, $type, $result, $ipAddress, $userAgent);
            }
        }

        return null;
    }

    public function checkMultipleFailedLogins(User $user, string $ipAddress): ?array
    {
        $failedAttempts = AuditLog::where('action', 'failed_login')
            ->where('ip_address', $ipAddress)
            ->where('created_at', '>', now()->subMinutes(15))
            ->count();

        if ($failedAttempts >= 5) {
            return [
                'severity' => 'high',
                'description' => "Multiple failed login attempts detected from IP: {$ipAddress}",
                'details' => [
                    'ip_address' => $ipAddress,
                    'failed_attempts' => $failedAttempts,
                    'time_window' => '15 minutes',
                ],
            ];
        }

        return null;
    }

    public function checkLargeAmount(Transaction $transaction): ?array
    {
        $user = $transaction->user;
        $company = $transaction->company;

        // Get user's average transaction amount
        $avgAmount = Transaction::where('user_id', $user->id)
            ->where('type', $transaction->type)
            ->where('status', 'approved')
            ->where('created_at', '>', now()->subDays(90))
            ->avg('amount') ?? 0;

        $threshold = $avgAmount * 5; // 5x average
        $absoluteThreshold = $company->settings['fraud_detection']['large_amount_threshold'] ?? 10000;

        if ($transaction->amount > max($threshold, $absoluteThreshold)) {
            return [
                'severity' => 'medium',
                'description' => "Large transaction amount detected: {$transaction->amount}",
                'details' => [
                    'transaction_amount' => $transaction->amount,
                    'average_amount' => $avgAmount,
                    'threshold' => max($threshold, $absoluteThreshold),
                    'multiplier' => $avgAmount > 0 ? round($transaction->amount / $avgAmount, 2) : 0,
                ],
            ];
        }

        return null;
    }

    public function checkUnusualTime(Transaction $transaction): ?array
    {
        $user = $transaction->user;
        
        // Get user's typical transaction hours
        $typicalHours = Transaction::where('user_id', $user->id)
            ->where('status', 'approved')
            ->where('created_at', '>', now()->subDays(30))
            ->selectRaw('HOUR(created_at) as hour, COUNT(*) as count')
            ->groupBy('hour')
            ->orderBy('count', 'desc')
            ->limit(3)
            ->pluck('hour')
            ->toArray();

        $currentHour = now()->hour;

        if (!empty($typicalHours) && !in_array($currentHour, $typicalHours)) {
            return [
                'severity' => 'low',
                'description' => "Transaction created at unusual time: {$currentHour}:00",
                'details' => [
                    'transaction_time' => $currentHour,
                    'typical_hours' => $typicalHours,
                ],
            ];
        }

        return null;
    }

    public function checkDuplicateTransaction(Transaction $transaction): ?array
    {
        $duplicates = Transaction::where('company_id', $transaction->company_id)
            ->where('user_id', $transaction->user_id)
            ->where('amount', $transaction->amount)
            ->where('title', $transaction->title)
            ->where('transaction_date', $transaction->transaction_date)
            ->where('id', '!=', $transaction->id)
            ->where('created_at', '>', now()->subHours(24))
            ->count();

        if ($duplicates > 0) {
            return [
                'severity' => 'medium',
                'description' => "Potential duplicate transaction detected",
                'details' => [
                    'duplicate_count' => $duplicates,
                    'time_window' => '24 hours',
                ],
            ];
        }

        return null;
    }

    public function checkVelocity(Transaction $transaction): ?array
    {
        $user = $transaction->user;
        
        // Check transaction velocity in last hour
        $recentTransactions = Transaction::where('user_id', $user->id)
            ->where('type', $transaction->type)
            ->where('created_at', '>', now()->subHour())
            ->count();

        $velocityThreshold = $transaction->company->settings['fraud_detection']['velocity_threshold'] ?? 10;

        if ($recentTransactions >= $velocityThreshold) {
            return [
                'severity' => 'high',
                'description' => "High transaction velocity detected",
                'details' => [
                    'transaction_count' => $recentTransactions,
                    'time_window' => '1 hour',
                    'threshold' => $velocityThreshold,
                ],
            ];
        }

        return null;
    }

    public function checkNewLocation(Transaction $transaction): ?array
    {
        $user = $transaction->user;
        
        // Get user's typical IP addresses
        $typicalIps = AuditLog::where('user_id', $user->id)
            ->where('action', 'login')
            ->where('created_at', '>', now()->subDays(30))
            ->distinct('ip_address')
            ->pluck('ip_address')
            ->toArray();

        $currentIp = request()->ip();

        if (!empty($typicalIps) && !in_array($currentIp, $typicalIps)) {
            return [
                'severity' => 'medium',
                'description' => "Transaction from new location detected",
                'details' => [
                    'current_ip' => $currentIp,
                    'typical_ips' => array_slice($typicalIps, 0, 5), // Limit for privacy
                ],
            ];
        }

        return null;
    }

    public function checkAccountAnomaly(Transaction $transaction): ?array
    {
        $user = $transaction->user;
        
        // Check for sudden increase in transaction frequency
        $lastWeekCount = Transaction::where('user_id', $user->id)
            ->where('created_at', '>', now()->subWeek())
            ->count();

        $previousWeekCount = Transaction::where('user_id', $user->id)
            ->where('created_at', '>', now()->subWeeks(2))
            ->where('created_at', '<=', now()->subWeek())
            ->count();

        if ($previousWeekCount > 0 && $lastWeekCount > $previousWeekCount * 3) {
            return [
                'severity' => 'medium',
                'description' => "Sudden increase in transaction frequency",
                'details' => [
                    'last_week_count' => $lastWeekCount,
                    'previous_week_count' => $previousWeekCount,
                    'increase_ratio' => round($lastWeekCount / $previousWeekCount, 2),
                ],
            ];
        }

        return null;
    }

    public function checkNewLocationLogin(User $user, string $ipAddress): ?array
    {
        $typicalIps = AuditLog::where('user_id', $user->id)
            ->where('action', 'login')
            ->where('created_at', '>', now()->subDays(30))
            ->distinct('ip_address')
            ->pluck('ip_address')
            ->toArray();

        if (!empty($typicalIps) && !in_array($ipAddress, $typicalIps)) {
            return [
                'severity' => 'medium',
                'description' => "Login from new location detected",
                'details' => [
                    'current_ip' => $ipAddress,
                    'typical_ips' => array_slice($typicalIps, 0, 3),
                ],
            ];
        }

        return null;
    }

    public function checkNewDeviceLogin(User $user, string $userAgent): ?array
    {
        $typicalUserAgents = AuditLog::where('user_id', $user->id)
            ->where('action', 'login')
            ->where('created_at', '>', now()->subDays(30))
            ->distinct('user_agent')
            ->pluck('user_agent')
            ->toArray();

        if (!empty($typicalUserAgents) && !in_array($userAgent, $typicalUserAgents)) {
            return [
                'severity' => 'low',
                'description' => "Login from new device detected",
                'details' => [
                    'current_device' => substr($userAgent, 0, 100),
                ],
            ];
        }

        return null;
    }

    private function createFraudAlert(Transaction $transaction, string $type, array $details): FraudAlert
    {
        $alert = FraudAlert::create([
            'company_id' => $transaction->company_id,
            'user_id' => $transaction->user_id,
            'transaction_id' => $transaction->id,
            'type' => $type,
            'severity' => $details['severity'],
            'description' => $details['description'],
            'details' => $details['details'] ?? null,
        ]);

        // Send notifications to managers
        $this->notificationService->sendToRole(
            'Manager',
            $transaction->company_id,
            'suspicious_activity',
            [
                'activity_type' => 'Fraud Alert',
                'description' => $details['description'],
                'severity' => $details['severity'],
                'action_url' => route('fraud-alerts.show', $alert->id),
            ],
            ['database', 'email']
        );

        Log::warning("Fraud alert created: {$type} for transaction {$transaction->id}", $details);

        return $alert;
    }

    private function createLoginFraudAlert(User $user, string $type, array $details, string $ipAddress, string $userAgent): FraudAlert
    {
        $alert = FraudAlert::create([
            'company_id' => $user->company_id,
            'user_id' => $user->id,
            'type' => $type,
            'severity' => $details['severity'],
            'description' => $details['description'],
            'details' => $details['details'] ?? null,
        ]);

        // Send notifications to managers
        $this->notificationService->sendToRole(
            'Manager',
            $user->company_id,
            'suspicious_activity',
            [
                'activity_type' => 'Fraud Alert',
                'description' => $details['description'],
                'severity' => $details['severity'],
                'action_url' => route('fraud-alerts.show', $alert->id),
            ],
            ['database', 'email']
        );

        Log::warning("Fraud alert created: {$type} for user {$user->id}", $details);

        return $alert;
    }

    public function getFraudScore(User $user): array
    {
        $alerts = FraudAlert::where('user_id', $user->id)
            ->where('created_at', '>', now()->subDays(90))
            ->get();

        $score = 0;
        $factors = [];

        // Alert history factor
        $alertCount = $alerts->count();
        if ($alertCount > 0) {
            $score += min($alertCount * 10, 50);
            $factors[] = "Alert History: {$alertCount} alerts";
        }

        // High severity alerts
        $highSeverityCount = $alerts->where('severity', 'high')->count();
        if ($highSeverityCount > 0) {
            $score += $highSeverityCount * 20;
            $factors[] = "High Severity Alerts: {$highSeverityCount}";
        }

        // Recent alerts
        $recentAlerts = $alerts->where('created_at', '>', now()->subDays(7))->count();
        if ($recentAlerts > 0) {
            $score += $recentAlerts * 15;
            $factors[] = "Recent Alerts: {$recentAlerts} in last 7 days";
        }

        // Transaction pattern analysis
        $transactionScore = $this->analyzeTransactionPattern($user);
        $score += $transactionScore;
        if ($transactionScore > 0) {
            $factors[] = "Transaction Pattern Anomalies";
        }

        $riskLevel = $this->calculateRiskLevel($score);

        return [
            'score' => min($score, 100),
            'risk_level' => $riskLevel,
            'factors' => $factors,
            'alert_summary' => [
                'total_alerts' => $alertCount,
                'high_severity' => $highSeverityCount,
                'recent_alerts' => $recentAlerts,
            ],
        ];
    }

    private function analyzeTransactionPattern(User $user): int
    {
        $score = 0;

        // Check for unusual transaction patterns
        $transactions = Transaction::where('user_id', $user->id)
            ->where('created_at', '>', now()->subDays(30))
            ->get();

        if ($transactions->count() < 10) {
            return 0; // Not enough data
        }

        // Weekend vs weekday pattern
        $weekendTransactions = $transactions->filter(function ($t) {
            return in_array($t->created_at->dayOfWeek, [0, 6]); // Sunday, Saturday
        })->count();

        $weekdayTransactions = $transactions->count() - $weekendTransactions;

        if ($weekdayTransactions > 0 && $weekendTransactions / $weekdayTransactions > 0.5) {
            $score += 10; // High weekend activity
        }

        // Late night transactions
        $lateNightTransactions = $transactions->filter(function ($t) {
            return $t->created_at->hour >= 22 || $t->created_at->hour <= 6;
        })->count();

        if ($lateNightTransactions / $transactions->count() > 0.2) {
            $score += 15; // High late night activity
        }

        return $score;
    }

    private function calculateRiskLevel(int $score): string
    {
        if ($score >= 80) {
            return 'critical';
        } elseif ($score >= 60) {
            return 'high';
        } elseif ($score >= 40) {
            return 'medium';
        } elseif ($score >= 20) {
            return 'low';
        } else {
            return 'minimal';
        }
    }

    public function getFraudTrends(int $companyId, int $days = 30): array
    {
        $alerts = FraudAlert::where('company_id', $companyId)
            ->where('created_at', '>', now()->subDays($days))
            ->get();

        return [
            'total_alerts' => $alerts->count(),
            'by_severity' => [
                'critical' => $alerts->where('severity', 'critical')->count(),
                'high' => $alerts->where('severity', 'high')->count(),
                'medium' => $alerts->where('severity', 'medium')->count(),
                'low' => $alerts->where('severity', 'low')->count(),
            ],
            'by_type' => $alerts->groupBy('type')->map->count()->toArray(),
            'daily_trend' => $alerts->groupBy(function ($alert) {
                return $alert->created_at->format('Y-m-d');
            })->map->count()->toArray(),
            'resolved_rate' => $alerts->count() > 0 
                ? round(($alerts->where('status', 'resolved')->count() / $alerts->count()) * 100, 2)
                : 0,
        ];
    }
}
