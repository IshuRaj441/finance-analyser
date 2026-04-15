<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use Symfony\Component\HttpFoundation\Response;

class CheckCompanyAccess
{
    use ApiResponse;

    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        $companyId = $request->route('company_id') ?? $request->input('company_id');

        if (!$user) {
            return $this->error('Unauthorized', Response::HTTP_UNAUTHORIZED);
        }

        if (!$companyId) {
            $companyId = $user->company_id;
        }

        if (!$user->canAccessCompany($companyId)) {
            return $this->error('Access denied to this company', Response::HTTP_FORBIDDEN);
        }

        $request->merge(['company_id' => $companyId]);

        return $next($request);
    }
}
