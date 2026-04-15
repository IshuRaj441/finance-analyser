<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Company extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'domain',
        'plan',
        'status',
        'settings',
        'trial_ends_at',
        'subscription_ends_at',
        'stripe_customer_id',
        'paypal_subscription_id',
        'max_users',
        'max_storage_mb',
        'can_export_reports',
        'can_use_ai_features',
        'can_integrate_apis',
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'subscription_ends_at' => 'datetime',
        'settings' => 'array',
        'can_export_reports' => 'boolean',
        'can_use_ai_features' => 'boolean',
        'can_integrate_apis' => 'boolean',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function categories()
    {
        return $this->hasMany(Category::class);
    }

    public function budgets()
    {
        return $this->hasMany(Budget::class);
    }

    public function reports()
    {
        return $this->hasMany(Report::class);
    }

    public function files()
    {
        return $this->hasMany(File::class);
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }

    public function backups()
    {
        return $this->hasMany(Backup::class);
    }

    public function integrations()
    {
        return $this->hasMany(Integration::class);
    }

    public function fraudAlerts()
    {
        return $this->hasMany(FraudAlert::class);
    }

    public function activeUsers()
    {
        return $this->users()->active();
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByPlan($query, $plan)
    {
        return $query->where('plan', $plan);
    }

    public function isOnTrial()
    {
        return $this->trial_ends_at && $this->trial_ends_at->isFuture();
    }

    public function isSubscriptionActive()
    {
        return !$this->subscription_ends_at || $this->subscription_ends_at->isFuture();
    }

    public function canAddMoreUsers()
    {
        return $this->activeUsers()->count() < $this->max_users;
    }

    public function getStorageUsedAttribute()
    {
        return $this->files()->sum('size');
    }

    public function hasStorageAvailable()
    {
        return $this->getStorageUsedAttribute() < ($this->max_storage_mb * 1024 * 1024);
    }

    public function getSettingsAttribute($value)
    {
        return $value ? json_decode($value, true) : [];
    }

    public function setSettingsAttribute($value)
    {
        $this->attributes['settings'] = is_array($value) ? json_encode($value) : $value;
    }
}
