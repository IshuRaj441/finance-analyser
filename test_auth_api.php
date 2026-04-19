<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Create a mock request to test the auth/me endpoint
use Illuminate\Http\Request;

// Get the admin user
$user = \App\Models\User::where('email', 'admin@example.com')->first();

if ($user) {
    // Create a token for the user (using JWT)
    $token = \Tymon\JWTAuth\Facades\JWTAuth::fromUser($user);
    
    echo "Generated token for user: " . $user->email . "\n";
    echo "Token: " . substr($token, 0, 50) . "...\n\n";
    
    // Simulate the AuthController me method
    $request = Request::create('/auth/me', 'GET');
    $request->setUserResolver(function () use ($user) {
        return $user;
    });
    
    // Load relationships like the controller does
    $user->load(['roles', 'permissions', 'company']);
    
    echo "User data structure:\n";
    echo "- ID: " . $user->id . "\n";
    echo "- Email: " . $user->email . "\n";
    echo "- Roles: " . $user->roles->pluck('name')->join(', ') . "\n";
    echo "- Permissions count: " . $user->permissions->count() . "\n";
    echo "- All permissions: " . $user->permissions->pluck('name')->join(', ') . "\n";
    echo "- Has use_ai_features: " . ($user->permissions->contains('name', 'use_ai_features') ? 'YES' : 'NO') . "\n";
    
    // Convert to array to see the exact structure
    echo "\nUser as array (first 500 chars):\n";
    $userArray = $user->toArray();
    $userJson = json_encode($userArray, JSON_PRETTY_PRINT);
    echo substr($userJson, 0, 500) . "...\n";
    
} else {
    echo "Admin user not found!\n";
}
