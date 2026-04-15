<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Traits\ApiResponse;

class IntegrationController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        return $this->success([
            'integrations' => [],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:50',
            'config' => 'required|array',
        ]);

        return $this->success($validated, 'Integration created successfully', 201);
    }

    public function show(Request $request, $id): JsonResponse
    {
        return $this->success([
            'id' => $id,
            'name' => 'Sample Integration',
            'type' => 'stripe',
            'status' => 'connected',
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'config' => 'required|array',
        ]);

        return $this->success($validated, 'Integration updated successfully');
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        return $this->success(null, 'Integration deleted successfully');
    }

    public function sync(Request $request, $id): JsonResponse
    {
        return $this->success([
            'sync_id' => 126,
            'status' => 'processing',
            'started_at' => now(),
        ], 'Integration sync started');
    }

    public function logs(Request $request, $id): JsonResponse
    {
        return $this->success([
            'logs' => [],
        ]);
    }

    public function available(Request $request): JsonResponse
    {
        return $this->success([
            'integrations' => [
                ['type' => 'stripe', 'name' => 'Stripe', 'description' => 'Payment processing'],
                ['type' => 'razorpay', 'name' => 'Razorpay', 'description' => 'Payment processing'],
                ['type' => 'paypal', 'name' => 'PayPal', 'description' => 'Payment processing'],
                ['type' => 'quickbooks', 'name' => 'QuickBooks', 'description' => 'Accounting software'],
            ],
        ]);
    }

    public function stripeWebhook(Request $request): JsonResponse
    {
        return $this->success(null, 'Stripe webhook processed');
    }

    public function razorpayWebhook(Request $request): JsonResponse
    {
        return $this->success(null, 'Razorpay webhook processed');
    }

    public function paypalWebhook(Request $request): JsonResponse
    {
        return $this->success(null, 'PayPal webhook processed');
    }
}
