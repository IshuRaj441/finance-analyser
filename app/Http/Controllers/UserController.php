<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Traits\ApiResponse;
use App\Models\User;

class UserController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        return $this->success([
            'users' => [],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
        ]);

        return $this->success($validated, 'User created successfully', 201);
    }

    public function show(Request $request, User $user): JsonResponse
    {
        return $this->success($user->load('roles', 'permissions'));
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
        ]);

        $user->update($validated);
        return $this->success($user, 'User updated successfully');
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $user->delete();
        return $this->success(null, 'User deleted successfully');
    }

    public function updateRole(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $user->syncRoles([$validated['role_id']]);
        return $this->success(null, 'User role updated successfully');
    }

    public function updateStatus(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:active,inactive,suspended',
        ]);

        $user->update(['status' => $validated['status']]);
        return $this->success(null, 'User status updated successfully');
    }

    public function resetPassword(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'password' => 'required|string|min:8',
        ]);

        $user->update([
            'password' => bcrypt($validated['password']),
            'password_changed_at' => now(),
        ]);

        return $this->success(null, 'Password reset successfully');
    }

    public function summary(Request $request): JsonResponse
    {
        return $this->success([
            'total_users' => 0,
            'active_users' => 0,
            'inactive_users' => 0,
            'suspended_users' => 0,
        ]);
    }
}
