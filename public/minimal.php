<?php

echo "Minimal test working!";
echo "<br>";
echo "PHP version: " . phpversion();
echo "<br>";
echo "Server time: " . date('Y-m-d H:i:s');

// Test database connection
try {
    $pdo = new PDO('mysql:host=mysql;dbname=finance_analyser', 'finance_user', 'secret');
    echo "<br>Database connection: SUCCESS";
} catch (PDOException $e) {
    echo "<br>Database connection: FAILED - " . $e->getMessage();
}

// Test Redis connection
try {
    $redis = new Redis();
    $redis->connect('redis', 6379);
    echo "<br>Redis connection: SUCCESS";
} catch (Exception $e) {
    echo "<br>Redis connection: FAILED - " . $e->getMessage();
}
