<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\AuditLog;
use App\Models\User;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\AuditLogExport;

class AuditLogController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyId = $user->company_id;

        $query = AuditLog::query()
            ->where('company_id', $companyId)
            ->with(['user:id,name,email'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('action')) {
            $query->where('action', $request->input('action'));
        }

        if ($request->filled('entity_type')) {
            $query->where('entity_type', $request->input('entity_type'));
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->input('start_date'));
        }

        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->input('end_date'));
        }

        // Pagination
        $perPage = min($request->input('per_page', 20), 100);
        $page = $request->input('page', 1);
        
        $total = $query->count();
        $logs = $query->offset(($page - 1) * $perPage)->limit($perPage)->get();

        $formattedLogs = $logs->map(function ($log) {
            return [
                'id' => $log->id,
                'user' => $log->user ? [
                    'id' => $log->user->id,
                    'name' => $log->user->name,
                    'email' => $log->user->email,
                ] : null,
                'action' => $log->action,
                'entity_type' => $log->entity_type,
                'entity_id' => $log->entity_id,
                'description' => $log->description,
                'ip_address' => $log->ip_address,
                'user_agent' => $log->user_agent,
                'url' => $log->url,
                'old_values' => $log->old_values,
                'new_values' => $log->new_values,
                'changes_summary' => $log->changes_summary,
                'created_at' => $log->created_at->toISOString(),
            ];
        });

        return $this->success([
            'audit_logs' => $formattedLogs,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => ceil($total / $perPage),
            ],
        ]);
    }

    public function export(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'format' => 'required|in:csv,xlsx',
        ]);

        $user = $request->user();
        $companyId = $user->company_id;

        try {
            $query = AuditLog::query()
                ->where('company_id', $companyId)
                ->whereBetween('created_at', [$validated['start_date'], $validated['end_date']])
                ->with(['user:id,name,email']);

            // Apply same filters as index method
            if ($request->filled('action')) {
                $query->where('action', $request->input('action'));
            }

            if ($request->filled('entity_type')) {
                $query->where('entity_type', $request->input('entity_type'));
            }

            if ($request->filled('user_id')) {
                $query->where('user_id', $request->input('user_id'));
            }

            $filename = "audit-logs-{$validated['start_date']}-to-{$validated['end_date']}";
            
            if ($validated['format'] === 'csv') {
                $filename .= '.csv';
                $export = new AuditLogExport($query->get(), 'csv');
            } else {
                $filename .= '.xlsx';
                $export = new AuditLogExport($query->get(), 'xlsx');
            }

            $filePath = 'exports/' . $filename;
            Excel::store($export, $filePath, 'local');

            // Create a temporary URL that expires in 24 hours
            $exportUrl = url('api/v1/audit-logs/download/' . basename($filePath));

            return $this->success([
                'export_url' => $exportUrl,
                'filename' => $filename,
                'expires_at' => now()->addHours(24)->toISOString(),
                'total_records' => $query->count(),
            ], 'Export generated successfully');

        } catch (\Exception $e) {
            return $this->error('Failed to generate export: ' . $e->getMessage(), 500);
        }
    }

    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyId = $user->company_id;

        $totalLogs = AuditLog::where('company_id', $companyId)->count();
        $todayLogs = AuditLog::where('company_id', $companyId)
            ->whereDate('created_at', Carbon::today())
            ->count();

        // Most common actions in the last 30 days
        $mostCommonActions = AuditLog::where('company_id', $companyId)
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->selectRaw('action, COUNT(*) as count')
            ->groupBy('action')
            ->orderByDesc('count')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'action' => $item->action,
                    'count' => $item->count,
                ];
            });

        // User activity in the last 7 days
        $userActivity = AuditLog::where('company_id', $companyId)
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->with(['user:id,name,email'])
            ->get()
            ->groupBy('user_id')
            ->map(function ($logs, $userId) {
                $firstLog = $logs->first();
                return [
                    'user' => $firstLog->user ? [
                        'id' => $firstLog->user->id,
                        'name' => $firstLog->user->name,
                        'email' => $firstLog->user->email,
                    ] : null,
                    'action_count' => $logs->count(),
                    'last_activity' => $logs->max('created_at')->toISOString(),
                ];
            })
            ->sortByDesc('action_count')
            ->take(10)
            ->values();

        // Entity type distribution
        $entityDistribution = AuditLog::where('company_id', $companyId)
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->selectRaw('entity_type, COUNT(*) as count')
            ->groupBy('entity_type')
            ->orderByDesc('count')
            ->get()
            ->map(function ($item) {
                return [
                    'entity_type' => $item->entity_type,
                    'count' => $item->count,
                ];
            });

        // Recent suspicious activities
        $suspiciousActivities = AuditLog::where('company_id', $companyId)
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->whereIn('action', ['DELETE', 'UPDATE'])
            ->whereRaw('JSON_LENGTH(new_values) > 10') // Large changes might be suspicious
            ->with(['user:id,name,email'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'user' => $log->user ? [
                        'id' => $log->user->id,
                        'name' => $log->user->name,
                        'email' => $log->user->email,
                    ] : null,
                    'action' => $log->action,
                    'entity_type' => $log->entity_type,
                    'description' => $log->description,
                    'created_at' => $log->created_at->toISOString(),
                ];
            });

        return $this->success([
            'total_logs' => $totalLogs,
            'today_logs' => $todayLogs,
            'most_common_actions' => $mostCommonActions,
            'user_activity' => $userActivity,
            'entity_distribution' => $entityDistribution,
            'suspicious_activities' => $suspiciousActivities,
        ]);
    }

    public function downloadExport(Request $request, $filename): JsonResponse
    {
        $filePath = storage_path('app/exports/' . $filename);
        
        if (!file_exists($filePath)) {
            return $this->error('Export file not found', 404);
        }

        return response()->download($filePath)->deleteFileAfterSend(true);
    }
}
