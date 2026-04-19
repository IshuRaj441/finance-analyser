<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== AI Permission Fix Script ===\n\n";

// Step 1: Run the role and permission seeder
echo "Step 1: Running RolePermissionSeeder...\n";
try {
    $seeder = new \Database\Seeders\RolePermissionSeeder();
    $seeder->run();
    echo "Seeder completed successfully.\n\n";
} catch (Exception $e) {
    echo "Seeder failed: " . $e->getMessage() . "\n\n";
}

// Step 2: Get all users and ensure they have AI permissions
echo "Step 2: Checking and fixing user permissions...\n";
$users = \App\Models\User::all();

if ($users->isEmpty()) {
    echo "No users found in database.\n";
    exit(1);
}

foreach ($users as $user) {
    echo "Processing user: " . $user->email . "\n";
    
    // Check if user has AI permissions for both guards
    $apiPermission = \Spatie\Permission\Models\Permission::where('name', 'use_ai_features')
        ->where('guard_name', 'api')
        ->first();
    
    $webPermission = \Spatie\Permission\Models\Permission::where('name', 'use_ai_features')
        ->where('guard_name', 'web')
        ->first();
    
    if (!$apiPermission) {
        echo "  - Creating API AI permission...\n";
        $apiPermission = \Spatie\Permission\Models\Permission::create([
            'name' => 'use_ai_features',
            'guard_name' => 'api'
        ]);
    }
    
    if (!$webPermission) {
        echo "  - Creating Web AI permission...\n";
        $webPermission = \Spatie\Permission\Models\Permission::create([
            'name' => 'use_ai_features',
            'guard_name' => 'web'
        ]);
    }
    
    // Assign permissions if user doesn't have them
    if (!$user->hasDirectPermission('use_ai_features', 'api')) {
        echo "  - Assigning AI permission (API)...\n";
        $user->givePermissionTo($apiPermission);
    }
    
    if (!$user->hasDirectPermission('use_ai_features', 'web')) {
        echo "  - Assigning AI permission (Web)...\n";
        $user->givePermissionTo($webPermission);
    }
    
    // Ensure user has at least one role
    if ($user->roles->isEmpty()) {
        echo "  - User has no roles, assigning 'Admin' role...\n";
        $adminRole = \Spatie\Permission\Models\Role::where('name', 'Admin')->first();
        if ($adminRole) {
            $user->assignRole('Admin');
        }
    }
    
    echo "  - User permissions: " . implode(', ', $user->getPermissionNames()->toArray()) . "\n";
    echo "  - User roles: " . implode(', ', $user->getRoleNames()->toArray()) . "\n\n";
}

echo "=== Permission Fix Complete ===\n";
echo "All users now have AI permissions. Please refresh your browser and try the AI chat again.\n";
