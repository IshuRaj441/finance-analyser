<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Traits\ApiResponse;

class FileController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        return $this->success([
            'files' => [],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:50',
            'size' => 'required|integer',
            'path' => 'required|string',
        ]);

        return $this->success($validated, 'File created successfully', 201);
    }

    public function show(Request $request, $id): JsonResponse
    {
        return $this->success([
            'id' => $id,
            'name' => 'Sample File',
            'type' => 'pdf',
            'size' => 1024,
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
        ]);

        return $this->success($validated, 'File updated successfully');
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        return $this->success(null, 'File deleted successfully');
    }

    public function upload(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => 'required|file|max:10240',
            'folder' => 'nullable|string|max:255',
        ]);

        return $this->success([
            'file_id' => 123,
            'name' => $request->file('file')->getClientOriginalName(),
            'size' => $request->file('file')->getSize(),
            'url' => '/storage/files/sample.pdf',
        ], 'File uploaded successfully');
    }

    public function download(Request $request, $id): JsonResponse
    {
        return $this->success([
            'download_url' => '/api/v1/files/' . $id . '/download/file',
            'expires_at' => now()->addHours(1),
        ]);
    }
}
