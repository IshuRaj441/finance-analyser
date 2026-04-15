<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\SlackMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;

class SystemAlert extends Notification implements ShouldQueue
{
    use Queueable;

    public $title;
    public $message;
    public $level;
    public $context;
    public $channels;

    public function __construct(string $title, string $message, string $level = 'info', array $context = [], array $channels = ['database', 'mail'])
    {
        $this->title = $title;
        $this->message = $message;
        $this->level = $level;
        $this->context = $context;
        $this->channels = $channels;
    }

    public function via($notifiable): array
    {
        return $this->channels;
    }

    public function toMail($notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject($this->title)
            ->line($this->message);

        if (!empty($this->context)) {
            $mail->line('Context:');
            foreach ($this->context as $key => $value) {
                $mail->line("- {$key}: {$value}");
            }
        }

        // Add urgency based on level
        switch ($this->level) {
            case 'critical':
                $mail->action('View Dashboard', url('/admin/dashboard'))
                      ->error();
                break;
            case 'warning':
                $mail->action('Review Issue', url('/admin/logs'))
                      ->warning();
                break;
            default:
                $mail->action('View Details', url('/admin/notifications'));
        }

        return $mail;
    }

    public function toSlack($notifiable): SlackMessage
    {
        $slackMessage = (new SlackMessage)
            ->content($this->message);

        // Set color based on level
        switch ($this->level) {
            case 'critical':
                $slackMessage->error();
                break;
            case 'warning':
                $slackMessage->warning();
                break;
            case 'success':
                $slackMessage->success();
                break;
            default:
                $slackMessage->info();
        }

        if (!empty($this->context)) {
            $fields = [];
            foreach ($this->context as $key => $value) {
                $fields[$key] = is_array($value) ? json_encode($value) : $value;
            }
            $slackMessage->attachment(function ($attachment) use ($fields) {
                $attachment->title($this->title)->fields($fields);
            });
        }

        return $slackMessage;
    }

    public function toDatabase($notifiable): DatabaseMessage
    {
        return new DatabaseMessage([
            'title' => $this->title,
            'message' => $this->message,
            'level' => $this->level,
            'context' => $this->context,
            'type' => 'system_alert',
        ]);
    }
}
