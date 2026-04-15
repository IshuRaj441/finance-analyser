<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class PermissionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = Auth::guard('api')->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
                'error' => 'Authentication required'
            ], 401);
        }

        if (!$user->hasPermissionTo($permission)) {
            return response()->json([
                'message' => 'Forbidden.',
                'error' => "Permission '{$permission}' required",
                'required_permission' => $permission,
                'user_permissions' => $user->getAllPermissions()->pluck('name')
            ], 403);
        }

        return $next($request);
    }
}
