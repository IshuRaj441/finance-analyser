<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransactionApprovalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermissionTo('approve_transaction');
    }

    public function rules(): array
    {
        return [
            'reason' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'reason.string' => 'Reason must be a string',
            'reason.max' => 'Reason cannot exceed 500 characters',
        ];
    }
}
