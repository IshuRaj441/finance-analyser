<?php

namespace App\Events;

use App\Models\Budget;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BudgetExceeded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $budget;
    public $details;

    public function __construct(Budget $budget, array $details)
    {
        $this->budget = $budget;
        $this->details = $details;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("company.{$this->budget->company_id}.budgets"),
            new PrivateChannel("user.{$this->budget->user_id}"),
            new PrivateChannel("company.{$this->budget->company_id}.managers"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'budget.exceeded';
    }

    public function broadcastWith(): array
    {
        return [
            'budget_id' => $this->budget->id,
            'budget_name' => $this->budget->name,
            'budget_amount' => $this->budget->amount,
            'spent_amount' => $this->budget->spent,
            'remaining_amount' => $this->budget->amount - $this->budget->spent,
            'percentage_used' => ($this->budget->spent / $this->budget->amount) * 100,
            'threshold' => $this->details['threshold'] ?? null,
            'category' => $this->budget->category ? [
                'name' => $this->budget->category->name,
                'color' => $this->budget->category->color,
            ] : null,
            'user' => [
                'id' => $this->budget->user->id,
                'name' => $this->budget->user->full_name,
            ],
            'alert_level' => $this->details['alert_level'] ?? 'warning',
            'created_at' => now()->toISOString(),
        ];
    }
}
