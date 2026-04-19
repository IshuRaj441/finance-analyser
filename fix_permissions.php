<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Checking and fixing AI permissions...\n";

// Get the first user (admin)
$user = \App\Models\User::first();
if (!$user) {
    echo "No users found in database.\n";
    exit(1);
}

echo "Found user: " . $user->email . "\n";

// Check if user has AI permissions for API guard
$aiPermission = \Spatie\Permission\Models\Permission::where('name', 'use_ai_features')
    ->where('guard_name', 'api')
    ->first();

if (!$aiPermission) {
    echo "AI permission for API guard not found. Creating...\n";
    $aiPermission = \Spatie\Permission\Models\Permission::create([
        'name' => 'use_ai_features',
        'guard_name' => 'api'
    ]);
} else {
    echo "AI permission for API guard exists.\n";
}

// Check if user has the permission
if (!$user->hasPermissionTo('use_ai_features', 'api')) {
    echo "Assigning AI permission to user...\n";
    $user->givePermissionTo('use_ai_features');
    echo "Permission assigned successfully.\n";
} else {
    echo "User already has AI permission.\n";
}

// Also check for web guard
$webPermission = \Spatie\Permission\Models\Permission::where('name', 'use_ai_features')
    ->where('guard_name', 'web')
    ->first();

if (!$webPermission) {
    echo "AI permission for web guard not found. Creating...\n";
    $webPermission = \Spatie\Permission\Models\Permission::create([
        'name' => 'use_ai_features',
        'guard_name' => 'web'
    ]);
}

if (!$user->hasPermissionTo('use_ai_features', 'web')) {
    echo "Assigning AI permission (web) to user...\n";
    $user->givePermissionTo('use_ai_features', 'web');
    echo "Web permission assigned successfully.\n";
} else {
    echo "User already has AI permission (web).\n";
}

echo "\nCurrent user permissions:\n";
echo "API: " . implode(', ', $user->getPermissionNames()->toArray()) . "\n";

echo "\nPermission fix complete!\n";
