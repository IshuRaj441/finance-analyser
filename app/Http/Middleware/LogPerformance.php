<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class LogPerformance
{
    public function handle(Request $request, Closure $next)
    {
        $startTime = microtime(true);
        
        $response = $next($request);
        
        $duration = round((microtime(true) - $startTime) * 1000, 2);
        
        // Log slow requests (> 1 second)
        if ($duration > 1000) {
            Log::channel('performance')->warning('Slow request detected', [
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'duration_ms' => $duration,
                'user_id' => auth()->id(),
                'ip' => $request->ip(),
                'queries' => DB::getQueryLog(),
            ]);
        } else {
            Log::channel('performance')->info('Request processed', [
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'duration_ms' => $duration,
                'user_id' => auth()->id(),
                'ip' => $request->ip(),
            ]);
        }
        
        // Add performance headers
        $response->headers->set('X-Response-Time', $duration . 'ms');
        
        return $response;
    }
}
