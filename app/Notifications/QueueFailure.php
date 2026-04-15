<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\SlackMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;

class QueueFailure extends Notification implements ShouldQueue
{
    use Queueable;

    public $jobId;
    public $queue;
    public $exception;
    public $payload;

    public function __construct(string $jobId, string $queue, \Exception $exception, array $payload = [])
    {
        $this->jobId = $jobId;
        $this->queue = $queue;
        $this->exception = $exception;
        $this->payload = $payload;
    }

    public function via($notifiable): array
    {
        return ['database', 'mail', 'slack'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('🚨 Queue Job Failure - Finance Analyser')
            ->error()
            ->greeting('Queue Job Failure Detected')
            ->line('A queue job has failed and requires attention.')
            ->line('**Job Details:**')
            ->line("- Job ID: {$this->jobId}")
            ->line("- Queue: {$this->queue}")
            ->line("- Exception: {$this->exception->getMessage()}")
            ->line("- Time: " . now()->format('Y-m-d H:i:s'))
            ->action('View in Horizon', url('/horizon'))
            ->line('Please investigate this failure and take appropriate action.');
    }

    public function toSlack($notifiable): SlackMessage
    {
        return (new SlackMessage)
            ->error()
            ->content('🚨 Queue Job Failure')
            ->attachment(function ($attachment) {
                $attachment
                    ->title('Job Failure Details')
                    ->fields([
                        'Job ID' => $this->jobId,
                        'Queue' => $this->queue,
                        'Exception' => $this->exception->getMessage(),
                        'Time' => now()->format('Y-m-d H:i:s'),
                    ])
                    ->markdown(['text']);
            });
    }

    public function toDatabase($notifiable): DatabaseMessage
    {
        return new DatabaseMessage([
            'title' => 'Queue Job Failure',
            'message' => "Job {$this->jobId} on queue {$this->queue} failed: {$this->exception->getMessage()}",
            'level' => 'error',
            'type' => 'queue_failure',
            'context' => [
                'job_id' => $this->jobId,
                'queue' => $this->queue,
                'exception' => $this->exception->getMessage(),
                'trace' => $this->exception->getTraceAsString(),
                'payload' => $this->payload,
            ],
        ]);
    }
}
