<?php

/**
 * Quick Status Checker for WhatsoFlow
 * Run: php check-status.php
 */

echo "=== WhatsoFlow Project Status ===\n\n";

// Check Laravel
echo "1. Laravel Status:\n";
if (file_exists('vendor/autoload.php')) {
    echo "   ✓ Composer dependencies installed\n";
} else {
    echo "   ✗ Run: composer install\n";
}

// Check Node
echo "\n2. Node Dependencies:\n";
if (file_exists('node_modules')) {
    echo "   ✓ Node modules installed\n";
} else {
    echo "   ✗ Run: npm install\n";
}

// Check .env
echo "\n3. Environment:\n";
if (file_exists('.env')) {
    echo "   ✓ .env file exists\n";
} else {
    echo "   ✗ Run: cp .env.example .env && php artisan key:generate\n";
}

// Check Database
echo "\n4. Database:\n";
if (file_exists('database/database.sqlite')) {
    echo "   ✓ SQLite database exists\n";
} else {
    echo "   ⚠ SQLite database not found (create if needed)\n";
}

// Check Routes
echo "\n5. Routes:\n";
$apiRoutes = file_exists('routes/api.php');
if ($apiRoutes) {
    echo "   ✓ API routes file exists\n";
} else {
    echo "   ⚠ API routes file missing - create routes/api.php\n";
}

// Check Pages
echo "\n6. Frontend Pages:\n";
$pages = [
    'Login' => 'resources/js/pages/Login/Login.tsx',
    'Dashboard' => 'resources/js/pages/Dashboard/Dashboard.tsx',
    'Leads' => 'resources/js/pages/Leads/Leads.tsx',
    'Automations' => 'resources/js/pages/Automations/Automations.tsx',
    'Broadcast' => 'resources/js/pages/Broadcast/Broadcast.tsx',
    'Settings' => 'resources/js/pages/Settings/Settings.tsx',
    'Billing' => 'resources/js/pages/Billing/Billing.tsx',
];

foreach ($pages as $name => $path) {
    if (file_exists($path)) {
        echo "   ✓ $name page exists\n";
    } else {
        echo "   ✗ $name page missing: $path\n";
    }
}

// Check Components
echo "\n7. Key Components:\n";
$components = [
    'Switch' => 'resources/js/components/ui/switch.tsx',
    'Textarea' => 'resources/js/components/ui/textarea.tsx',
    'LeadCard' => 'resources/js/components/pipeline/LeadCard.tsx',
    'PipelineColumn' => 'resources/js/components/pipeline/PipelineColumn.tsx',
];

foreach ($components as $name => $path) {
    if (file_exists($path)) {
        echo "   ✓ $name component exists\n";
    } else {
        echo "   ⚠ $name component missing: $path\n";
    }
}

echo "\n=== Next Steps ===\n";
echo "1. Run: composer run dev (starts Laravel + Vite)\n";
echo "2. Visit: http://localhost:8000\n";
echo "3. Check browser console for errors\n";
echo "4. Implement API routes in routes/api.php\n";
echo "\n";

