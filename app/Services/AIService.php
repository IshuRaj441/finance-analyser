<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\User;
use App\Models\Company;
use App\Models\Budget;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AIService
{
    private $apiKey;
    private $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.openrouter.api_key');
        $this->baseUrl = 'https://openrouter.ai/api/v1';
    }

    public function chatWithAI(User $user, string $message): array
    {
        $context = $this->buildUserContext($user);
        
        $prompt = $this->buildChatPrompt($context, $message);

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}/chat/completions", [
                'model' => 'openai/gpt-3.5-turbo',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => $context['system_prompt']
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => 500,
                'temperature' => 0.7,
            ]);

            if ($response->successful()) {
                $aiResponse = $response->json('choices.0.message.content');
                return [
                    'success' => true,
                    'response' => $aiResponse,
                    'context_used' => $context['summary'],
                ];
            }

            Log::error('OpenRouter API error', [
                'status' => $response->status(),
                'response' => $response->json(),
            ]);

            $errorMsg = 'AI service temporarily unavailable';
            $responseData = $response->json();
            
            if (isset($responseData['error']['message'])) {
                $errorMsg = $responseData['error']['message'];
            }
            
            return [
                'success' => false,
                'error' => $errorMsg,
            ];

        } catch (\Exception $e) {
            Log::error('AI service error', ['error' => $e->getMessage()]);
            
            return [
                'success' => false,
                'error' => 'Failed to process AI request',
            ];
        }
    }

    public function analyzeSpending(User $user, int $period = 30): array
    {
        $transactions = Transaction::where('user_id', $user->id)
            ->where('type', 'expense')
            ->where('status', 'approved')
            ->where('created_at', '>', now()->subDays($period))
            ->get();

        if ($transactions->isEmpty()) {
            return [
                'success' => false,
                'error' => 'Not enough data for analysis',
            ];
        }

        $spendingData = $this->prepareSpendingData($transactions);
        $prompt = $this->buildSpendingAnalysisPrompt($spendingData, $period);

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}/chat/completions", [
                'model' => 'openai/gpt-3.5-turbo',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a financial analyst AI. Provide insights about spending patterns and recommendations.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => 800,
                'temperature' => 0.3,
            ]);

            if ($response->successful()) {
                $analysis = $response->json('choices.0.message.content');
                
                return [
                    'success' => true,
                    'analysis' => $analysis,
                    'data_summary' => [
                        'total_spent' => $transactions->sum('amount'),
                        'transaction_count' => $transactions->count(),
                        'period_days' => $period,
                        'top_categories' => $transactions->groupBy('category.name')
                            ->map->sum('amount')
                            ->sortDesc()
                            ->take(5)
                            ->toArray(),
                    ],
                ];
            }

            return [
                'success' => false,
                'error' => 'Analysis service temporarily unavailable',
            ];

        } catch (\Exception $e) {
            Log::error('Spending analysis error', ['error' => $e->getMessage()]);
            
            return [
                'success' => false,
                'error' => 'Failed to analyze spending',
            ];
        }
    }

    public function predictNextMonthSpending(User $user): array
    {
        $transactions = Transaction::where('user_id', $user->id)
            ->where('type', 'expense')
            ->where('status', 'approved')
            ->where('created_at', '>', now()->subMonths(6))
            ->get();

        if ($transactions->count() < 20) {
            return [
                'success' => false,
                'error' => 'Not enough historical data for prediction',
            ];
        }

        $historicalData = $this->prepareHistoricalData($transactions);
        $prompt = $this->buildPredictionPrompt($historicalData);

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}/chat/completions", [
                'model' => 'openai/gpt-3.5-turbo',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a financial forecasting AI. Predict next month spending based on historical patterns.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => 400,
                'temperature' => 0.2,
            ]);

            if ($response->successful()) {
                $prediction = $response->json('choices.0.message.content');
                
                return [
                    'success' => true,
                    'prediction' => $prediction,
                    'confidence' => $this->calculatePredictionConfidence($historicalData),
                    'historical_summary' => [
                        'months_analyzed' => 6,
                        'average_monthly_spending' => $transactions->sum('amount') / 6,
                        'spending_trend' => $this->calculateSpendingTrend($transactions),
                    ],
                ];
            }

            return [
                'success' => false,
                'error' => 'Prediction service temporarily unavailable',
            ];

        } catch (\Exception $e) {
            Log::error('Spending prediction error', ['error' => $e->getMessage()]);
            
            return [
                'success' => false,
                'error' => 'Failed to generate prediction',
            ];
        }
    }

    public function getBudgetRecommendations(User $user): array
    {
        $budgets = Budget::where('user_id', $user->id)
            ->where('status', 'active')
            ->with('category')
            ->get();

        $transactions = Transaction::where('user_id', $user->id)
            ->where('type', 'expense')
            ->where('status', 'approved')
            ->where('created_at', '>', now()->subDays(90))
            ->get();

        if ($transactions->isEmpty()) {
            return [
                'success' => false,
                'error' => 'Not enough data for recommendations',
            ];
        }

        $budgetData = $this->prepareBudgetData($budgets, $transactions);
        $prompt = $this->buildBudgetRecommendationPrompt($budgetData);

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}/chat/completions", [
                'model' => 'openai/gpt-3.5-turbo',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a budget advisor AI. Provide actionable budget recommendations based on spending patterns.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => 600,
                'temperature' => 0.4,
            ]);

            if ($response->successful()) {
                $recommendations = $response->json('choices.0.message.content');
                
                return [
                    'success' => true,
                    'recommendations' => $recommendations,
                    'budget_health' => $this->calculateBudgetHealth($budgets, $transactions),
                ];
            }

            return [
                'success' => false,
                'error' => 'Recommendation service temporarily unavailable',
            ];

        } catch (\Exception $e) {
            Log::error('Budget recommendations error', ['error' => $e->getMessage()]);
            
            return [
                'success' => false,
                'error' => 'Failed to generate recommendations',
            ];
        }
    }

    public function analyzeFinancialRisk(User $user): array
    {
        $transactions = Transaction::where('user_id', $user->id)
            ->where('created_at', '>', now()->subMonths(12))
            ->get();

        if ($transactions->count() < 10) {
            return [
                'success' => false,
                'error' => 'Not enough data for risk analysis',
            ];
        }

        $riskData = $this->prepareRiskData($transactions, $user);
        $prompt = $this->buildRiskAnalysisPrompt($riskData);

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}/chat/completions", [
                'model' => 'openai/gpt-3.5-turbo',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a financial risk analyst AI. Assess financial risk levels and provide mitigation strategies.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => 700,
                'temperature' => 0.3,
            ]);

            if ($response->successful()) {
                $analysis = $response->json('choices.0.message.content');
                
                return [
                    'success' => true,
                    'risk_analysis' => $analysis,
                    'risk_score' => $this->calculateRiskScore($riskData),
                    'risk_factors' => $this->identifyRiskFactors($riskData),
                ];
            }

            return [
                'success' => false,
                'error' => 'Risk analysis service temporarily unavailable',
            ];

        } catch (\Exception $e) {
            Log::error('Financial risk analysis error', ['error' => $e->getMessage()]);
            
            return [
                'success' => false,
                'error' => 'Failed to analyze financial risk',
            ];
        }
    }

    private function buildUserContext(User $user): array
    {
        $company = $user->company;
        $recentTransactions = Transaction::where('user_id', $user->id)
            ->where('created_at', '>', now()->subDays(30))
            ->get();

        return [
            'system_prompt' => "You are a helpful financial assistant for Finance Analyser. You have access to the user's financial data and can provide insights about their spending, income, budgets, and financial health. Be helpful, accurate, and provide actionable advice.",
            'summary' => [
                'user_name' => $user->full_name,
                'company' => $company->name,
                'role' => $user->roles->first()->name ?? 'User',
                'recent_transactions_count' => $recentTransactions->count(),
                'total_expenses_30_days' => $recentTransactions->where('type', 'expense')->sum('amount'),
                'total_income_30_days' => $recentTransactions->where('type', 'income')->sum('amount'),
            ],
        ];
    }

    private function buildChatPrompt(array $context, string $message): string
    {
        return "User context: " . json_encode($context['summary']) . "\n\nUser question: {$message}\n\nPlease provide a helpful and accurate response based on their financial data.";
    }

    private function prepareSpendingData($transactions): array
    {
        return [
            'total_amount' => $transactions->sum('amount'),
            'transaction_count' => $transactions->count(),
            'average_amount' => $transactions->avg('amount'),
            'by_category' => $transactions->groupBy('category.name')
                ->map(function ($categoryTransactions) {
                    return [
                        'amount' => $categoryTransactions->sum('amount'),
                        'count' => $categoryTransactions->count(),
                        'average' => $categoryTransactions->avg('amount'),
                    ];
                })
                ->toArray(),
            'by_day_of_week' => $transactions->groupBy(function ($t) {
                return $t->created_at->dayOfWeek;
            })->map->sum('amount')->toArray(),
        ];
    }

    private function buildSpendingAnalysisPrompt(array $data, int $period): string
    {
        return "Analyze this spending data for the last {$period} days:\n\n" . 
               json_encode($data, JSON_PRETTY_PRINT) . "\n\n" .
               "Provide insights about:\n" .
               "1. Spending patterns and trends\n" .
               "2. Top spending categories\n" .
               "3. Unusual patterns or concerns\n" .
               "4. Recommendations for optimization\n" .
               "Be specific and actionable.";
    }

    private function prepareHistoricalData($transactions): array
    {
        return $transactions
            ->groupBy(function ($t) {
                return $t->created_at->format('Y-m');
            })
            ->map(function ($monthTransactions) {
                return [
                    'amount' => $monthTransactions->sum('amount'),
                    'count' => $monthTransactions->count(),
                ];
            })
            ->toArray();
    }

    private function buildPredictionPrompt(array $data): string
    {
        return "Based on this historical monthly spending data, predict next month's spending:\n\n" .
               json_encode($data, JSON_PRETTY_PRINT) . "\n\n" .
               "Provide:\n" .
               "1. Predicted amount for next month\n" .
               "2. Confidence level (high/medium/low)\n" .
               "3. Key factors influencing the prediction\n" .
               "4. Any seasonal patterns or trends";
    }

    private function prepareBudgetData($budgets, $transactions): array
    {
        return [
            'budgets' => $budgets->map(function ($budget) use ($transactions) {
                $spent = $transactions
                    ->where('category_id', $budget->category_id)
                    ->sum('amount');
                
                return [
                    'name' => $budget->name,
                    'budgeted' => $budget->amount,
                    'spent' => $spent,
                    'remaining' => $budget->amount - $spent,
                    'percentage_used' => ($spent / $budget->amount) * 100,
                ];
            })->toArray(),
            'total_budgeted' => $budgets->sum('amount'),
            'total_spent' => $transactions->sum('amount'),
        ];
    }

    private function buildBudgetRecommendationPrompt(array $data): string
    {
        return "Analyze this budget data and provide recommendations:\n\n" .
               json_encode($data, JSON_PRETTY_PRINT) . "\n\n" .
               "Provide:\n" .
               "1. Budget health assessment\n" .
               "2. Specific recommendations for each budget\n" .
               "3. Areas where budgets should be adjusted\n" .
               "4. Strategies to stay within budget";
    }

    private function prepareRiskData($transactions, User $user): array
    {
        $income = $transactions->where('type', 'income');
        $expenses = $transactions->where('type', 'expense');

        return [
            'income_summary' => [
                'total' => $income->sum('amount'),
                'average_monthly' => $income->sum('amount') / 12,
                'stability' => $this->calculateIncomeStability($income),
            ],
            'expense_summary' => [
                'total' => $expenses->sum('amount'),
                'average_monthly' => $expenses->sum('amount') / 12,
                'essential_vs_discretionary' => $this->categorizeExpenses($expenses),
            ],
            'ratios' => [
                'savings_rate' => $this->calculateSavingsRate($income, $expenses),
                'debt_to_income' => $this->calculateDebtToIncomeRatio($user),
                'emergency_fund' => $this->calculateEmergencyFundMonths($user),
            ],
        ];
    }

    private function buildRiskAnalysisPrompt(array $data): string
    {
        return "Analyze this financial data and assess risk levels:\n\n" .
               json_encode($data, JSON_PRETTY_PRINT) . "\n\n" .
               "Provide:\n" .
               "1. Overall risk assessment (low/medium/high)\n" .
               "2. Key risk factors\n" .
               "3. Areas of concern\n" .
               "4. Specific recommendations to reduce risk";
    }

    private function calculatePredictionConfidence(array $data): string
    {
        $months = count($data);
        if ($months >= 6) return 'high';
        if ($months >= 4) return 'medium';
        return 'low';
    }

    private function calculateSpendingTrend($transactions): string
    {
        $lastMonth = $transactions->where('created_at', '>', now()->subMonth())->sum('amount');
        $previousMonth = $transactions->where('created_at', '>', now()->subMonths(2))
            ->where('created_at', '<=', now()->subMonth())->sum('amount');

        if ($previousMonth == 0) return 'stable';
        
        $change = (($lastMonth - $previousMonth) / $previousMonth) * 100;
        
        if ($change > 10) return 'increasing';
        if ($change < -10) return 'decreasing';
        return 'stable';
    }

    private function calculateBudgetHealth($budgets, $transactions): array
    {
        $healthy = 0;
        $warning = 0;
        $critical = 0;

        foreach ($budgets as $budget) {
            $spent = $transactions->where('category_id', $budget->category_id)->sum('amount');
            $percentage = ($spent / $budget->amount) * 100;

            if ($percentage <= 80) $healthy++;
            elseif ($percentage <= 100) $warning++;
            else $critical++;
        }

        return compact('healthy', 'warning', 'critical');
    }

    private function calculateRiskScore(array $data): int
    {
        $score = 0;
        
        // Income stability
        if ($data['income_summary']['stability'] === 'low') $score += 30;
        elseif ($data['income_summary']['stability'] === 'medium') $score += 15;
        
        // Savings rate
        if ($data['ratios']['savings_rate'] < 10) $score += 25;
        elseif ($data['ratios']['savings_rate'] < 20) $score += 15;
        
        // Debt to income
        if ($data['ratios']['debt_to_income'] > 40) $score += 20;
        elseif ($data['ratios']['debt_to_income'] > 30) $score += 10;
        
        // Emergency fund
        if ($data['ratios']['emergency_fund'] < 3) $score += 25;
        elseif ($data['ratios']['emergency_fund'] < 6) $score += 10;
        
        return min($score, 100);
    }

    private function identifyRiskFactors(array $data): array
    {
        $factors = [];
        
        if ($data['income_summary']['stability'] === 'low') {
            $factors[] = 'Unstable income pattern';
        }
        
        if ($data['ratios']['savings_rate'] < 10) {
            $factors[] = 'Low savings rate';
        }
        
        if ($data['ratios']['debt_to_income'] > 40) {
            $factors[] = 'High debt-to-income ratio';
        }
        
        if ($data['ratios']['emergency_fund'] < 3) {
            $factors[] = 'Insufficient emergency fund';
        }
        
        return $factors;
    }

    private function calculateIncomeStability($income): string
    {
        $monthly = $income->groupBy(function ($t) {
            return $t->created_at->format('Y-m');
        })->map->sum('amount')->toArray();

        if (count($monthly) < 3) return 'insufficient_data';

        $avg = array_sum($monthly) / count($monthly);
        $variance = array_sum(array_map(function ($month) use ($avg) {
            return pow($month - $avg, 2);
        }, $monthly)) / count($monthly);

        $coefficient = sqrt($variance) / $avg;

        if ($coefficient < 0.1) return 'high';
        if ($coefficient < 0.2) return 'medium';
        return 'low';
    }

    private function categorizeExpenses($expenses): array
    {
        // This would need category classification logic
        // For now, return a basic split
        $essential = $expenses->whereIn('category.name', ['Rent', 'Utilities', 'Groceries'])->sum('amount');
        $discretionary = $expenses->sum('amount') - $essential;

        return [
            'essential' => $essential,
            'discretionary' => $discretionary,
            'essential_percentage' => $expenses->sum('amount') > 0 ? ($essential / $expenses->sum('amount')) * 100 : 0,
        ];
    }

    private function calculateSavingsRate($income, $expenses): float
    {
        $totalIncome = $income->sum('amount');
        $totalExpenses = $expenses->sum('amount');

        return $totalIncome > 0 ? (($totalIncome - $totalExpenses) / $totalIncome) * 100 : 0;
    }

    private function calculateDebtToIncomeRatio(User $user): float
    {
        // This would need debt data integration
        // For now, return a placeholder
        return 25; // 25% debt-to-income ratio
    }

    private function calculateEmergencyFundMonths(User $user): float
    {
        // This would need emergency fund data integration
        // For now, return a placeholder
        return 4; // 4 months of expenses
    }
}
