<?php

namespace App\Http\Controllers;

use App\Services\AIService;
use App\Http\Requests\AIChatRequest;
use App\Http\Requests\AIAnalysisRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AIController extends Controller
{
    use ApiResponse;

    protected $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function chat(AIChatRequest $request): JsonResponse
    {
        $user = $request->user();
        $message = $request->get('message');

        $result = $this->aiService->chatWithAI($user, $message);

        if ($result['success']) {
            return $this->success($result, 'AI response generated successfully');
        }

        $errorMessage = $result['error'] ?? 'AI service unavailable';
        $statusCode = 503;
        
        // Check if it's a quota issue
        if (strpos($errorMessage, 'quota') !== false || strpos($errorMessage, 'insufficient_quota') !== false) {
            $errorMessage = 'AI service quota exceeded. Please check your OpenRouter billing.';
            $statusCode = 429;
        }
        
        return $this->error($errorMessage, $statusCode);
    }

    public function analyzeSpending(AIAnalysisRequest $request): JsonResponse
    {
        $user = $request->user();
        $period = $request->get('period', 30);

        $result = $this->aiService->analyzeSpending($user, $period);

        if ($result['success']) {
            return $this->success($result, 'Spending analysis completed successfully');
        }

        return $this->error($result['error'] ?? 'Analysis service unavailable', 503);
    }

    public function predictSpending(Request $request): JsonResponse
    {
        $user = $request->user();

        $result = $this->aiService->predictNextMonthSpending($user);

        if ($result['success']) {
            return $this->success($result, 'Spending prediction generated successfully');
        }

        return $this->error($result['error'] ?? 'Prediction service unavailable', 503);
    }

    public function budgetRecommendations(Request $request): JsonResponse
    {
        $user = $request->user();

        $result = $this->aiService->getBudgetRecommendations($user);

        if ($result['success']) {
            return $this->success($result, 'Budget recommendations generated successfully');
        }

        return $this->error($result['error'] ?? 'Recommendation service unavailable', 503);
    }

    public function riskAnalysis(Request $request): JsonResponse
    {
        $user = $request->user();

        $result = $this->aiService->analyzeFinancialRisk($user);

        if ($result['success']) {
            return $this->success($result, 'Risk analysis completed successfully');
        }

        return $this->error($result['error'] ?? 'Risk analysis service unavailable', 503);
    }

    public function capabilities(Request $request): JsonResponse
    {
        return $this->success([
            'chat' => [
                'description' => 'Natural language financial queries',
                'examples' => [
                    'Show my expenses for this month',
                    'What are my biggest spending categories?',
                    'How much did I spend on food last week?',
                    'Compare my income vs expenses',
                ],
            ],
            'analysis' => [
                'description' => 'Deep spending pattern analysis',
                'features' => [
                    'Spending trends',
                    'Category breakdowns',
                    'Unusual pattern detection',
                    'Optimization suggestions',
                ],
            ],
            'prediction' => [
                'description' => 'Future spending predictions',
                'features' => [
                    'Next month spending forecast',
                    'Trend analysis',
                    'Seasonal patterns',
                    'Confidence scoring',
                ],
            ],
            'budgets' => [
                'description' => 'Intelligent budget recommendations',
                'features' => [
                    'Budget optimization',
                    'Spending alerts',
                    'Category adjustments',
                    'Savings goals',
                ],
            ],
            'risk' => [
                'description' => 'Financial risk assessment',
                'features' => [
                    'Risk scoring',
                    'Risk factor identification',
                    'Mitigation strategies',
                    'Financial health check',
                ],
            ],
        ], 'AI capabilities information');
    }
}
