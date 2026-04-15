<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_name' => 'required|string|max:255',
            'company_slug' => 'required|string|max:255|unique:companies,slug|regex:/^[a-z0-9-]+$/',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
            'phone' => 'nullable|string|max:20',
        ];
    }

    public function messages(): array
    {
        return [
            'company_slug.regex' => 'Company slug can only contain lowercase letters, numbers, and hyphens',
            'password.confirmed' => 'Password confirmation does not match',
            'email.unique' => 'This email is already registered',
            'company_slug.unique' => 'This company slug is already taken',
        ];
    }
}
