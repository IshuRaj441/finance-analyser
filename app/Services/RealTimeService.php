<?php

namespace App\Services;

use App\Models\User;
use App\Models\Transaction;
use App\Models\Notification;
use App\Models\Budget;
use App\Events\TransactionCreated;
use App\Events\TransactionUpdated;
use App\Events\TransactionApproved;
use App\Events\TransactionRejected;
use App\Events\BudgetExceeded;
use App\Events\FraudAlertCreated;
use App\Events\NotificationCreated;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;

class RealTimeService
{
    public function broadcastTransactionCreated(Transaction $transaction): void
    {
        try {
            $event = new TransactionCreated($transaction);
            broadcast($event)->toOthers();
            
            Log::info('Transaction creation broadcasted', [
                'transaction_id' => $transaction->id,
                'company_id' => $transaction->company_id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to broadcast transaction creation', [
                'transaction_id' => $transaction->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function broadcastTransactionUpdated(Transaction $transaction): void
    {
        try {
            $event = new TransactionUpdated($transaction);
            broadcast($event)->toOthers();
            
            Log::info('Transaction update broadcasted', [
                'transaction_id' => $transaction->id,
                'company_id' => $transaction->company_id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to broadcast transaction update', [
                'transaction_id' => $transaction->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function broadcastTransactionApproved(Transaction $transaction): void
    {
        try {
            $event = new TransactionApproved($transaction);
            broadcast($event)->toOthers();
            
            // Also send to the transaction creator specifically
            $channel = "user.{$transaction->user_id}";
            broadcast($event)->to($channel);
            
            Log::info('Transaction approval broadcasted', [
                'transaction_id' => $transaction->id,
                'user_id' => $transaction->user_id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to broadcast transaction approval', [
                'transaction_id' => $transaction->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function broadcastTransactionRejected(Transaction $transaction): void
    {
        try {
            $event = new TransactionRejected($transaction);
            broadcast($event)->toOthers();
            
            // Also send to the transaction creator specifically
            $channel = "user.{$transaction->user_id}";
            broadcast($event)->to($channel);
            
            Log::info('Transaction rejection broadcasted', [
                'transaction_id' => $transaction->id,
                'user_id' => $transaction->user_id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to broadcast transaction rejection', [
                'transaction_id' => $transaction->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function broadcastBudgetExceeded(Budget $budget, array $details): void
    {
        try {
            $event = new BudgetExceeded($budget, $details);
            broadcast($event)->toOthers();
            
            // Send to budget owner specifically
            $channel = "user.{$budget->user_id}";
            broadcast($event)->to($channel);
            
            // Send to managers for approval
            $managerChannel = "company.{$budget->company_id}.managers";
            broadcast($event)->to($managerChannel);
            
            Log::info('Budget exceeded broadcasted', [
                'budget_id' => $budget->id,
                'user_id' => $budget->user_id,
                'company_id' => $budget->company_id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to broadcast budget exceeded', [
                'budget_id' => $budget->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function broadcastFraudAlert($fraudAlert): void
    {
        try {
            $event = new FraudAlertCreated($fraudAlert);
            broadcast($event)->toOthers();
            
            // Send to managers specifically
            $channel = "company.{$fraudAlert->company_id}.managers";
            broadcast($event)->to($channel);
            
            Log::info('Fraud alert broadcasted', [
                'alert_id' => $fraudAlert->id,
                'company_id' => $fraudAlert->company_id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to broadcast fraud alert', [
                'alert_id' => $fraudAlert->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function broadcastNotification(Notification $notification): void
    {
        try {
            $event = new NotificationCreated($notification);
            
            // Send to specific user
            $channel = "user.{$notification->notifiable_id}";
            broadcast($event)->to($channel);
            
            Log::info('Notification broadcasted', [
                'notification_id' => $notification->id,
                'user_id' => $notification->notifiable_id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to broadcast notification', [
                'notification_id' => $notification->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function broadcastDashboardUpdate(int $companyId, array $data): void
    {
        try {
            // Custom dashboard update event
            $event = new \App\Events\DashboardUpdated($companyId, $data);
            broadcast($event)->to("company.{$companyId}.dashboard");
            
            Log::info('Dashboard update broadcasted', [
                'company_id' => $companyId,
                'data_keys' => array_keys($data),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to broadcast dashboard update', [
                'company_id' => $companyId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function broadcastUserActivity(User $user, string $activity, array $data = []): void
    {
        try {
            $event = new \App\Events\UserActivity($user, $activity, $data);
            broadcast($event)->to("company.{$user->company_id}.activity");
            
            Log::info('User activity broadcasted', [
                'user_id' => $user->id,
                'activity' => $activity,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to broadcast user activity', [
                'user_id' => $user->id,
                'activity' => $activity,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function authenticateChannel(User $user, string $channel): bool
    {
        try {
            // Check if user has access to the requested channel
            if ($channel === "user.{$user->id}") {
                return true;
            }
            
            if ($channel === "company.{$user->company_id}.dashboard") {
                return true;
            }
            
            if ($channel === "company.{$user->company_id}.activity") {
                return true;
            }
            
            if ($channel === "company.{$user->company_id}.managers") {
                return $user->hasAnyRole(['Admin', 'Manager']);
            }
            
            return false;
        } catch (\Exception $e) {
            Log::error('Channel authentication failed', [
                'user_id' => $user->id,
                'channel' => $channel,
                'error' => $e->getMessage(),
            ]);
            
            return false;
        }
    }

    public function getActiveConnections(int $companyId): array
    {
        try {
            // This would integrate with your WebSocket server to get active connections
            // For now, return a placeholder structure
            
            return [
                'total_connections' => 0,
                'user_connections' => [],
                'channels' => [
                    "company.{$companyId}.dashboard",
                    "company.{$companyId}.activity",
                    "company.{$companyId}.managers",
                ],
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get active connections', [
                'company_id' => $companyId,
                'error' => $e->getMessage(),
            ]);
            
            return [];
        }
    }

    public function sendRealTimeUpdate(string $channel, string $event, array $data): void
    {
        try {
            // Send real-time update to specific channel
            Broadcast::channel($channel, function ($user, $data) use ($event, $data) {
                return [
                    'event' => $event,
                    'data' => $data,
                    'timestamp' => now()->toISOString(),
                ];
            });
            
            Log::info('Real-time update sent', [
                'channel' => $channel,
                'event' => $event,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send real-time update', [
                'channel' => $channel,
                'event' => $event,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function broadcastSystemMaintenance(string $message, \DateTime $scheduledAt): void
    {
        try {
            $event = new \App\Events\SystemMaintenance($message, $scheduledAt);
            broadcast($event)->toOthers();
            
            Log::info('System maintenance broadcasted', [
                'message' => $message,
                'scheduled_at' => $scheduledAt->toISOString(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to broadcast system maintenance', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function broadcastCompanyAnnouncement(int $companyId, string $title, string $message): void
    {
        try {
            $event = new \App\Events\CompanyAnnouncement($companyId, $title, $message);
            broadcast($event)->to("company.{$companyId}");
            
            Log::info('Company announcement broadcasted', [
                'company_id' => $companyId,
                'title' => $title,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to broadcast company announcement', [
                'company_id' => $companyId,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
