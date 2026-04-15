<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'amount' => 'required|numeric|min:0.01|max:999999999.99',
            'type' => 'required|in:income,expense',
            'category_id' => 'required|exists:categories,id',
            'transaction_date' => 'required|date|before_or_equal:today',
            'payment_method' => 'nullable|string|max:100',
            'bank_account' => 'nullable|string|max:100',
            'tags' => 'nullable|string|max:255',
            'is_recurring' => 'boolean',
            'recurring_interval' => 'nullable|required_if:is_recurring,true|in:weekly,monthly,quarterly,yearly',
            'recurring_end_date' => 'nullable|required_if:is_recurring,true|date|after:transaction_date',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Transaction title is required',
            'amount.required' => 'Amount is required',
            'amount.numeric' => 'Amount must be a valid number',
            'amount.min' => 'Amount must be greater than 0',
            'type.required' => 'Transaction type is required',
            'type.in' => 'Transaction type must be either income or expense',
            'category_id.required' => 'Category is required',
            'category_id.exists' => 'Selected category is invalid',
            'transaction_date.required' => 'Transaction date is required',
            'transaction_date.before_or_equal' => 'Transaction date cannot be in the future',
            'recurring_interval.required_if' => 'Recurring interval is required when transaction is recurring',
            'recurring_end_date.required_if' => 'Recurring end date is required when transaction is recurring',
            'recurring_end_date.after' => 'Recurring end date must be after transaction date',
        ];
    }
}
