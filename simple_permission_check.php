<?php

// Simple database connection check
try {
    $pdo = new PDO(
        'mysql:host=' . ($_ENV['DB_HOST'] ?? '127.0.0.1') . 
        ';dbname=' . ($_ENV['DB_DATABASE'] ?? 'finance_analyser'),
        $_ENV['DB_USERNAME'] ?? 'root',
        $_ENV['DB_PASSWORD'] ?? ''
    );
    
    echo "Database connection: SUCCESS\n\n";
    
    // Check if users exist
    $stmt = $pdo->query("SELECT id, email, company_id FROM users LIMIT 1");
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo "Found user:\n";
        echo "- ID: " . $user['id'] . "\n";
        echo "- Email: " . $user['email'] . "\n";
        echo "- Company ID: " . $user['company_id'] . "\n\n";
        
        // Check permissions
        $stmt = $pdo->prepare("
            SELECT p.name, m.name as guard_name
            FROM permissions p
            JOIN model_has_permissions mhp ON p.id = mhp.permission_id
            JOIN guards m ON mhp.guard_name = m.name
            WHERE mhp.model_id = ? AND mhp.model_type = ?
        ");
        $stmt->execute([$user['id'], 'App\\Models\\User']);
        
        $permissions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "User permissions:\n";
        $hasAI = false;
        foreach ($permissions as $permission) {
            echo "- " . $permission['name'] . " (guard: " . $permission['guard_name'] . ")\n";
            if ($permission['name'] === 'use_ai_features') {
                $hasAI = true;
            }
        }
        
        if (!$hasAI) {
            echo "\n❌ User does NOT have 'use_ai_features' permission\n";
            
            // Check if permission exists
            $stmt = $pdo->prepare("SELECT id, guard_name FROM permissions WHERE name = ?");
            $stmt->execute(['use_ai_features']);
            $permCheck = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo "Available 'use_ai_features' permissions:\n";
            foreach ($permCheck as $perm) {
                echo "- ID: " . $perm['id'] . " (guard: " . $perm['guard_name'] . ")\n";
            }
            
            if (empty($permCheck)) {
                echo "❌ 'use_ai_features' permission does not exist in database\n";
            }
        } else {
            echo "\n✅ User HAS 'use_ai_features' permission\n";
        }
        
    } else {
        echo "❌ No users found in database\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
