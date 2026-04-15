<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\SlackMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;

class BudgetExceeded extends Notification implements ShouldQueue
{
    use Queueable;

    public $budget;
    public $spent;
    public $percentage;
    public $category;

    public function __construct($budget, $spent, $percentage, $category = null)
    {
        $this->budget = $budget;
        $this->spent = $spent;
        $this->percentage = $percentage;
        $this->category = $category;
    }

    public function via($notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $categoryName = $this->category ? $this->category->name : 'Budget';
        
        return (new MailMessage)
            ->subject('⚠️ Budget Alert - Finance Analyser')
            ->warning()
            ->greeting('Budget Alert')
            ->line("Your {$categoryName} budget has exceeded the threshold.")
            ->line('**Budget Details:**')
            ->line("- Budget: $" . number_format($this->budget, 2))
            ->line("- Spent: $" . number_format($this->spent, 2))
            ->line("- Usage: " . number_format($this->percentage, 1) . '%')
            ->line("- Period: " . $this->getPeriodText())
            ->action('View Budget Report', url('/reports/budgets'))
            ->line('Consider reviewing your spending or adjusting your budget limits.');
    }

    public function toSlack($notifiable): SlackMessage
    {
        $categoryName = $this->category ? $this->category->name : 'Budget';
        
        return (new SlackMessage)
            ->warning()
            ->content("⚠️ Budget Alert: {$categoryName}")
            ->attachment(function ($attachment) {
                $attachment
                    ->title('Budget Exceeded')
                    ->fields([
                        'Category' => $this->category ? $this->category->name : 'Budget',
                        'Budget' => '$' . number_format($this->budget, 2),
                        'Spent' => '$' . number_format($this->spent, 2),
                        'Usage' => number_format($this->percentage, 1) . '%',
                        'Period' => $this->getPeriodText(),
                    ]);
            });
    }

    public function toDatabase($notifiable): DatabaseMessage
    {
        return new DatabaseMessage([
            'title' => 'Budget Exceeded',
            'message' => "Budget exceeded: {$this->percentage}% used (${$this->spent} of ${$this->budget})",
            'level' => 'warning',
            'type' => 'budget_exceeded',
            'context' => [
                'budget_id' => $this->budget->id ?? null,
                'category_id' => $this->category->id ?? null,
                'budget_amount' => $this->budget,
                'spent_amount' => $this->spent,
                'percentage' => $this->percentage,
            ],
        ]);
    }

    private function getPeriodText(): string
    {
        // This would depend on your budget period logic
        return 'Monthly'; // Adjust based on your budget periods
    }
}
