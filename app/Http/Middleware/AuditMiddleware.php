<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\AuditLog;
use App\Models\User;
use Carbon\Carbon;

class AuditMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Only audit authenticated requests
        if (!Auth::check()) {
            return $response;
        }

        $user = Auth::user();
        $method = $request->method();
        $route = $request->route();
        
        // Skip certain routes that don't need auditing
        $skipRoutes = [
            'dashboard',
            'notifications.*',
            'auth.me',
            'audit-logs.*',
        ];

        if ($route && $this->shouldSkipRoute($route->getName(), $skipRoutes)) {
            return $response;
        }

        // Only audit state-changing requests
        if (!in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            return $response;
        }

        $this->logRequest($request, $user, $response);

        return $response;
    }

    private function shouldSkipRoute($routeName, $skipRoutes)
    {
        if (!$routeName) {
            return false;
        }

        foreach ($skipRoutes as $pattern) {
            if (str_ends_with($pattern, '.*')) {
                $basePattern = str_replace('.*', '', $pattern);
                if (str_starts_with($routeName, $basePattern)) {
                    return true;
                }
            } elseif ($routeName === $pattern) {
                return true;
            }
        }

        return false;
    }

    private function logRequest(Request $request, User $user, $response)
    {
        try {
            $route = $request->route();
            $routeName = $route ? $route->getName() : 'unknown';
            $action = $this->determineAction($request, $routeName);
            $entityType = $this->determineEntityType($request, $routeName);
            $entityId = $this->getEntityId($request);

            // Get old values for updates
            $oldValues = null;
            $newValues = null;

            if ($request->method() === 'PUT' || $request->method() === 'PATCH') {
                $oldValues = $this->getOldValues($entityType, $entityId);
                $newValues = $this->getNewValues($request, $entityType);
            } elseif ($request->method() === 'POST') {
                $newValues = $this->getNewValues($request, $entityType);
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
                'description' => $this->generateDescription($action, $entityType, $entityId, $user),
            ]);

        } catch (\Exception $e) {
            // Log the error but don't break the application
            \Log::error('Audit logging failed: ' . $e->getMessage(), [
                'request' => $request->fullUrl(),
                'user_id' => $user->id,
                'exception' => $e,
            ]);
        }
    }

    private function determineAction(Request $request, $routeName)
    {
        $method = $request->method();
        
        if ($method === 'POST') {
            return 'CREATE';
        } elseif ($method === 'PUT' || $method === 'PATCH') {
            return 'UPDATE';
        } elseif ($method === 'DELETE') {
            return 'DELETE';
        }

        return strtoupper($method);
    }

    private function determineEntityType(Request $request, $routeName)
    {
        if (!$routeName) {
            return 'Unknown';
        }

        // Extract entity type from route name
        $parts = explode('.', $routeName);
        
        if (count($parts) >= 2) {
            $entityType = $parts[1];
            
            // Convert to singular and capitalize
            $entityType = rtrim($entityType, 's'); // Remove trailing 's' for plural
            $entityType = ucfirst(strtolower($entityType));
            
            return $entityType;
        }

        return 'Unknown';
    }

    private function getEntityId(Request $request)
    {
        // Get ID from route parameters
        $id = $request->route('id');
        
        if ($id) {
            return $id;
        }

        // Try other common parameter names
        foreach (['transaction_id', 'budget_id', 'category_id', 'user_id', 'report_id'] as $param) {
            if ($request->route($param)) {
                return $request->route($param);
            }
        }

        return null;
    }

    private function getOldValues($entityType, $entityId)
    {
        if (!$entityId || !$entityType) {
            return null;
        }

        try {
            $modelClass = $this->getModelClass($entityType);
            
            if ($modelClass && class_exists($modelClass)) {
                $model = $modelClass::find($entityId);
                
                if ($model) {
                    return $model->toArray();
                }
            }
        } catch (\Exception $e) {
            \Log::error('Failed to get old values for audit: ' . $e->getMessage());
        }

        return null;
    }

    private function getNewValues(Request $request, $entityType)
    {
        $data = $request->all();
        
        // Remove sensitive data
        $sensitiveFields = ['password', 'password_confirmation', 'current_password', 'token', 'secret'];
        
        foreach ($sensitiveFields as $field) {
            if (isset($data[$field])) {
                $data[$field] = '[REDACTED]';
            }
        }

        // Remove files from audit data
        unset($data['file'], $data['attachment'], $data['image']);

        return $data;
    }

    private function getModelClass($entityType)
    {
        $modelMap = [
            'Transaction' => 'App\Models\Transaction',
            'Budget' => 'App\Models\Budget',
            'Category' => 'App\Models\Category',
            'User' => 'App\Models\User',
            'Company' => 'App\Models\Company',
            'Report' => 'App\Models\Report',
            'Notification' => 'App\Models\Notification',
            'AuditLog' => 'App\Models\AuditLog',
            'FraudAlert' => 'App\Models\FraudAlert',
            'Integration' => 'App\Models\Integration',
            'Backup' => 'App\Models\Backup',
            'File' => 'App\Models\File',
        ];

        return $modelMap[$entityType] ?? null;
    }

    private function generateDescription($action, $entityType, $entityId, $user)
    {
        $actionLower = strtolower($action);
        $entityLower = strtolower($entityType);
        
        $descriptions = [
            'CREATE' => "User {$user->email} created new {$entityLower}" . ($entityId ? " #{$entityId}" : ""),
            'UPDATE' => "User {$user->email} updated {$entityLower}" . ($entityId ? " #{$entityId}" : ""),
            'DELETE' => "User {$user->email} deleted {$entityLower}" . ($entityId ? " #{$entityId}" : ""),
        ];

        return $descriptions[$action] ?? "User {$user->email} performed {$actionLower} on {$entityLower}" . ($entityId ? " #{$entityId}" : "");
    }
}
