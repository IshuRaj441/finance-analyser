<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Budget extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'user_id',
        'category_id',
        'name',
        'amount',
        'spent',
        'period',
        'start_date',
        'end_date',
        'alert_threshold',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'spent' => 'decimal:2',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'alert_threshold' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function scopeForCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeCurrent($query)
    {
        return $query->where('start_date', '<=', now())
                    ->where('end_date', '>=', now());
    }

    public function getRemainingAttribute(): float
    {
        return $this->amount - $this->spent;
    }

    public function getUsagePercentageAttribute(): float
    {
        if ($this->amount == 0) {
            return 0;
        }
        
        return ($this->spent / $this->amount) * 100;
    }

    public function isOverBudget(): bool
    {
        return $this->spent > $this->amount;
    }

    public function isNearLimit(float $threshold = 80): bool
    {
        return $this->usage_percentage >= $threshold;
    }

    public function addSpent(float $amount): void
    {
        $this->spent += $amount;
        $this->save();
    }

    public function canAlert(): bool
    {
        return $this->alert_threshold > 0 && $this->usage_percentage >= $this->alert_threshold;
    }
}
