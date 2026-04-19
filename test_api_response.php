<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Simulate a real API request
use Illuminate\Http\Request;

// Get the admin user
$user = \App\Models\User::where('email', 'admin@example.com')->first();

if ($user) {
    // Create a JWT token
    $token = \Tymon\JWTAuth\Facades\JWTAuth::fromUser($user);
    
    echo "Testing API response structure...\n\n";
    
    // Simulate the exact response the AuthController would return
    $user->load(['roles', 'permissions', 'company']);
    
    // Create the response structure like the controller does
    $response = [
        'success' => true,
        'message' => 'User data retrieved successfully',
        'data' => $user
    ];
    
    echo "API Response structure:\n";
    echo json_encode($response, JSON_PRETTY_PRINT) . "\n\n";
    
    // Check if permissions are included
    $permissions = $response['data']['permissions'] ?? [];
    echo "Permissions in response: " . count($permissions) . "\n";
    echo "Permission names: " . implode(', ', array_column($permissions, 'name')) . "\n";
    echo "Has use_ai_features: " . (in_array('use_ai_features', array_column($permissions, 'name')) ? 'YES' : 'NO') . "\n";
    
} else {
    echo "Admin user not found!\n";
}
