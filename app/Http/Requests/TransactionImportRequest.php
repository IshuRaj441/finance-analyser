<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransactionImportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermissionTo('import_transactions');
    }

    public function rules(): array
    {
        return [
            'file' => 'required|file|mimes:csv,xlsx,xls|max:10240',
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Please select a file to import',
            'file.file' => 'Invalid file',
            'file.mimes' => 'File must be CSV or Excel format',
            'file.max' => 'File size cannot exceed 10MB',
        ];
    }
}
