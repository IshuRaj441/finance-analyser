<?php

echo "Debug Laravel kernel...<br>";

require_once __DIR__ . '/../vendor/autoload.php';

try {
    $app = require_once __DIR__ . '/../bootstrap/app.php';
    echo "App created successfully<br>";
    
    $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
    echo "Kernel created successfully<br>";
    
    $request = Illuminate\Http\Request::capture();
    echo "Request captured successfully<br>";
    
    $response = $kernel->handle($request);
    echo "Request handled successfully<br>";
    
    $response->send();
    echo "Response sent successfully<br>";
    
    $kernel->terminate($request, $response);
    echo "Kernel terminated successfully<br>";
    
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "<br>";
    echo "File: " . $e->getFile() . "<br>";
    echo "Line: " . $e->getLine() . "<br>";
    echo "Trace: <pre>" . $e->getTraceAsString() . "</pre>";
} catch (Error $e) {
    echo "Error: " . $e->getMessage() . "<br>";
    echo "File: " . $e->getFile() . "<br>";
    echo "Line: " . $e->getLine() . "<br>";
    echo "Trace: <pre>" . $e->getTraceAsString() . "</pre>";
}
