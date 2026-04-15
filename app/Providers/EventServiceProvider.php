<?php

namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;
use App\Events\TransactionCreated;
use App\Events\TransactionApproved;
use App\Events\BudgetExceeded;
use App\Listeners\SendTransactionNotification;
use App\Listeners\HandleBudgetAlert;
use App\Listeners\LogUserActivity;
use App\Listeners\SendSystemAlertNotification;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],

        TransactionCreated::class => [
            SendTransactionNotification::class,
            LogUserActivity::class,
        ],

        TransactionApproved::class => [
            SendTransactionNotification::class,
            LogUserActivity::class,
        ],

        BudgetExceeded::class => [
            HandleBudgetAlert::class,
            SendSystemAlertNotification::class,
        ],

        // Queue events for monitoring
        'Illuminate\Queue\Events\JobFailed' => [
            SendSystemAlertNotification::class,
        ],

        'Illuminate\Queue\Events\JobProcessed' => [
            LogUserActivity::class,
        ],

        'Illuminate\Queue\Events\JobProcessing' => [
            LogUserActivity::class,
        ],

        // Security events
        'Illuminate\Auth\Events\Login' => [
            LogUserActivity::class,
        ],

        'Illuminate\Auth\Events\Logout' => [
            LogUserActivity::class,
        ],

        'Illuminate\Auth\Events\Failed' => [
            LogUserActivity::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false; // Set to true if you want auto-discovery
    }
}
