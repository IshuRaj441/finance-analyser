<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use App\Notifications\SystemAlert;
use App\Models\User;

class SendSystemAlertJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $title;
    public $message;
    public $level;
    public $context;
    public $channels;
    public $recipients;

    public $tries = 3;
    public $backoff = [30, 60, 120];

    public function __construct(string $title, string $message, string $level = 'info', array $context = [], array $channels = ['database'], $recipients = null)
    {
        $this->title = $title;
        $this->message = $message;
        $this->level = $level;
        $this->context = $context;
        $this->channels = $channels;
        $this->recipients = $recipients;
    }

    public function handle(): void
    {
        try {
            $recipients = $this->getRecipients();
            
            if (empty($recipients)) {
                Log::warning('No recipients found for system alert', [
                    'title' => $this->title,
                    'level' => $this->level,
                ]);
                return;
            }

            $notification = new SystemAlert(
                $this->title,
                $this->message,
                $this->level,
                $this->context,
                $this->channels
            );

            Notification::send($recipients, $notification);

            Log::channel('notifications')->info('System alert sent successfully', [
                'title' => $this->title,
                'level' => $this->level,
                'recipients_count' => count($recipients),
                'channels' => $this->channels,
            ]);

        } catch (\Exception $e) {
            Log::channel('errors')->error('Failed to send system alert', [
                'title' => $this->title,
                'level' => $this->level,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    public function failed(\Exception $exception): void
    {
        Log::channel('critical')->critical('System alert job failed permanently', [
            'title' => $this->title,
            'level' => $this->level,
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts(),
        ]);

        // Try to send a critical alert about the failure
        try {
            $adminUsers = User::role('Admin')->get();
            
            Notification::send($adminUsers, new SystemAlert(
                'Critical: Notification System Failure',
                "Failed to send system alert: {$this->title}. Error: {$exception->getMessage()}",
                'critical',
                [
                    'original_title' => $this->title,
                    'original_level' => $this->level,
                    'error' => $exception->getMessage(),
                    'attempts' => $this->attempts(),
                ],
                ['database']
            ));
        } catch (\Exception $fallbackException) {
            Log::channel('critical')->critical('Even fallback notification failed', [
                'error' => $fallbackException->getMessage(),
            ]);
        }
    }

    private function getRecipients()
    {
        if ($this->recipients) {
            return $this->recipients;
        }

        // Default recipients based on alert level
        switch ($this->level) {
            case 'critical':
                return User::role('Admin')->get();
            case 'warning':
                return User::role(['Admin', 'Manager'])->get();
            case 'error':
                return User::role(['Admin', 'Manager'])->get();
            default:
                return User::role('Admin')->get();
        }
    }
}
