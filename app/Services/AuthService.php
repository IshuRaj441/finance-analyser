<?php

namespace App\Services;

use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthService
{
    public function authenticate(array $credentials)
    {
        if (!$token = Auth::guard('api')->attempt($credentials)) {
            return null;
        }

        $user = Auth::guard('api')->user();
        
        if ($user->status !== 'active') {
            Auth::guard('api')->logout();
            return null;
        }

        $this->logLogin($user);

        return $token;
    }

    public function logout()
    {
        $user = Auth::guard('api')->user();
        
        if ($user) {
            $this->logLogout($user);
        }

        return Auth::guard('api')->logout();
    }

    public function refreshToken()
    {
        return Auth::guard('api')->refresh();
    }

    public function validatePassword(User $user, string $password): bool
    {
        return Hash::check($password, $user->password);
    }

    public function updatePassword(User $user, string $newPassword): bool
    {
        $result = $user->update([
            'password' => Hash::make($newPassword),
            'password_changed_at' => now(),
        ]);

        if ($result) {
            $this->logPasswordChange($user);
        }

        return $result;
    }

    private function logLogin(User $user)
    {
        AuditLog::create([
            'user_id' => $user->id,
            'company_id' => $user->company_id,
            'action' => 'login',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'description' => "User {$user->email} logged in",
        ]);
    }

    private function logLogout(User $user)
    {
        AuditLog::create([
            'user_id' => $user->id,
            'company_id' => $user->company_id,
            'action' => 'logout',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'description' => "User {$user->email} logged out",
        ]);
    }

    private function logPasswordChange(User $user)
    {
        AuditLog::create([
            'user_id' => $user->id,
            'company_id' => $user->company_id,
            'action' => 'password_changed',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'description' => "User {$user->email} changed password",
        ]);
    }

    public function isAccountLocked(User $user): bool
    {
        $failedAttempts = AuditLog::where('user_id', $user->id)
            ->where('action', 'failed_login')
            ->where('created_at', '>', now()->subMinutes(15))
            ->count();

        return $failedAttempts >= 5;
    }

    public function lockAccount(User $user)
    {
        $user->update(['status' => 'suspended']);

        AuditLog::create([
            'user_id' => $user->id,
            'company_id' => $user->company_id,
            'action' => 'account_locked',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'description' => "User {$user->email} account locked due to multiple failed login attempts",
        ]);
    }

    public function logFailedLogin(string $email)
    {
        AuditLog::create([
            'action' => 'failed_login',
            'entity_type' => 'User',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'description' => "Failed login attempt for email: {$email}",
            'new_values' => ['email' => $email],
        ]);
    }
}
