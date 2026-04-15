<?php

namespace App\Listeners;

use App\Events\TransactionCreated;
use App\Events\TransactionUpdated;
use App\Events\TransactionApproved;
use App\Events\TransactionRejected;
use App\Services\SocketService;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendTransactionNotification implements ShouldQueue
{
    protected $socketService;
    protected $notificationService;

    public function __construct(SocketService $socketService, NotificationService $notificationService)
    {
        $this->socketService = $socketService;
        $this->notificationService = $notificationService;
    }

    public function handle($event)
    {
        $transaction = $event->transaction;
        $user = $event->user;
        $companyId = $user->company_id;

        try {
            // Send real-time notification
            if ($event instanceof TransactionCreated) {
                $this->socketService->sendNewTransactionNotification($companyId, [
                    'id' => $transaction->id,
                    'title' => $transaction->title,
                    'amount' => $transaction->amount,
                    'type' => $transaction->type,
                    'category' => $transaction->category->name,
                    'created_at' => $transaction->created_at->toISOString(),
                ]);

                // Store notification for managers/admins
                $this->notificationService->sendToRole('Manager', $companyId, 'new_transaction', [
                    'transaction_title' => $transaction->title,
                    'amount' => $transaction->amount,
                    'category' => $transaction->category->name,
                    'user_name' => $user->name,
                    'action_url' => "/transactions/{$transaction->id}",
                ]);

            } elseif ($event instanceof TransactionApproved) {
                $this->socketService->sendTransactionApprovedNotification($user->id, [
                    'id' => $transaction->id,
                    'title' => $transaction->title,
                    'amount' => $transaction->amount,
                    'category' => $transaction->category->name,
                ]);

                $this->notificationService->sendTransactionApproved($user, [
                    'transaction_title' => $transaction->title,
                    'amount' => $transaction->amount,
                    'category' => $transaction->category->name,
                    'action_url' => "/transactions/{$transaction->id}",
                ]);

            } elseif ($event instanceof TransactionRejected) {
                $this->notificationService->sendTransactionRejected($user, [
                    'transaction_title' => $transaction->title,
                    'amount' => $transaction->amount,
                    'reason' => $transaction->rejection_reason ?? 'No reason provided',
                    'action_url' => "/transactions/{$transaction->id}",
                ]);

            } elseif ($event instanceof TransactionUpdated) {
                $this->socketService->broadcastTransaction($companyId, [
                    'id' => $transaction->id,
                    'title' => $transaction->title,
                    'amount' => $transaction->amount,
                    'status' => $transaction->status,
                ], 'updated');
            }

        } catch (\Exception $e) {
            \Log::error('Failed to send transaction notification', [
                'event' => get_class($event),
                'transaction_id' => $transaction->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
