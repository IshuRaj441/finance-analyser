<?php

namespace App\Services;

use App\Models\User;
use App\Models\Notification;
use App\Models\NotificationChannel;
use App\Models\NotificationTemplate;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Notifications\DatabaseNotification;
use App\Notifications\SystemNotification;
use App\Notifications\EmailNotification;
use App\Notifications\SMSNotification;

class NotificationService
{
    public function send(User $user, string $type, array $data, array $channels = ['database'])
    {
        $template = NotificationTemplate::where('name', $type)->first();
        
        if (!$template) {
            Log::warning("Notification template not found: {$type}");
            return false;
        }

        $notificationData = $this->prepareNotificationData($template, $data);
        $success = [];

        foreach ($channels as $channel) {
            if ($this->shouldSendToChannel($user, $channel)) {
                $result = $this->sendToChannel($user, $channel, $notificationData);
                $success[$channel] = $result;
            }
        }

        return $success;
    }

    public function sendToMultiple(array $userIds, string $type, array $data, array $channels = ['database'])
    {
        $users = User::whereIn('id', $userIds)->get();
        $results = [];

        foreach ($users as $user) {
            $results[$user->id] = $this->send($user, $type, $data, $channels);
        }

        return $results;
    }

    public function sendToCompany(int $companyId, string $type, array $data, array $channels = ['database'])
    {
        $users = User::where('company_id', $companyId)->active()->get();
        $results = [];

        foreach ($users as $user) {
            $results[$user->id] = $this->send($user, $type, $data, $channels);
        }

        return $results;
    }

    public function sendToRole(string $role, int $companyId, string $type, array $data, array $channels = ['database'])
    {
        $users = User::role($role)->where('company_id', $companyId)->active()->get();
        $results = [];

        foreach ($users as $user) {
            $results[$user->id] = $this->send($user, $type, $data, $channels);
        }

        return $results;
    }

    private function shouldSendToChannel(User $user, string $channel): bool
    {
        $notificationChannel = NotificationChannel::where('user_id', $user->id)
            ->where('channel', $channel)
            ->where('is_enabled', true)
            ->first();

        return $notificationChannel !== null;
    }

    private function sendToChannel(User $user, string $channel, array $data)
    {
        try {
            switch ($channel) {
                case 'database':
                    return $this->sendDatabaseNotification($user, $data);
                
                case 'email':
                    return $this->sendEmailNotification($user, $data);
                
                case 'sms':
                    return $this->sendSMSNotification($user, $data);
                
                case 'push':
                    return $this->sendPushNotification($user, $data);
                
                default:
                    Log::warning("Unknown notification channel: {$channel}");
                    return false;
            }
        } catch (\Exception $e) {
            Log::error("Failed to send {$channel} notification to user {$user->id}: " . $e->getMessage());
            return false;
        }
    }

    private function sendDatabaseNotification(User $user, array $data): bool
    {
        $notification = DatabaseNotification::create([
            'id' => \Illuminate\Support\Str::uuid(),
            'type' => $data['type'],
            'notifiable_type' => User::class,
            'notifiable_id' => $user->id,
            'data' => json_encode([
                'title' => $data['title'],
                'message' => $data['message'],
                'action_url' => $data['action_url'] ?? null,
                'icon' => $data['icon'] ?? null,
                'priority' => $data['priority'] ?? 'normal',
            ]),
        ]);

        return $notification !== null;
    }

    private function sendEmailNotification(User $user, array $data): bool
    {
        if (!$user->email) {
            return false;
        }

        try {
            Mail::to($user->email)->send(new EmailNotification($data));
            return true;
        } catch (\Exception $e) {
            Log::error("Email notification failed: " . $e->getMessage());
            return false;
        }
    }

    private function sendSMSNotification(User $user, array $data): bool
    {
        $notificationChannel = NotificationChannel::where('user_id', $user->id)
            ->where('channel', 'sms')
            ->where('is_enabled', true)
            ->first();

        if (!$notificationChannel || !$notificationChannel->address) {
            return false;
        }

        try {
            // Integration with SMS service (Twilio, etc.)
            // For now, we'll just log it
            Log::info("SMS sent to {$notificationChannel->address}: {$data['message']}");
            return true;
        } catch (\Exception $e) {
            Log::error("SMS notification failed: " . $e->getMessage());
            return false;
        }
    }

    private function sendPushNotification(User $user, array $data): bool
    {
        try {
            // Integration with push notification service (Firebase, etc.)
            // For now, we'll just log it
            Log::info("Push notification sent to user {$user->id}: {$data['message']}");
            return true;
        } catch (\Exception $e) {
            Log::error("Push notification failed: " . $e->getMessage());
            return false;
        }
    }

    private function prepareNotificationData(NotificationTemplate $template, array $data): array
    {
        $variables = $template->variables ?? [];
        $subject = $template->subject;
        $message = $template->email_template ?? $template->sms_template ?? $template->push_template ?? '';

        foreach ($variables as $variable) {
            $placeholder = '{' . $variable . '}';
            $value = $data[$variable] ?? '';
            $subject = str_replace($placeholder, $value, $subject);
            $message = str_replace($placeholder, $value, $message);
        }

        return [
            'type' => $template->name,
            'title' => $subject,
            'message' => $message,
            'action_url' => $data['action_url'] ?? null,
            'icon' => $data['icon'] ?? null,
            'priority' => $data['priority'] ?? 'normal',
        ];
    }

    public function markAsRead(User $user, string $notificationId): bool
    {
        $notification = DatabaseNotification::where('id', $notificationId)
            ->where('notifiable_id', $user->id)
            ->first();

        if ($notification) {
            $notification->markAsRead();
            return true;
        }

        return false;
    }

    public function markAllAsRead(User $user): bool
    {
        DatabaseNotification::where('notifiable_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return true;
    }

    public function getUnreadCount(User $user): int
    {
        return DatabaseNotification::where('notifiable_id', $user->id)
            ->whereNull('read_at')
            ->count();
    }

    public function getNotifications(User $user, int $limit = 20, bool $unreadOnly = false)
    {
        $query = DatabaseNotification::where('notifiable_id', $user->id)
            ->orderBy('created_at', 'desc');

        if ($unreadOnly) {
            $query->whereNull('read_at');
        }

        return $query->limit($limit)->get();
    }

    // Predefined notification methods
    public function sendBudgetExceeded(User $user, array $budgetData)
    {
        return $this->send($user, 'budget_exceeded', [
            'budget_name' => $budgetData['name'],
            'budget_amount' => $budgetData['amount'],
            'spent_amount' => $budgetData['spent'],
            'percentage' => $budgetData['percentage'],
            'action_url' => route('budgets.show', $budgetData['id']),
        ]);
    }

    public function sendTransactionApproved(User $user, array $transactionData)
    {
        return $this->send($user, 'transaction_approved', [
            'transaction_title' => $transactionData['title'],
            'amount' => $transactionData['amount'],
            'category' => $transactionData['category'],
            'action_url' => route('transactions.show', $transactionData['id']),
        ]);
    }

    public function sendTransactionRejected(User $user, array $transactionData)
    {
        return $this->send($user, 'transaction_rejected', [
            'transaction_title' => $transactionData['title'],
            'amount' => $transactionData['amount'],
            'reason' => $transactionData['reason'],
            'action_url' => route('transactions.show', $transactionData['id']),
        ]);
    }

    public function sendSuspiciousActivity(User $user, array $alertData)
    {
        return $this->send($user, 'suspicious_activity', [
            'activity_type' => $alertData['type'],
            'description' => $alertData['description'],
            'severity' => $alertData['severity'],
            'action_url' => route('fraud-alerts.show', $alertData['id']),
        ], ['database', 'email']);
    }

    public function sendReportGenerated(User $user, array $reportData)
    {
        return $this->send($user, 'report_generated', [
            'report_name' => $reportData['name'],
            'report_type' => $reportData['type'],
            'period' => $reportData['period'],
            'action_url' => route('reports.download', $reportData['id']),
        ]);
    }

    public function sendPasswordChanged(User $user)
    {
        return $this->send($user, 'password_changed', [
            'user_name' => $user->full_name,
            'changed_at' => now()->format('M d, Y H:i'),
        ], ['database', 'email']);
    }

    public function sendWelcomeEmail(User $user)
    {
        return $this->send($user, 'welcome', [
            'user_name' => $user->full_name,
            'company_name' => $user->company->name,
            'login_url' => route('login'),
        ], ['database', 'email']);
    }

    // Enterprise notification methods
    public function sendSystemAlert(string $title, string $message, string $level = 'info', array $context = [], $recipients = null): void
    {
        try {
            $job = new \App\Jobs\SendSystemAlertJob($title, $message, $level, $context, ['database', 'mail'], $recipients);
            dispatch($job)->onQueue('notifications');

            Log::channel('notifications')->info('System alert queued', [
                'title' => $title,
                'level' => $level,
            ]);

        } catch (\Exception $e) {
            Log::channel('errors')->error('Failed to queue system alert', [
                'title' => $title,
                'level' => $level,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function sendCriticalAlert(string $title, string $message, array $context = []): void
    {
        $this->sendSystemAlert($title, $message, 'critical', $context);
    }

    public function sendQueueFailureAlert(string $jobId, string $queue, \Exception $exception): void
    {
        try {
            $adminUsers = User::role('Admin')->get();
            
            foreach ($adminUsers as $admin) {
                $admin->notify(new \App\Notifications\QueueFailure($jobId, $queue, $exception));
            }

            Log::channel('notifications')->error('Queue failure alert sent', [
                'job_id' => $jobId,
                'queue' => $queue,
                'exception' => $exception->getMessage(),
            ]);

        } catch (\Exception $e) {
            Log::channel('critical')->critical('Failed to send queue failure alert', [
                'error' => $e->getMessage(),
                'job_id' => $jobId,
                'queue' => $queue,
            ]);
        }
    }

    public function sendBudgetExceededAlert($budget, $spent, $percentage, $category = null): void
    {
        try {
            $users = User::whereHas('roles', function ($query) {
                $query->whereIn('name', ['Admin', 'Manager']);
            })->get();

            foreach ($users as $user) {
                $user->notify(new \App\Notifications\BudgetExceeded($budget, $spent, $percentage, $category));
            }

            Log::channel('notifications')->info('Budget exceeded alerts sent', [
                'budget_id' => $budget->id ?? null,
                'percentage' => $percentage,
                'recipients_count' => $users->count(),
            ]);

        } catch (\Exception $e) {
            Log::channel('errors')->error('Failed to send budget exceeded alerts', [
                'error' => $e->getMessage(),
                'budget_id' => $budget->id ?? null,
            ]);
        }
    }

    public function sendSecurityAlert(string $message, array $context = []): void
    {
        $this->sendSystemAlert(
            'Security Alert',
            $message,
            'warning',
            array_merge($context, ['type' => 'security'])
        );
    }

    public function sendMaintenanceAlert(string $message, \DateTime $scheduledAt): void
    {
        try {
            $allUsers = User::all();

            $job = new \App\Jobs\SendSystemAlertJob(
                'Scheduled Maintenance',
                $message,
                'info',
                [
                    'scheduled_at' => $scheduledAt->format('Y-m-d H:i:s'),
                    'message' => $message,
                ],
                ['database', 'mail'],
                $allUsers
            );
            dispatch($job)->onQueue('notifications');

        } catch (\Exception $e) {
            Log::channel('errors')->error('Failed to send maintenance alert', [
                'error' => $e->getMessage(),
                'scheduled_at' => $scheduledAt->format('Y-m-d H:i:s'),
            ]);
        }
    }
}
