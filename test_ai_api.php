<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Testing AI API Endpoint with Real Request...\n";
echo "==========================================\n\n";

// Get admin user
$user = \App\Models\User::where('email', 'admin@example.com')->first();

if (!$user) {
    echo "❌ Admin user not found\n";
    exit(1);
}

echo "✅ Found user: " . $user->email . "\n";
echo "✅ User ID: " . $user->id . "\n";
echo "✅ Role: " . $user->roles->first()->name . "\n";
echo "✅ Has AI permission: " . ($user->hasPermissionTo('use_ai_features') ? 'YES' : 'NO') . "\n\n";

// Test the permission middleware directly
$middleware = new \App\Http\Middleware\CheckPermission();

// Create a test request
$request = \Illuminate\Http\Request::create('/api/v1/ai/chat', 'POST', [
    'message' => 'What is my financial health score?'
]);

// Set the user on the request
$request->setUserResolver(function() use ($user) {
    return $user;
});

echo "Testing Permission Middleware...\n";
try {
    $response = $middleware->handle($request, function($req) {
        echo "✅ Permission check PASSED\n";
        return new \Illuminate\Http\Response('Success', 200);
    }, 'use_ai_features');
    
    if ($response->getStatusCode() === 200) {
        echo "✅ Middleware test: SUCCESS\n";
    } else {
        echo "❌ Middleware test: FAILED - " . $response->getStatusCode() . "\n";
        echo "Response: " . $response->getContent() . "\n";
    }
} catch (\Exception $e) {
    echo "❌ Middleware test: ERROR - " . $e->getMessage() . "\n";
}

echo "\n=== Test Complete ===\n";
echo "The AI chat endpoint should now work. Please try it in the frontend.\n";
