<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Checking User Permissions...\n";
echo "=========================\n\n";

$user = \App\Models\User::first();

if ($user) {
    echo "User: " . $user->email . "\n";
    echo "Role: " . ($user->roles->first()->name ?? 'No role') . "\n";
    echo "Permissions: " . $user->getAllPermissions()->pluck('name')->join(', ') . "\n";
    echo "Has use_ai_features: " . ($user->hasPermissionTo('use_ai_features') ? 'YES' : 'NO') . "\n";
    echo "User ID: " . $user->id . "\n";
    echo "Company ID: " . $user->company_id . "\n";
    
    // Check all permissions
    echo "\nAll Permissions:\n";
    foreach ($user->getAllPermissions() as $permission) {
        echo "- " . $permission->name . "\n";
    }
} else {
    echo "No users found\n";
}
