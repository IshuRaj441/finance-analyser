<?php

namespace App\Listeners;

use App\Events\BudgetExceeded;
use App\Events\BudgetCreated;
use App\Events\BudgetUpdated;
use App\Services\SocketService;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendBudgetNotification implements ShouldQueue
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
        $budget = $event->budget;
        $companyId = $event->company_id ?? $budget->company_id;

        try {
            if ($event instanceof BudgetExceeded) {
                $percentage = $event->percentage;
                $spent = $event->spent;

                // Send real-time notification
                $this->socketService->sendBudgetExceededNotification($budget->user_id, [
                    'id' => $budget->id,
                    'name' => $budget->name,
                    'amount' => $budget->amount,
                    'spent' => $spent,
                    'percentage' => $percentage,
                ]);

                // Send to all managers and admins in the company
                $this->notificationService->sendToRole('Manager', $companyId, 'budget_exceeded', [
                    'budget_name' => $budget->name,
                    'budget_amount' => $budget->amount,
                    'spent_amount' => $spent,
                    'percentage' => $percentage,
                    'user_name' => $budget->user->name,
                    'action_url' => "/budgets/{$budget->id}",
                ]);

                $this->notificationService->sendToRole('Admin', $companyId, 'budget_exceeded', [
                    'budget_name' => $budget->name,
                    'budget_amount' => $budget->amount,
                    'spent_amount' => $spent,
                    'percentage' => $percentage,
                    'user_name' => $budget->user->name,
                    'action_url' => "/budgets/{$budget->id}",
                ]);

                // Also notify the budget owner
                $this->notificationService->sendBudgetExceeded($budget->user, [
                    'name' => $budget->name,
                    'amount' => $budget->amount,
                    'spent' => $spent,
                    'percentage' => $percentage,
                    'action_url' => "/budgets/{$budget->id}",
                ]);

            } elseif ($event instanceof BudgetCreated) {
                $this->socketService->broadcastBudget($companyId, [
                    'id' => $budget->id,
                    'name' => $budget->name,
                    'amount' => $budget->amount,
                    'category' => $budget->category->name,
                ], 'created');

            } elseif ($event instanceof BudgetUpdated) {
                $this->socketService->broadcastBudget($companyId, [
                    'id' => $budget->id,
                    'name' => $budget->name,
                    'amount' => $budget->amount,
                    'category' => $budget->category->name,
                ], 'updated');
            }

        } catch (\Exception $e) {
            \Log::error('Failed to send budget notification', [
                'event' => get_class($event),
                'budget_id' => $budget->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
