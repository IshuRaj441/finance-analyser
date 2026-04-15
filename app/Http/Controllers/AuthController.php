<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Company;
use App\Services\AuthService;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    use ApiResponse;

    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function login(LoginRequest $request)
    {
        $credentials = $request->only('email', 'password');
        
        if (!$token = auth('api')->attempt($credentials)) {
            return $this->error('Invalid credentials', 401);
        }

        $user = auth('api')->user();
        
        if ($user->status !== 'active') {
            return $this->error('Account is inactive', 403);
        }

        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        return $this->success([
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            'user' => $user->load('roles', 'permissions'),
        ], 'Login successful');
    }

    public function register(RegisterRequest $request)
    {
        DB::beginTransaction();
        try {
            $companyData = $request->only(['company_name', 'company_slug']);
            $userData = $request->only(['first_name', 'last_name', 'email', 'password', 'phone']);

            $company = Company::create([
                'name' => $companyData['company_name'],
                'slug' => $companyData['company_slug'],
                'plan' => 'free',
                'status' => 'active',
                'trial_ends_at' => now()->addDays(30),
            ]);

            $user = User::create([
                'company_id' => $company->id,
                'first_name' => $userData['first_name'],
                'last_name' => $userData['last_name'],
                'email' => $userData['email'],
                'password' => Hash::make($userData['password']),
                'phone' => $userData['phone'] ?? null,
                'status' => 'active',
                'is_company_admin' => true,
                'password_changed_at' => now(),
            ]);

            $user->assignRole('Admin');

            $token = auth('api')->login($user);

            DB::commit();

            return $this->success([
                'token' => $token,
                'token_type' => 'bearer',
                'expires_in' => auth('api')->factory()->getTTL() * 60,
                'user' => $user->load('roles', 'permissions'),
                'company' => $company,
            ], 'Registration successful', 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Registration failed: ' . $e->getMessage(), 500);
        }
    }

    public function logout(Request $request)
    {
        auth('api')->logout();
        return $this->success(null, 'Logout successful');
    }

    public function refresh()
    {
        $token = auth('api')->refresh();
        $user = auth('api')->user();

        return $this->success([
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            'user' => $user->load('roles', 'permissions'),
        ], 'Token refreshed');
    }

    public function me(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return $this->error('User not authenticated', 401);
            }

            // Load user relationships safely
            try {
                $user->load(['roles', 'permissions', 'company']);
            } catch (\Exception $relationError) {
                \Log::warning('Failed to load some user relationships', ['error' => $relationError->getMessage()]);
                // Continue without the relationships that failed
            }

            return $this->success($user);
        } catch (\Exception $e) {
            \Log::error('GET ME ERROR: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            return $this->error('Internal server error', 500);
        }
    }

    public function changePassword(ChangePasswordRequest $request)
    {
        $user = $request->user();
        
        if (!Hash::check($request->current_password, $user->password)) {
            return $this->error('Current password is incorrect', 422);
        }

        $user->update([
            'password' => Hash::make($request->password),
            'password_changed_at' => now(),
        ]);

        return $this->success(null, 'Password changed successfully');
    }

    public function forgotPassword(ForgotPasswordRequest $request)
    {
        $status = Password::sendResetLink($request->only('email'));

        if ($status !== Password::RESET_LINK_SENT) {
            return $this->error('Unable to send reset link', 422);
        }

        return $this->success(null, 'Password reset link sent');
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $status = Password::reset($request->only('email', 'password', 'token'), function ($user, $password) {
            $user->password = Hash::make($password);
            $user->password_changed_at = now();
            $user->save();
        });

        if ($status !== Password::PASSWORD_RESET) {
            return $this->error('Invalid reset token', 422);
        }

        return $this->success(null, 'Password reset successful');
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'preferences' => 'nullable|array',
        ]);

        if ($request->hasFile('avatar')) {
            $avatar = $request->file('avatar');
            $path = $avatar->store('avatars', 'public');
            $validated['avatar'] = $path;
        }

        $user->update($validated);

        return $this->success($user, 'Profile updated successfully');
    }

    public function deleteAccount(Request $request)
    {
        $user = $request->user();
        
        if (!Hash::check($request->password, $user->password)) {
            return $this->error('Password is incorrect', 422);
        }

        if ($user->is_company_admin) {
            $company = $user->company;
            if ($company->users()->count() > 1) {
                return $this->error('Company admin cannot delete account when other users exist', 422);
            }
            $company->delete();
        }

        $user->delete();
        auth('api')->logout();

        return $this->success(null, 'Account deleted successfully');
    }
}
