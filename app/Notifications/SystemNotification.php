<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;

class SystemNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject($this->data['title'])
            ->greeting('Hello ' . $notifiable->first_name . '!')
            ->line($this->data['message'])
            ->action('View Details', $this->data['action_url'] ?? null)
            ->line('Thank you for using our application!');
    }

    public function toDatabase($notifiable)
    {
        return new DatabaseMessage([
            'title' => $this->data['title'],
            'message' => $this->data['message'],
            'action_url' => $this->data['action_url'] ?? null,
            'icon' => $this->data['icon'] ?? 'bell',
            'priority' => $this->data['priority'] ?? 'normal',
        ]);
    }
}
