<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Services\NotificationService;

class SendNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [10, 30, 60];
    public $timeout = 30;

    protected $userId;
    protected $type;
    protected $data;
    protected $channels;

    public function __construct(int $userId, string $type, array $data, array $channels = ['database'])
    {
        $this->userId = $userId;
        $this->type = $type;
        $this->data = $data;
        $this->channels = $channels;
    }

    public function handle(NotificationService $notificationService)
    {
        $user = \App\Models\User::find($this->userId);
        
        if (!$user) {
            \Log::warning("User not found for notification job: {$this->userId}");
            return;
        }

        $notificationService->send($user, $this->type, $this->data, $this->channels);
    }

    public function failed(\Throwable $exception)
    {
        \Log::error("Notification job failed for user {$this->userId}, type {$this->type}: " . $exception->getMessage());
    }
}
