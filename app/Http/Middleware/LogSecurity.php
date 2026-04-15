<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LogSecurity
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);
        
        // Log authentication events
        if ($request->is('login') || $request->is('api/login')) {
            if ($response->getStatusCode() === 200) {
                Log::channel('security')->info('User login successful', [
                    'email' => $request->input('email'),
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);
            } else {
                Log::channel('security')->warning('User login failed', [
                    'email' => $request->input('email'),
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);
            }
        }
        
        // Log suspicious activities
        if ($this->isSuspiciousRequest($request)) {
            Log::channel('security')->warning('Suspicious request detected', [
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'user_id' => auth()->id(),
                'headers' => $request->headers->all(),
            ]);
        }
        
        return $response;
    }
    
    private function isSuspiciousRequest(Request $request): bool
    {
        $suspiciousPatterns = [
            '/\.\./',
            '/<script/i',
            '/javascript:/i',
            '/vbscript:/i',
            '/onload=/i',
            '/onerror=/i',
        ];
        
        foreach ($suspiciousPatterns as $pattern) {
            if (preg_match($pattern, $request->fullUrl())) {
                return true;
            }
        }
        
        // Check for SQL injection patterns
        $sqlPatterns = [
            '/union\s+select/i',
            '/drop\s+table/i',
            '/delete\s+from/i',
            '/insert\s+into/i',
        ];
        
        foreach ($sqlPatterns as $pattern) {
            if (preg_match($pattern, $request->fullUrl())) {
                return true;
            }
        }
        
        return false;
    }
}
