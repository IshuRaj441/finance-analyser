<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Testing AI API Endpoint...\n";
echo "==========================\n\n";

// Get a test user
$user = \App\Models\User::where('email', 'admin@example.com')->first();

if (!$user) {
    echo "❌ Admin user not found\n";
    exit(1);
}

echo "✅ Found user: " . $user->email . "\n";
echo "✅ User role: " . $user->roles->first()->name . "\n";
echo "✅ Has AI permission: " . ($user->hasPermissionTo('use_ai_features') ? 'YES' : 'NO') . "\n\n";

// Create a mock request using Laravel's request factory
$request = \Illuminate\Http\Request::create('/api/v1/ai/chat', 'POST', [
    'message' => 'What is 2+2?'
]);

// Set the user on the request
$request->setUserResolver(function() use ($user) {
    return $user;
});

// Test the AI controller
try {
    $controller = new \App\Http\Controllers\AIController(
        new \App\Services\AIService()
    );
    
    echo "Testing AI Controller...\n";
    $response = $controller->chat(\App\Http\Requests\AIChatRequest::createFromBase($request));
    
    if ($response->getStatusCode() === 200) {
        echo "✅ AI Controller: SUCCESS\n";
        $data = json_decode($response->getContent(), true);
        echo "✅ Response: " . substr($data['data']['response'], 0, 100) . "...\n";
    } else {
        echo "❌ AI Controller: FAILED - Status " . $response->getStatusCode() . "\n";
        echo "Response: " . $response->getContent() . "\n";
    }
    
} catch (\Exception $e) {
    echo "❌ AI Controller: ERROR - " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n=== Test Complete ===\n";
