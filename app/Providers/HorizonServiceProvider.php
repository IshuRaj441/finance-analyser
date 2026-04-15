<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Horizon\Horizon;

class HorizonServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Horizon::auth(function ($request) {
            return $this->horizonGate($request);
        });
    }

    /**
     * Horizon authentication gate.
     */
    public function horizonGate($request): bool
    {
        return app()->environment('local') ||
               ($request->user() && $request->user()->hasRole('admin'));
    }
}
