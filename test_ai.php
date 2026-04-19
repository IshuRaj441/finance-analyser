<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Services\AIService;
use App\Models\User;
use Illuminate\Support\Facades\Http;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Testing AI Service Configuration...\n\n";

// Test 1: Check if OpenRouter API key is configured
$apiKey = config('services.openrouter.api_key');
echo "OpenRouter API Key: " . ($apiKey ? "Set (length: " . strlen($apiKey) . ")" : "NOT SET") . "\n\n";

if (!$apiKey || $apiKey === 'sk-or-v1-your-openrouter-api-key-here') {
    echo "ERROR: Please set your actual OpenRouter API key in the .env file\n";
    echo "Update OPENROUTER_API_KEY=sk-or-v1-your-openrouter-api-key-here to your real key\n\n";
    exit(1);
}

// Test 2: Try to create AI Service instance
try {
    $aiService = new AIService();
    echo "AI Service: Successfully instantiated\n\n";
} catch (Exception $e) {
    echo "ERROR: Failed to create AI Service: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Test 3: Test basic OpenRouter API connection
echo "Testing OpenRouter API connection...\n";
try {
    $response = Http::withHeaders([
        'Authorization' => "Bearer {$apiKey}",
        'Content-Type' => 'application/json',
    ])->post('https://openrouter.ai/api/v1/chat/completions', [
        'model' => 'openai/gpt-3.5-turbo',
        'messages' => [
            [
                'role' => 'user',
                'content' => 'Say "Hello from OpenRouter API!"'
            ]
        ],
        'max_tokens' => 10,
    ]);

    if ($response->successful()) {
        $result = $response->json('choices.0.message.content');
        echo "OpenRouter API: SUCCESS - Response: {$result}\n\n";
    } else {
        echo "OpenRouter API: ERROR - Status: " . $response->status() . "\n";
        echo "Response: " . $response->body() . "\n\n";
        exit(1);
    }
} catch (Exception $e) {
    echo "OpenRouter API: ERROR - " . $e->getMessage() . "\n\n";
    exit(1);
}

// Test 4: Test with a sample user (if exists)
echo "Testing AI Service with sample data...\n";
try {
    $user = User::first();
    if ($user) {
        echo "Found user: " . $user->email . "\n";
        
        // Test chat functionality
        $result = $aiService->chatWithAI($user, "What is 2+2?");
        
        if ($result['success']) {
            echo "AI Chat: SUCCESS\n";
            echo "Response: " . substr($result['response'], 0, 100) . "...\n\n";
        } else {
            echo "AI Chat: ERROR - " . ($result['error'] ?? 'Unknown error') . "\n\n";
        }
    } else {
        echo "No users found in database. Please create a user first.\n\n";
    }
} catch (Exception $e) {
    echo "AI Service Test: ERROR - " . $e->getMessage() . "\n\n";
}

echo "AI Configuration Test Complete!\n";
echo "Next steps:\n";
echo "1. Make sure your OpenRouter API key is set correctly in .env\n";
echo "2. Start your Laravel application\n";
echo "3. Test the AI assistant in the frontend\n";
echo "4. The AI endpoint is available at: POST /api/v1/ai/chat\n\n";
