<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    use ApiResponse;

    public function handle(Request $request, Closure $next, ...$permissions)
    {
        $user = $request->user();

        if (!$user) {
            return $this->error('Unauthorized', Response::HTTP_UNAUTHORIZED);
        }

        if (!$user->hasAnyPermission($permissions)) {
            return $this->error('Insufficient permissions', Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
