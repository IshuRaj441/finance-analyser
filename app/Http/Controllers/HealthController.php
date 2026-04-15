<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Log;
use Laravel\Horizon\Contracts\JobRepository;
use Laravel\Horizon\Contracts\SupervisorRepository;

class HealthController extends Controller
{
    public function health(): JsonResponse
    {
        $status = 'healthy';
        $checks = [];
        
        // Database health check
        try {
            DB::connection()->getPdo();
            $checks['database'] = [
                'status' => 'healthy',
                'message' => 'Database connection successful',
                'response_time' => $this->measureDatabaseResponseTime(),
            ];
        } catch (\Exception $e) {
            $status = 'unhealthy';
            $checks['database'] = [
                'status' => 'unhealthy',
                'message' => 'Database connection failed: ' . $e->getMessage(),
            ];
        }
        
        // Redis health check
        try {
            $redis = Redis::connection();
            $redis->ping();
            $checks['redis'] = [
                'status' => 'healthy',
                'message' => 'Redis connection successful',
                'response_time' => $this->measureRedisResponseTime(),
                'memory_usage' => $redis->info('memory')['used_memory_human'] ?? 'unknown',
            ];
        } catch (\Exception $e) {
            $status = 'unhealthy';
            $checks['redis'] = [
                'status' => 'unhealthy',
                'message' => 'Redis connection failed: ' . $e->getMessage(),
            ];
        }
        
        // Cache health check
        try {
            Cache::put('health_check', 'ok', 60);
            $cacheValue = Cache::get('health_check');
            
            if ($cacheValue === 'ok') {
                $checks['cache'] = [
                    'status' => 'healthy',
                    'message' => 'Cache system operational',
                ];
            } else {
                throw new \Exception('Cache read/write test failed');
            }
        } catch (\Exception $e) {
            $status = 'unhealthy';
            $checks['cache'] = [
                'status' => 'unhealthy',
                'message' => 'Cache system error: ' . $e->getMessage(),
            ];
        }
        
        // Queue health check
        try {
            $queueSize = Queue::size();
            $checks['queue'] = [
                'status' => 'healthy',
                'message' => 'Queue system operational',
                'pending_jobs' => $queueSize,
            ];
            
            if ($queueSize > 1000) {
                $checks['queue']['warning'] = 'High queue size detected';
            }
        } catch (\Exception $e) {
            $status = 'unhealthy';
            $checks['queue'] = [
                'status' => 'unhealthy',
                'message' => 'Queue system error: ' . $e->getMessage(),
            ];
        }
        
        // Storage health check
        try {
            $testFile = storage_path('app/health_check.txt');
            file_put_contents($testFile, 'health check');
            $content = file_get_contents($testFile);
            unlink($testFile);
            
            if ($content === 'health check') {
                $checks['storage'] = [
                    'status' => 'healthy',
                    'message' => 'File system operational',
                    'disk_space' => $this->getDiskSpace(),
                ];
            } else {
                throw new \Exception('File system read/write test failed');
            }
        } catch (\Exception $e) {
            $status = 'unhealthy';
            $checks['storage'] = [
                'status' => 'unhealthy',
                'message' => 'File system error: ' . $e->getMessage(),
            ];
        }
        
        return response()->json([
            'status' => $status,
            'timestamp' => now()->toISOString(),
            'version' => config('app.version', '1.0.0'),
            'environment' => config('app.env'),
            'checks' => $checks,
        ], $status === 'healthy' ? 200 : 503);
    }
    
    public function queueStatus(): JsonResponse
    {
        $queueData = [];
        
        try {
            // Get queue sizes for different queues
            $queues = ['default', 'critical', 'high', 'low', 'notifications'];
            
            foreach ($queues as $queue) {
                $queueData[$queue] = [
                    'pending' => Queue::size($queue),
                    'failed' => $this->getFailedJobsCount($queue),
                ];
            }
            
            // Get Horizon statistics if available
            if (class_exists(JobRepository::class)) {
                $jobRepository = app(JobRepository::class);
                $supervisorRepository = app(SupervisorRepository::class);
                
                $queueData['horizon'] = [
                    'total_jobs' => $jobRepository->totalRecent(),
                    'failed_jobs' => $jobRepository->totalFailed(),
                    'jobs_per_minute' => $jobRepository->jobsPerMinute(),
                    'supervisors' => collect($supervisorRepository->all())->count(),
                ];
            }
            
            return response()->json([
                'status' => 'success',
                'timestamp' => now()->toISOString(),
                'queues' => $queueData,
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'timestamp' => now()->toISOString(),
            ], 500);
        }
    }
    
    public function redisStatus(): JsonResponse
    {
        try {
            $redis = Redis::connection();
            $info = $redis->info();
            
            return response()->json([
                'status' => 'connected',
                'timestamp' => now()->toISOString(),
                'info' => [
                    'version' => $info['redis_version'] ?? 'unknown',
                    'uptime' => $info['uptime_in_seconds'] ?? 'unknown',
                    'connected_clients' => $info['connected_clients'] ?? 'unknown',
                    'used_memory' => $info['used_memory_human'] ?? 'unknown',
                    'used_memory_peak' => $info['used_memory_peak_human'] ?? 'unknown',
                    'keyspace_hits' => $info['keyspace_hits'] ?? 'unknown',
                    'keyspace_misses' => $info['keyspace_misses'] ?? 'unknown',
                    'total_commands_processed' => $info['total_commands_processed'] ?? 'unknown',
                ],
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'timestamp' => now()->toISOString(),
            ], 500);
        }
    }
    
    public function databaseStatus(): JsonResponse
    {
        try {
            $pdo = DB::connection()->getPdo();
            
            // Get MySQL version
            $version = $pdo->getAttribute(\PDO::ATTR_SERVER_VERSION);
            
            // Get connection stats
            $stats = [
                'connections' => DB::select("SHOW STATUS LIKE 'Connections'")[0]->Value ?? 'unknown',
                'threads_connected' => DB::select("SHOW STATUS LIKE 'Threads_connected'")[0]->Value ?? 'unknown',
                'max_connections' => DB::select("SHOW VARIABLES LIKE 'max_connections'")[0]->Value ?? 'unknown',
            ];
            
            // Get database size
            $databaseSize = DB::select("
                SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'size_mb' 
                FROM information_schema.tables 
                WHERE table_schema = DATABASE()
            ")[0]->size_mb ?? 'unknown';
            
            return response()->json([
                'status' => 'connected',
                'timestamp' => now()->toISOString(),
                'version' => $version,
                'database' => DB::connection()->getDatabaseName(),
                'stats' => $stats,
                'size_mb' => $databaseSize,
                'response_time_ms' => $this->measureDatabaseResponseTime(),
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'timestamp' => now()->toISOString(),
            ], 500);
        }
    }
    
    private function measureDatabaseResponseTime(): float
    {
        $start = microtime(true);
        DB::select('SELECT 1');
        return round((microtime(true) - $start) * 1000, 2);
    }
    
    private function measureRedisResponseTime(): float
    {
        $start = microtime(true);
        Redis::ping();
        return round((microtime(true) - $start) * 1000, 2);
    }
    
    private function getFailedJobsCount(string $queue): int
    {
        try {
            return DB::table('failed_jobs')
                ->where('queue', $queue)
                ->count();
        } catch (\Exception $e) {
            return 0;
        }
    }
    
    private function getDiskSpace(): array
    {
        $total = disk_total_space('/');
        $free = disk_free_space('/');
        $used = $total - $free;
        
        return [
            'total_gb' => round($total / 1024 / 1024 / 1024, 2),
            'free_gb' => round($free / 1024 / 1024 / 1024, 2),
            'used_gb' => round($used / 1024 / 1024 / 1024, 2),
            'usage_percentage' => round(($used / $total) * 100, 2),
        ];
    }
}
