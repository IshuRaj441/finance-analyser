<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class AuditLogMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        if ($this->shouldLog($request)) {
            $this->logRequest($request, $response);
        }

        return $response;
    }

    private function shouldLog(Request $request): bool
    {
        $excludedRoutes = [
            'login',
            'logout',
            'refresh',
            'me',
            'audit-logs',
            'notifications',
            'dashboard',
        ];

        $excludedMethods = ['GET'];

        return !in_array($request->route()->getName(), $excludedRoutes) 
               && !in_array($request->method(), $excludedMethods)
               && !$request->is('api/notifications/*')
               && !$request->is('api/audit-logs/*');
    }

    private function logRequest(Request $request, $response)
    {
        $user = Auth::guard('api')->user();
        $action = $this->getAction($request);
        $entityType = $this->getEntityType($request);
        $entityId = $this->getEntityId($request);

        if (!$user || !$action) {
            return;
        }

        $oldValues = null;
        $newValues = null;

        if ($request->method() === 'PUT' || $request->method() === 'PATCH') {
            $oldValues = $this->getOldValues($entityType, $entityId);
            $newValues = $request->except(['password', 'password_confirmation']);
        }

        if ($request->method() === 'POST') {
            $newValues = $request->except(['password', 'password_confirmation']);
        }

        AuditLog::create([
            'user_id' => $user->id,
            'company_id' => $user->company_id,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'url' => $request->fullUrl(),
            'description' => $this->generateDescription($action, $entityType, $user),
        ]);
    }

    private function getAction(Request $request): ?string
    {
        $method = $request->method();
        $route = $request->route();

        if (!$route) {
            return null;
        }

        $routeName = $route->getName();
        
        if (!$routeName) {
            return $this->getActionFromMethod($method);
        }

        return match (true) {
            str_contains($routeName, 'store') || str_contains($routeName, 'create') => 'create',
            str_contains($routeName, 'update') || str_contains($routeName, 'edit') => 'update',
            str_contains($routeName, 'destroy') || str_contains($routeName, 'delete') => 'delete',
            str_contains($routeName, 'upload') => 'upload',
            str_contains($routeName, 'download') => 'download',
            str_contains($routeName, 'approve') => 'approve',
            str_contains($routeName, 'reject') => 'reject',
            str_contains($routeName, 'export') => 'export',
            str_contains($routeName, 'import') => 'import',
            default => $this->getActionFromMethod($method),
        };
    }

    private function getActionFromMethod(string $method): string
    {
        return match ($method) {
            'POST' => 'create',
            'PUT', 'PATCH' => 'update',
            'DELETE' => 'delete',
            default => 'unknown',
        };
    }

    private function getEntityType(Request $request): string
    {
        $route = $request->route();
        
        if (!$route) {
            return 'Unknown';
        }

        $routeName = $route->getName();
        
        if (!$routeName) {
            return 'Unknown';
        }

        return match (true) {
            str_contains($routeName, 'user') => 'User',
            str_contains($routeName, 'company') => 'Company',
            str_contains($routeName, 'transaction') => 'Transaction',
            str_contains($routeName, 'category') => 'Category',
            str_contains($routeName, 'budget') => 'Budget',
            str_contains($routeName, 'report') => 'Report',
            str_contains($routeName, 'file') => 'File',
            str_contains($routeName, 'backup') => 'Backup',
            str_contains($routeName, 'integration') => 'Integration',
            str_contains($routeName, 'fraud') => 'FraudAlert',
            default => 'Unknown',
        };
    }

    private function getEntityId(Request $request): ?int
    {
        $route = $request->route();
        
        if (!$route) {
            return null;
        }

        $parameters = $route->parameters();
        
        return $parameters['id'] ?? $parameters['transaction'] ?? $parameters['user'] ?? 
               $parameters['company'] ?? $parameters['category'] ?? $parameters['budget'] ?? 
               $parameters['report'] ?? $parameters['file'] ?? $parameters['backup'] ?? 
               $parameters['integration'] ?? $parameters['fraud_alert'] ?? null;
    }

    private function getOldValues(string $entityType, ?int $entityId): ?array
    {
        if (!$entityId) {
            return null;
        }

        $modelClass = match ($entityType) {
            'User' => \App\Models\User::class,
            'Company' => \App\Models\Company::class,
            'Transaction' => \App\Models\Transaction::class,
            'Category' => \App\Models\Category::class,
            'Budget' => \App\Models\Budget::class,
            'Report' => \App\Models\Report::class,
            'File' => \App\Models\File::class,
            'Backup' => \App\Models\Backup::class,
            'Integration' => \App\Models\Integration::class,
            'FraudAlert' => \App\Models\FraudAlert::class,
            default => null,
        };

        if (!$modelClass) {
            return null;
        }

        $model = $modelClass::find($entityId);
        
        if (!$model) {
            return null;
        }

        return $model->toArray();
    }

    private function generateDescription(string $action, string $entityType, User $user): string
    {
        $actionVerb = match ($action) {
            'create' => 'created',
            'update' => 'updated',
            'delete' => 'deleted',
            'upload' => 'uploaded',
            'download' => 'downloaded',
            'approve' => 'approved',
            'reject' => 'rejected',
            'export' => 'exported',
            'import' => 'imported',
            default => 'performed action on',
        };

        return "User {$user->email} {$actionVerb} {$entityType}";
    }
}
