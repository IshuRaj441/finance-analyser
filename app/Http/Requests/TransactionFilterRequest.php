<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransactionFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => 'nullable|in:income,expense',
            'status' => 'nullable|in:pending,approved,rejected',
            'category_id' => 'nullable|exists:categories,id',
            'user_id' => 'nullable|exists:users,id',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'min_amount' => 'nullable|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
            'search' => 'nullable|string|max:255',
            'per_page' => 'nullable|integer|min:1|max:100',
        ];
    }

    public function messages(): array
    {
        return [
            'type.in' => 'Type must be either income or expense',
            'status.in' => 'Status must be pending, approved, or rejected',
            'category_id.exists' => 'Selected category is invalid',
            'user_id.exists' => 'Selected user is invalid',
            'date_to.after_or_equal' => 'End date must be after or equal to start date',
            'min_amount.numeric' => 'Minimum amount must be a valid number',
            'max_amount.numeric' => 'Maximum amount must be a valid number',
            'per_page.integer' => 'Per page must be a number',
            'per_page.min' => 'Per page must be at least 1',
            'per_page.max' => 'Per page cannot exceed 100',
        ];
    }
}
