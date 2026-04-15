<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AIChatRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermissionTo('use_ai_features');
    }

    public function rules(): array
    {
        return [
            'message' => 'required|string|min:5|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'message.required' => 'Message is required',
            'message.min' => 'Message must be at least 5 characters',
            'message.max' => 'Message cannot exceed 1000 characters',
        ];
    }
}
