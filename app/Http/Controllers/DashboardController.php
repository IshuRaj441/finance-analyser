<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\AIService;
use App\Traits\ApiResponse;

class DashboardController extends Controller
{
    use ApiResponse;

    protected $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $data = [
            'user' => $user->load('roles', 'permissions'),
            'company' => $user->company,
            'stats' => [
                'total_transactions' => 0,
                'pending_transactions' => 0,
                'total_budgets' => 0,
                'active_budgets' => 0,
            ],
            'recent_activities' => [],
        ];

        return $this->success($data);
    }

    public function summary(Request $request): JsonResponse
    {
        return $this->success([
            'revenue' => 0,
            'expenses' => 0,
            'profit' => 0,
            'transaction_count' => 0,
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'preferences' => 'nullable|array',
            'widgets' => 'nullable|array',
        ]);

        $user = $request->user();
        $user->update(['preferences' => $validated]);

        return $this->success(null, 'Dashboard settings updated');
    }

    public function getWidgets(Request $request): JsonResponse
    {
        return $this->success([
            'widgets' => [
                ['id' => 'transactions', 'title' => 'Recent Transactions', 'type' => 'table'],
                ['id' => 'budgets', 'title' => 'Budget Overview', 'type' => 'chart'],
                ['id' => 'reports', 'title' => 'Financial Reports', 'type' => 'list'],
            ]
        ]);
    }

    public function aiChat(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $user = $request->user();
        $result = $this->aiService->chatWithAI($user, $request->input('message'));

        if ($result['success']) {
            return $this->success([
                'response' => $result['response'],
                'context_used' => $result['context_used'] ?? null,
            ]);
        }

        return $this->error($result['error'] ?? 'AI service unavailable', 500);
    }

    public function aiAnalyze(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'nullable|integer|min:7|max:365',
        ]);

        $user = $request->user();
        $period = $request->input('period', 30);
        
        $result = $this->aiService->analyzeSpending($user, $period);

        if ($result['success']) {
            return $this->success($result);
        }

        return $this->error($result['error'] ?? 'AI analysis unavailable', 500);
    }

    public function aiPredict(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $result = $this->aiService->predictNextMonthSpending($user);

        if ($result['success']) {
            return $this->success($result);
        }

        return $this->error($result['error'] ?? 'AI prediction unavailable', 500);
    }

    public function aiRecommendations(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $result = $this->aiService->getBudgetRecommendations($user);

        if ($result['success']) {
            return $this->success($result);
        }

        return $this->error($result['error'] ?? 'AI recommendations unavailable', 500);
    }
}
