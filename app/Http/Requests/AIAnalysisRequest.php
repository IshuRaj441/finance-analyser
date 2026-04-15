<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AIAnalysisRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermissionTo('use_ai_features');
    }

    public function rules(): array
    {
        return [
            'period' => 'nullable|integer|min:7|max:365',
        ];
    }

    public function messages(): array
    {
        return [
            'period.integer' => 'Period must be a number',
            'period.min' => 'Period must be at least 7 days',
            'period.max' => 'Period cannot exceed 365 days',
        ];
    }
}
