<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class EmailNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $mail = (new MailMessage)
            ->subject($this->data['title'])
            ->greeting('Hello ' . $notifiable->first_name . '!')
            ->line($this->data['message']);

        if (isset($this->data['action_url']) && $this->data['action_url']) {
            $mail->action('View Details', $this->data['action_url']);
        }

        return $mail->line('Thank you for using our Finance Analyser application!');
    }
}
