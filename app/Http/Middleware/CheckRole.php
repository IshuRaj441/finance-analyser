<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    use ApiResponse;

    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (!$user) {
            return $this->error('Unauthorized', Response::HTTP_UNAUTHORIZED);
        }

        if (!$user->hasAnyRole($roles)) {
            return $this->error('Insufficient permissions', Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
