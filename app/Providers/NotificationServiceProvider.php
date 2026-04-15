<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Queue;
use Illuminate\Queue\Events\JobFailed;
use App\Jobs\MonitorQueueHealthJob;
use App\Jobs\SendSystemAlertJob;
use App\Notifications\QueueFailure;

class NotificationServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Schedule queue health monitoring
        Schedule::job(new MonitorQueueHealthJob())
            ->everyFiveMinutes()
            ->description('Monitor queue health and send alerts')
            ->onOneServer();

        // Listen for queue failures
        Queue::failing(function (JobFailed $event) {
            try {
                // Get admin users to notify
                $adminUsers = \App\Models\User::role('Admin')->get();
                
                // Send immediate notification about the failure
                foreach ($adminUsers as $admin) {
                    $admin->notify(new QueueFailure(
                        $event->job->getJobId(),
                        $event->job->getQueue(),
                        $event->exception,
                        $event->job->payload()
                    ));
                }

                // Also send a system alert for critical queues
                if (in_array($event->job->getQueue(), ['critical', 'high'])) {
                    SendSystemAlertJob::dispatch(
                        'Critical Queue Job Failed',
                        "Job on queue '{$event->job->getQueue()}' has failed: {$event->exception->getMessage()}",
                        'critical',
                        [
                            'job_id' => $event->job->getJobId(),
                            'queue' => $event->job->getQueue(),
                            'exception' => $event->exception->getMessage(),
                            'payload' => $event->job->payload(),
                        ],
                        ['database', 'mail', 'slack']
                    )->onQueue('notifications');
                }

            } catch (\Exception $e) {
                \Log::channel('critical')->critical('Failed to handle queue failure notification', [
                    'error' => $e->getMessage(),
                    'original_error' => $event->exception->getMessage(),
                ]);
            }
        });

        // Register notification channels
        $this->registerNotificationChannels();
    }

    private function registerNotificationChannels(): void
    {
        // Custom notification channel registration can be done here
        // For example, custom Slack, SMS, or webhook channels
    }
}
