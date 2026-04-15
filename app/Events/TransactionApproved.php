<?php

namespace App\Events;

use App\Models\Transaction;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TransactionApproved implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $transaction;

    public function __construct(Transaction $transaction)
    {
        $this->transaction = $transaction;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("company.{$this->transaction->company_id}.transactions"),
            new PrivateChannel("user.{$this->transaction->user_id}"),
            new PrivateChannel("company.{$this->transaction->company_id}.managers"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'transaction.approved';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->transaction->id,
            'title' => $this->transaction->title,
            'amount' => $this->transaction->amount,
            'type' => $this->transaction->type,
            'category' => [
                'name' => $this->transaction->category->name,
                'color' => $this->transaction->category->color,
            ],
            'user' => [
                'id' => $this->transaction->user->id,
                'name' => $this->transaction->user->full_name,
            ],
            'approved_by' => $this->transaction->approvedBy?->full_name,
            'approved_at' => $this->transaction->approved_at?->toISOString(),
            'transaction_date' => $this->transaction->transaction_date,
        ];
    }
}
