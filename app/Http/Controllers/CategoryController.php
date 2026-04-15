<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Traits\ApiResponse;

class CategoryController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        return $this->success([
            'categories' => [],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:income,expense',
            'description' => 'nullable|string',
        ]);

        return $this->success($validated, 'Category created successfully', 201);
    }

    public function show(Request $request, $id): JsonResponse
    {
        return $this->success([
            'id' => $id,
            'name' => 'Sample Category',
            'type' => 'expense',
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:income,expense',
            'description' => 'nullable|string',
        ]);

        return $this->success($validated, 'Category updated successfully');
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        return $this->success(null, 'Category deleted successfully');
    }

    public function expenseCategories(Request $request): JsonResponse
    {
        return $this->success([
            'categories' => [
                ['id' => 1, 'name' => 'Food & Dining'],
                ['id' => 2, 'name' => 'Transportation'],
                ['id' => 3, 'name' => 'Shopping'],
            ],
        ]);
    }

    public function incomeCategories(Request $request): JsonResponse
    {
        return $this->success([
            'categories' => [
                ['id' => 1, 'name' => 'Salary'],
                ['id' => 2, 'name' => 'Investments'],
                ['id' => 3, 'name' => 'Business Income'],
            ],
        ]);
    }

    public function bulkStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'categories' => 'required|array|min:1',
            'categories.*.name' => 'required|string|max:255',
            'categories.*.type' => 'required|in:income,expense',
        ]);

        return $this->success($validated, 'Categories created successfully', 201);
    }
}
