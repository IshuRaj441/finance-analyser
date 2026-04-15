<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Company;
use App\Models\Transaction;
use App\Models\Budget;
use App\Models\Report;
use App\Models\UserDashboardSetting;

class User extends Authenticatable implements JWTSubject
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles, SoftDeletes;

    protected $fillable = [
        'company_id',
        'first_name',
        'last_name',
        'email',
        'password',
        'phone',
        'avatar',
        'status',
        'last_login_at',
        'last_login_ip',
        'password_changed_at',
        'trial_ends_at',
        'is_company_admin',
        'preferences',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'password_changed_at' => 'datetime',
        'trial_ends_at' => 'datetime',
        'is_company_admin' => 'boolean',
        'preferences' => 'array',
    ];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [
            'company_id' => $this->company_id,
            'roles' => $this->roles->pluck('name'),
            'permissions' => $this->getAllPermissions()->pluck('name'),
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function budgets()
    {
        return $this->hasMany(Budget::class);
    }

    public function reports()
    {
        return $this->hasMany(Report::class);
    }

    public function dashboardSettings()
    {
        return $this->hasOne(UserDashboardSetting::class);
    }

    public function approvedTransactions()
    {
        return $this->hasMany(Transaction::class, 'approved_by');
    }

    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    public function hasPermissionForCompany($permission, $companyId)
    {
        if ($this->company_id !== $companyId) {
            return false;
        }

        return $this->hasPermissionTo($permission);
    }

    public function canAccessCompany($companyId)
    {
        return $this->company_id === $companyId && $this->status === 'active';
    }
}
