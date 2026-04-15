<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\User;
use App\Models\Company;
use App\Policies\CompanyPolicy;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Company::class => CompanyPolicy::class,
        // Add more policies as needed
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // Define gates
        Gate::define('admin', function (User $user) {
            return $user->role === 'admin';
        });

        Gate::define('manager', function (User $user) {
            return in_array($user->role, ['admin', 'manager']);
        });

        Gate::define('view-company', function (User $user, Company $company) {
            return $user->company_id === $company->id || $user->role === 'admin';
        });

        Gate::define('manage-users', function (User $user) {
            return in_array($user->role, ['admin', 'manager']);
        });

        Gate::define('access-reports', function (User $user) {
            return in_array($user->role, ['admin', 'manager', 'analyst']);
        });

        // Implicitly grant "Super Admin" role all permissions
        Gate::before(function (User $user, string $ability) {
            return $user->role === 'admin' ? true : null;
        });
    }
}
