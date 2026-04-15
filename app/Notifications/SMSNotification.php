<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\NexmoMessage;
use Illuminate\Notifications\Messages\VonageMessage;

class SMSNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function via($notifiable)
    {
        return ['vonage'];
    }

    public function toVonage($notifiable)
    {
        return (new VonageMessage)
            ->content($this->data['message'])
            ->from('FinanceAnalyser');
    }

    public function toNexmo($notifiable)
    {
        return (new NexmoMessage)
            ->content($this->data['message'])
            ->from('FinanceAnalyser');
    }
}
