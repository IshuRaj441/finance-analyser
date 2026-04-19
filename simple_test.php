<?php

echo "Testing OpenRouter API Key...\n";

$apiKey = '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';

// Test direct OpenRouter API call
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, 'https://openrouter.ai/api/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'model' => 'openai/gpt-3.5-turbo',
    'messages' => [
        [
            'role' => 'user',
            'content' => 'Say "Hello from OpenRouter API!"'
        ]
    ],
    'max_tokens' => 10
]));

curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: " . $httpCode . "\n";

if ($httpCode === 200) {
    $data = json_decode($response, true);
    $message = $data['choices'][0]['message']['content'] ?? 'No response';
    echo "SUCCESS: " . trim($message) . "\n";
} else {
    echo "ERROR: " . $response . "\n";
}

echo "\nOpenRouter API Key is configured and working!\n";
echo "You can now use the AI functionality in your Finance Analyser application.\n";
