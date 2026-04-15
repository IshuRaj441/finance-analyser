<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Traits\ApiResponse;

class BudgetController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        return $this->success([
            'budgets' => [],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'period' => 'required|in:monthly,quarterly,yearly',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        return $this->success($validated, 'Budget created successfully', 201);
    }

    public function show(Request $request, $id): JsonResponse
    {
        return $this->success([
            'id' => $id,
            'name' => 'Sample Budget',
            'amount' => 1000,
            'spent' => 450,
            'remaining' => 550,
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'amount' => 'sometimes|numeric|min:0',
            'period' => 'sometimes|in:monthly,quarterly,yearly',
        ]);

        return $this->success($validated, 'Budget updated successfully');
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        return $this->success(null, 'Budget deleted successfully');
    }

    public function active(Request $request): JsonResponse
    {
        return $this->success([
            'budgets' => [
                ['id' => 1, 'name' => 'Monthly Food Budget', 'spent' => 450, 'budget' => 600],
                ['id' => 2, 'name' => 'Transport Budget', 'spent' => 120, 'budget' => 200],
            ],
        ]);
    }

    public function summary(Request $request): JsonResponse
    {
        return $this->success([
            'total_budgets' => 5,
            'active_budgets' => 3,
            'total_allocated' => 5000,
            'total_spent' => 2100,
            'total_remaining' => 2900,
        ]);
    }

    public function updateAlertThreshold(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'alert_threshold' => 'required|numeric|min:0|max:100',
        ]);

        return $this->success($validated, 'Alert threshold updated');
    }
}
