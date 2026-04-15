<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Jobs\SendSystemAlertJob;
use App\Notifications\QueueFailure;

class MonitorQueueHealthJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 1;
    public $maxExceptions = 1;

    public function handle(): void
    {
        $this->checkQueueSizes();
        $this->checkFailedJobs();
        $this->checkWorkerHealth();
    }

    private function checkQueueSizes(): void
    {
        $queues = ['default', 'critical', 'high', 'low', 'notifications'];
        $thresholds = [
            'critical' => 50,
            'high' => 100,
            'default' => 500,
            'low' => 1000,
            'notifications' => 200,
        ];

        foreach ($queues as $queue) {
            $size = Queue::size($queue);
            $threshold = $thresholds[$queue] ?? 500;

            if ($size > $threshold) {
                SendSystemAlertJob::dispatch(
                    'High Queue Size Alert',
                    "Queue '{$queue}' has {$size} pending jobs (threshold: {$threshold})",
                    'warning',
                    [
                        'queue' => $queue,
                        'size' => $size,
                        'threshold' => $threshold,
                    ],
                    ['database', 'mail']
                )->onQueue('notifications');
            }
        }
    }

    private function checkFailedJobs(): void
    {
        try {
            $failedCount = DB::table('failed_jobs')->count();
            $recentFailures = DB::table('failed_jobs')
                ->where('failed_at', '>', now()->subMinutes(30))
                ->count();

            // Alert if there are too many failed jobs
            if ($failedCount > 100) {
                SendSystemAlertJob::dispatch(
                    'High Failed Jobs Count',
                    "There are {$failedCount} failed jobs in the system",
                    'error',
                    [
                        'total_failed' => $failedCount,
                        'recent_failures' => $recentFailures,
                    ],
                    ['database', 'mail']
                )->onQueue('notifications');
            }

            // Alert for recent failures
            if ($recentFailures > 10) {
                SendSystemAlertJob::dispatch(
                    'Recent Queue Failures',
                    "{$recentFailures} jobs have failed in the last 30 minutes",
                    'warning',
                    [
                        'recent_failures' => $recentFailures,
                        'timeframe' => '30 minutes',
                    ],
                    ['database', 'mail']
                )->onQueue('notifications');
            }

        } catch (\Exception $e) {
            Log::channel('errors')->error('Failed to check failed jobs', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function checkWorkerHealth(): void
    {
        try {
            // Check if workers are processing jobs
            $recentJobs = DB::table('jobs')
                ->where('created_at', '>', now()->subMinutes(5))
                ->count();

            if ($recentJobs > 50) {
                SendSystemAlertJob::dispatch(
                    'High Job Creation Rate',
                    "{$recentJobs} jobs created in the last 5 minutes",
                    'info',
                    [
                        'job_count' => $recentJobs,
                        'timeframe' => '5 minutes',
                    ],
                    ['database']
                )->onQueue('notifications');
            }

        } catch (\Exception $e) {
            Log::channel('errors')->error('Failed to check worker health', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
