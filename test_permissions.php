<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Get the admin user
$user = \App\Models\User::where('email', 'admin@example.com')->first();

if ($user) {
    echo "User found: " . $user->email . "\n";
    echo "Roles: " . $user->roles->pluck('name')->join(', ') . "\n";
    echo "Permissions count: " . $user->permissions->count() . "\n";
    echo "AI permissions: " . $user->permissions->whereIn('name', ['use_ai_features', 'use_ai'])->pluck('name')->join(', ') . "\n";
    
    // Test the API response structure
    $user->load(['roles', 'permissions', 'company']);
    echo "\nUser data structure:\n";
    echo "- Has roles: " . ($user->relationLoaded('roles') ? 'Yes' : 'No') . "\n";
    echo "- Has permissions: " . ($user->relationLoaded('permissions') ? 'Yes' : 'No') . "\n";
    echo "- Permissions: " . $user->permissions->pluck('name')->join(', ') . "\n";
} else {
    echo "Admin user not found!\n";
}
