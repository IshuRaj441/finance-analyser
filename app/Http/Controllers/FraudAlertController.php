<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Traits\ApiResponse;

class FraudAlertController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        return $this->success([
            'fraud_alerts' => [],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'transaction_id' => 'required|exists:transactions,id',
            'type' => 'required|string|max:50',
            'severity' => 'required|in:low,medium,high,critical',
            'description' => 'required|string',
        ]);

        return $this->success($validated, 'Fraud alert created successfully', 201);
    }

    public function show(Request $request, $id): JsonResponse
    {
        return $this->success([
            'id' => $id,
            'type' => 'unusual_amount',
            'severity' => 'medium',
            'status' => 'open',
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'severity' => 'sometimes|in:low,medium,high,critical',
            'status' => 'sometimes|in:open,investigating,resolved,dismissed',
        ]);

        return $this->success($validated, 'Fraud alert updated successfully');
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        return $this->success(null, 'Fraud alert deleted successfully');
    }

    public function resolve(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'resolution_note' => 'required|string',
        ]);

        return $this->success($validated, 'Fraud alert resolved');
    }

    public function investigate(Request $request, $id): JsonResponse
    {
        return $this->success([
            'investigation_id' => 127,
            'status' => 'investigating',
        ], 'Investigation started');
    }

    public function summary(Request $request): JsonResponse
    {
        return $this->success([
            'total_alerts' => 0,
            'open_alerts' => 0,
            'investigating_alerts' => 0,
            'resolved_alerts' => 0,
            'dismissed_alerts' => 0,
        ]);
    }

    public function rules(Request $request): JsonResponse
    {
        return $this->success([
            'rules' => [
                ['id' => 1, 'name' => 'Unusual Transaction Amount', 'enabled' => true],
                ['id' => 2, 'name' => 'Multiple Small Transactions', 'enabled' => true],
                ['id' => 3, 'name' => 'Foreign Transaction', 'enabled' => false],
            ],
        ]);
    }

    public function createRule(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'conditions' => 'required|array',
            'severity' => 'required|in:low,medium,high,critical',
        ]);

        return $this->success($validated, 'Fraud rule created successfully', 201);
    }
}
