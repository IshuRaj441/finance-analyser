<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Traits\ApiResponse;
use App\Models\Company;

class CompanyController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        return $this->success([
            'companies' => [],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:companies',
            'plan' => 'required|in:free,starter,pro,enterprise',
        ]);

        return $this->success($validated, 'Company created successfully', 201);
    }

    public function show(Request $request, Company $company): JsonResponse
    {
        return $this->success($company->load('users', 'subscriptions'));
    }

    public function update(Request $request, Company $company): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'settings' => 'nullable|array',
        ]);

        $company->update($validated);
        return $this->success($company, 'Company updated successfully');
    }

    public function destroy(Request $request, Company $company): JsonResponse
    {
        $company->delete();
        return $this->success(null, 'Company deleted successfully');
    }

    public function updateSettings(Request $request, Company $company): JsonResponse
    {
        $validated = $request->validate([
            'settings' => 'required|array',
        ]);

        $company->update(['settings' => $validated['settings']]);
        return $this->success(null, 'Company settings updated successfully');
    }

    public function upgradePlan(Request $request, Company $company): JsonResponse
    {
        $validated = $request->validate([
            'plan' => 'required|in:starter,pro,enterprise',
        ]);

        $company->update(['plan' => $validated['plan']]);
        return $this->success(null, 'Company plan upgraded successfully');
    }

    public function usage(Request $request, Company $company): JsonResponse
    {
        return $this->success([
            'users_count' => $company->users()->count(),
            'transactions_count' => 0,
            'storage_used' => '0 MB',
            'api_calls' => 0,
        ]);
    }

    public function settings(Request $request): JsonResponse
    {
        return $this->success([
            'company_name' => $request->user()->company->name,
            'timezone' => 'UTC',
            'currency' => 'USD',
            'date_format' => 'Y-m-d',
        ]);
    }

    public function currencies(Request $request): JsonResponse
    {
        return $this->success([
            'currencies' => [
                ['code' => 'USD', 'name' => 'US Dollar'],
                ['code' => 'EUR', 'name' => 'Euro'],
                ['code' => 'GBP', 'name' => 'British Pound'],
            ],
        ]);
    }

    public function timezones(Request $request): JsonResponse
    {
        return $this->success([
            'timezones' => [
                'UTC',
                'America/New_York',
                'Europe/London',
                'Asia/Tokyo',
            ],
        ]);
    }
}
