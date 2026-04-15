<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Log;
use Illuminate\Queue\Events\JobFailed;
use Illuminate\Queue\Events\JobProcessed;
use Illuminate\Queue\Events\JobProcessing;
use Illuminate\Support\Facades\Queue;

class LoggingServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Queue job logging
        Queue::before(function (JobProcessing $event) {
            Log::channel('queue')->info('Job started', [
                'job' => $event->job->getJobId(),
                'queue' => $event->job->getQueue(),
                'connection' => $event->connectionName,
                'payload' => $event->job->payload(),
            ]);
        });

        Queue::after(function (JobProcessed $event) {
            Log::channel('queue')->info('Job completed', [
                'job' => $event->job->getJobId(),
                'queue' => $event->job->getQueue(),
                'connection' => $event->connectionName,
            ]);
        });

        Queue::failing(function (JobFailed $event) {
            Log::channel('errors')->error('Job failed', [
                'job' => $event->job->getJobId(),
                'queue' => $event->job->getQueue(),
                'connection' => $event->connectionName,
                'exception' => $event->exception->getMessage(),
                'trace' => $event->exception->getTraceAsString(),
            ]);

            Log::channel('critical')->critical('Critical job failure', [
                'job' => $event->job->getJobId(),
                'queue' => $event->job->getQueue(),
                'exception' => $event->exception->getMessage(),
            ]);
        });
    }
}
