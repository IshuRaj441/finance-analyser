<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\IntegrationController;
use App\Http\Controllers\FraudAlertController;
use App\Http\Controllers\HealthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::prefix('v1')->group(function () {
    // Public routes
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

    // Protected routes
    Route::middleware(['auth:api', 'company.access', 'audit.log'])->group(function () {
        // Authentication
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/auth/refresh', [AuthController::class, 'refresh']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::put('/auth/change-password', [AuthController::class, 'changePassword']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
        Route::delete('/auth/delete-account', [AuthController::class, 'deleteAccount']);

        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
        Route::post('/dashboard/settings', [DashboardController::class, 'updateSettings']);
        Route::get('/dashboard/widgets', [DashboardController::class, 'getWidgets']);

        // Transactions
        Route::apiResource('transactions', TransactionController::class);
        Route::post('/transactions/{id}/approve', [TransactionController::class, 'approve'])->middleware('permission:approve_transaction');
        Route::post('/transactions/{id}/reject', [TransactionController::class, 'reject'])->middleware('permission:approve_transaction');
        Route::get('/transactions/pending', [TransactionController::class, 'pending'])->middleware('permission:approve_transaction');
        Route::get('/transactions/my', [TransactionController::class, 'myTransactions']);
        Route::get('/transactions/summary', [TransactionController::class, 'summary']);
        Route::post('/transactions/export', [TransactionController::class, 'export'])->middleware('permission:export_report');
        Route::post('/transactions/import', [TransactionController::class, 'import'])->middleware('permission:import_transactions');
        Route::get('/transactions/duplicates', [TransactionController::class, 'duplicates']);
        Route::post('/transactions/bulk-approve', [TransactionController::class, 'bulkApprove'])->middleware('permission:approve_transaction');
        Route::post('/transactions/bulk-reject', [TransactionController::class, 'bulkReject'])->middleware('permission:approve_transaction');

        // Categories
        Route::apiResource('categories', CategoryController::class);
        Route::get('/categories/expense', [CategoryController::class, 'expenseCategories']);
        Route::get('/categories/income', [CategoryController::class, 'incomeCategories']);
        Route::post('/categories/bulk', [CategoryController::class, 'bulkStore'])->middleware('permission:create_category');

        // Budgets
        Route::apiResource('budgets', BudgetController::class);
        Route::get('/budgets/active', [BudgetController::class, 'active']);
        Route::get('/budgets/summary', [BudgetController::class, 'summary']);
        Route::post('/budgets/{id}/alert', [BudgetController::class, 'updateAlertThreshold']);

        // Reports
        Route::apiResource('reports', ReportController::class);
        Route::post('/reports/generate', [ReportController::class, 'generate'])->middleware('permission:create_report');
        Route::get('/reports/{id}/download', [ReportController::class, 'download'])->middleware('permission:export_report');
        Route::get('/reports/templates', [ReportController::class, 'templates']);
        Route::post('/reports/schedule', [ReportController::class, 'schedule'])->middleware('permission:create_report');

        // Notifications
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::get('/notifications/unread', [NotificationController::class, 'unread']);
        Route::get('/notifications/count', [NotificationController::class, 'count']);
        Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/notifications/{id}', [NotificationController::class, 'delete']);
        Route::get('/notifications/settings', [NotificationController::class, 'settings']);
        Route::put('/notifications/settings', [NotificationController::class, 'updateSettings']);

        // Audit Logs
        Route::get('/audit-logs', [AuditLogController::class, 'index'])->middleware('permission:view_audit_logs');
        Route::get('/audit-logs/export', [AuditLogController::class, 'export'])->middleware('permission:export_audit_logs');
        Route::get('/audit-logs/summary', [AuditLogController::class, 'summary'])->middleware('permission:view_audit_logs');

        // Users (Admin/Manager only)
        Route::middleware(['role:Admin,Manager'])->group(function () {
            Route::apiResource('users', UserController::class);
            Route::put('/users/{id}/role', [UserController::class, 'updateRole'])->middleware('permission:manage_user_roles');
            Route::put('/users/{id}/status', [UserController::class, 'updateStatus']);
            Route::post('/users/{id}/reset-password', [UserController::class, 'resetPassword']);
            Route::get('/users/summary', [UserController::class, 'summary']);
        });

        // Company (Admin only)
        Route::middleware(['role:Admin'])->group(function () {
            Route::apiResource('companies', CompanyController::class);
            Route::put('/companies/{id}/settings', [CompanyController::class, 'updateSettings']);
            Route::post('/companies/{id}/upgrade', [CompanyController::class, 'upgradePlan']);
            Route::get('/companies/{id}/usage', [CompanyController::class, 'usage']);
        });

        // Files
        Route::apiResource('files', FileController::class);
        Route::post('/files/upload', [FileController::class, 'upload'])->middleware('permission:upload_file');
        Route::get('/files/{id}/download', [FileController::class, 'download'])->middleware('permission:download_file');
        Route::delete('/files/{id}', [FileController::class, 'destroy'])->middleware('permission:delete_file');

        // Backups (Admin only)
        Route::middleware(['role:Admin'])->group(function () {
            Route::apiResource('backups', BackupController::class);
            Route::post('/backups/create', [BackupController::class, 'create'])->middleware('permission:create_backup');
            Route::post('/backups/{id}/restore', [BackupController::class, 'restore'])->middleware('permission:restore_backup');
            Route::get('/backups/{id}/download', [BackupController::class, 'download'])->middleware('permission:download_backup');
            Route::post('/backups/schedule', [BackupController::class, 'schedule']);
        });

        // Integrations
        Route::apiResource('integrations', IntegrationController::class)->middleware('permission:manage_integrations');
        Route::post('/integrations/{id}/sync', [IntegrationController::class, 'sync'])->middleware('permission:sync_integrations');
        Route::get('/integrations/{id}/logs', [IntegrationController::class, 'logs']);
        Route::get('/integrations/available', [IntegrationController::class, 'available']);

        // Fraud Alerts
        Route::apiResource('fraud-alerts', FraudAlertController::class)->middleware('permission:view_fraud_alerts');
        Route::put('/fraud-alerts/{id}/resolve', [FraudAlertController::class, 'resolve'])->middleware('permission:manage_fraud_alerts');
        Route::put('/fraud-alerts/{id}/investigate', [FraudAlertController::class, 'investigate'])->middleware('permission:manage_fraud_alerts');
        Route::get('/fraud-alerts/summary', [FraudAlertController::class, 'summary']);
        Route::get('/fraud-alerts/rules', [FraudAlertController::class, 'rules']);
        Route::post('/fraud-alerts/rules', [FraudAlertController::class, 'createRule'])->middleware('permission:manage_fraud_alerts');

        // AI Features
        Route::middleware(['permission:use_ai_features'])->group(function () {
            Route::post('/ai/chat', [DashboardController::class, 'aiChat']);
            Route::post('/ai/analyze', [DashboardController::class, 'aiAnalyze']);
            Route::post('/ai/predict', [DashboardController::class, 'aiPredict']);
            Route::post('/ai/recommendations', [DashboardController::class, 'aiRecommendations']);
        });

        // Settings
        Route::middleware(['permission:manage_settings'])->group(function () {
            Route::get('/settings', [CompanyController::class, 'settings']);
            Route::put('/settings', [CompanyController::class, 'updateSettings']);
            Route::get('/settings/currencies', [CompanyController::class, 'currencies']);
            Route::get('/settings/timezones', [CompanyController::class, 'timezones']);
        });

        // Webhook endpoints
        Route::prefix('webhooks')->group(function () {
            Route::post('/stripe', [IntegrationController::class, 'stripeWebhook']);
            Route::post('/razorpay', [IntegrationController::class, 'razorpayWebhook']);
            Route::post('/paypal', [IntegrationController::class, 'paypalWebhook']);
        });
    });
});

// Health monitoring endpoints (public)
Route::prefix('health')->group(function () {
    Route::get('/', [HealthController::class, 'health']);
    Route::get('/queue', [HealthController::class, 'queueStatus']);
    Route::get('/redis', [HealthController::class, 'redisStatus']);
    Route::get('/database', [HealthController::class, 'databaseStatus']);
});

// Simple health check endpoint (legacy)
Route::get('/health/simple', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toISOString(),
        'version' => '1.0.0',
    ]);
});

// API documentation endpoint
Route::get('/docs', function () {
    return response()->json([
        'name' => 'Finance Analyser API',
        'version' => '1.0.0',
        'description' => 'Enterprise SaaS Financial Management System API',
        'base_url' => config('app.url') . '/api/v1',
        'endpoints' => [
            'authentication' => [
                'POST /auth/login',
                'POST /auth/register',
                'POST /auth/logout',
                'POST /auth/refresh',
                'GET /auth/me',
            ],
            'transactions' => [
                'GET /transactions',
                'POST /transactions',
                'PUT /transactions/{id}',
                'DELETE /transactions/{id}',
                'POST /transactions/{id}/approve',
                'POST /transactions/{id}/reject',
            ],
            'categories' => [
                'GET /categories',
                'POST /categories',
                'PUT /categories/{id}',
                'DELETE /categories/{id}',
            ],
            'budgets' => [
                'GET /budgets',
                'POST /budgets',
                'PUT /budgets/{id}',
                'DELETE /budgets/{id}',
            ],
            'reports' => [
                'GET /reports',
                'POST /reports',
                'GET /reports/{id}/download',
            ],
            'notifications' => [
                'GET /notifications',
                'PUT /notifications/{id}/read',
                'GET /notifications/unread',
            ],
        ],
    ]);
});
