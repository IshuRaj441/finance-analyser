<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SocketService
{
    protected $socketUrl;
    protected $apiToken;

    public function __construct()
    {
        $this->socketUrl = config('services.socket.url', 'http://localhost:3001');
        $this->apiToken = config('services.socket.api_token');
    }

    /**
     * Send notification to specific user
     */
    public function notifyUser(int $userId, array $notification): bool
    {
        try {
            $response = Http::post("{$this->socketUrl}/notify-user", [
                'userId' => $userId,
                'notification' => $notification
            ])->timeout(2); // 2 second timeout

            return $response->successful();
        } catch (\Exception $e) {
            Log::warning('Failed to send socket notification to user', [
                'userId' => $userId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Send notification to entire company
     */
    public function notifyCompany(int $companyId, array $notification, ?int $excludeUserId = null): bool
    {
        try {
            $payload = [
                'companyId' => $companyId,
                'notification' => $notification
            ];

            if ($excludeUserId) {
                $payload['excludeUserId'] = $excludeUserId;
            }

            $response = Http::post("{$this->socketUrl}/notify-company", $payload)
                ->timeout(2);

            return $response->successful();
        } catch (\Exception $e) {
            Log::warning('Failed to send socket notification to company', [
                'companyId' => $companyId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Broadcast transaction update
     */
    public function broadcastTransaction(int $companyId, array $transaction, string $action): bool
    {
        try {
            $response = Http::post("{$this->socketUrl}/broadcast-transaction", [
                'companyId' => $companyId,
                'transaction' => $transaction,
                'action' => $action
            ])->timeout(2);

            return $response->successful();
        } catch (\Exception $e) {
            Log::warning('Failed to broadcast transaction update', [
                'companyId' => $companyId,
                'transactionId' => $transaction['id'] ?? null,
                'action' => $action,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Broadcast budget update
     */
    public function broadcastBudget(int $companyId, array $budget, string $action): bool
    {
        try {
            $response = Http::post("{$this->socketUrl}/broadcast-budget", [
                'companyId' => $companyId,
                'budget' => $budget,
                'action' => $action
            ])->timeout(2);

            return $response->successful();
        } catch (\Exception $e) {
            Log::warning('Failed to broadcast budget update', [
                'companyId' => $companyId,
                'budgetId' => $budget['id'] ?? null,
                'action' => $action,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Get socket server stats
     */
    public function getStats(): ?array
    {
        try {
            $response = Http::get("{$this->socketUrl}/stats")->timeout(2);

            if ($response->successful()) {
                return $response->json();
            }
        } catch (\Exception $e) {
            Log::warning('Failed to get socket server stats', [
                'error' => $e->getMessage()
            ]);
        }

        return null;
    }

    /**
     * Check if socket server is healthy
     */
    public function isHealthy(): bool
    {
        try {
            $response = Http::get("{$this->socketUrl}/health")->timeout(2);
            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Send real-time notification and also store in database
     */
    public function sendRealtimeNotification(int $userId, string $type, array $data): bool
    {
        $user = \App\Models\User::find($userId);
        
        if (!$user) {
            return false;
        }

        // Store notification in database
        $notificationService = app(NotificationService::class);
        $notificationService->send($user, $type, $data);

        // Send real-time notification
        $notification = [
            'id' => uniqid(),
            'type' => $type,
            'title' => $data['title'] ?? 'Notification',
            'message' => $data['message'] ?? '',
            'action_url' => $data['action_url'] ?? null,
            'icon' => $data['icon'] ?? null,
            'priority' => $data['priority'] ?? 'normal',
            'created_at' => now()->toISOString(),
        ];

        return $this->notifyUser($userId, $notification);
    }

    /**
     * Send budget exceeded notification
     */
    public function sendBudgetExceededNotification(int $userId, array $budgetData): bool
    {
        return $this->sendRealtimeNotification($userId, 'budget_exceeded', [
            'title' => 'Budget Exceeded',
            'message' => "Your budget '{$budgetData['name']}' has been exceeded by {$budgetData['percentage']}%",
            'action_url' => "/budgets/{$budgetData['id']}",
            'icon' => 'alert-triangle',
            'priority' => 'high',
        ]);
    }

    /**
     * Send transaction approved notification
     */
    public function sendTransactionApprovedNotification(int $userId, array $transactionData): bool
    {
        return $this->sendRealtimeNotification($userId, 'transaction_approved', [
            'title' => 'Transaction Approved',
            'message' => "Your transaction '{$transactionData['title']}' of {$transactionData['amount']} has been approved",
            'action_url' => "/transactions/{$transactionData['id']}",
            'icon' => 'check-circle',
            'priority' => 'normal',
        ]);
    }

    /**
     * Send new transaction notification (to managers/admins)
     */
    public function sendNewTransactionNotification(int $companyId, array $transactionData): bool
    {
        $notification = [
            'id' => uniqid(),
            'type' => 'new_transaction',
            'title' => 'New Transaction Added',
            'message' => "A new transaction '{$transactionData['title']}' of {$transactionData['amount']} requires approval",
            'action_url' => "/transactions/{$transactionData['id']}",
            'icon' => 'receipt',
            'priority' => 'normal',
            'created_at' => now()->toISOString(),
        ];

        return $this->notifyCompany($companyId, $notification);
    }

    /**
     * Send report generated notification
     */
    public function sendReportGeneratedNotification(int $userId, array $reportData): bool
    {
        return $this->sendRealtimeNotification($userId, 'report_generated', [
            'title' => 'Report Generated',
            'message' => "Your report '{$reportData['name']}' is ready for download",
            'action_url' => "/reports/{$reportData['id']}/download",
            'icon' => 'file-text',
            'priority' => 'normal',
        ]);
    }

    /**
     * Send suspicious activity notification
     */
    public function sendSuspiciousActivityNotification(int $companyId, array $alertData): bool
    {
        $notification = [
            'id' => uniqid(),
            'type' => 'suspicious_activity',
            'title' => 'Suspicious Activity Detected',
            'message' => $alertData['description'],
            'action_url' => "/fraud-alerts/{$alertData['id']}",
            'icon' => 'shield-alert',
            'priority' => 'high',
            'created_at' => now()->toISOString(),
        ];

        return $this->notifyCompany($companyId, $notification);
    }
}
