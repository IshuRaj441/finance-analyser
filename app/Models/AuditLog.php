<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AuditLog extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'company_id',
        'action',
        'entity_type',
        'entity_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
        'url',
        'description',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function scopeByCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    public function scopeByAction($query, $action)
    {
        return $query->where('action', $action);
    }

    public function scopeByEntityType($query, $entityType)
    {
        return $query->where('entity_type', $entityType);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeDateRange($query, $startDate, $endDate)
    {
        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        return $query;
    }

    public function getChangesSummaryAttribute()
    {
        if (!$this->old_values && !$this->new_values) {
            return null;
        }

        $changes = [];
        
        if ($this->old_values && $this->new_values) {
            foreach ($this->new_values as $key => $newValue) {
                if (isset($this->old_values[$key]) && $this->old_values[$key] !== $newValue) {
                    $changes[] = "{$key}: {$this->old_values[$key]} -> {$newValue}";
                }
            }
        }

        return empty($changes) ? null : implode(', ', $changes);
    }

    public static function log(array $data)
    {
        return static::create($data);
    }

    public static function logLogin(User $user, string $ipAddress, string $userAgent)
    {
        return static::create([
            'user_id' => $user->id,
            'company_id' => $user->company_id,
            'action' => 'login',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'description' => "User {$user->email} logged in",
        ]);
    }

    public static function logLogout(User $user, string $ipAddress, string $userAgent)
    {
        return static::create([
            'user_id' => $user->id,
            'company_id' => $user->company_id,
            'action' => 'logout',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'description' => "User {$user->email} logged out",
        ]);
    }

    public static function logFailedLogin(string $email, string $ipAddress, string $userAgent)
    {
        return static::create([
            'action' => 'failed_login',
            'entity_type' => 'User',
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'description' => "Failed login attempt for email: {$email}",
            'new_values' => ['email' => $email],
        ]);
    }

    public static function logPasswordChange(User $user, string $ipAddress, string $userAgent)
    {
        return static::create([
            'user_id' => $user->id,
            'company_id' => $user->company_id,
            'action' => 'password_changed',
            'entity_type' => 'User',
            'entity_id' => $user->id,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'description' => "User {$user->email} changed password",
        ]);
    }

    public static function logSuspiciousActivity(string $action, string $description, array $details = null, ?int $userId = null, ?int $companyId = null)
    {
        return static::create([
            'user_id' => $userId,
            'company_id' => $companyId,
            'action' => $action,
            'entity_type' => 'System',
            'description' => $description,
            'new_values' => $details,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'url' => request()->fullUrl(),
        ]);
    }
}
