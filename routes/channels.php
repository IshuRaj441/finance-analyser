<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\User;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// User-specific channels
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Company-specific channels
Broadcast::channel('company.{companyId}', function ($user, $companyId) {
    return (int) $user->company_id === (int) $companyId;
});

// Company transaction channels
Broadcast::channel('company.{companyId}.transactions', function ($user, $companyId) {
    return (int) $user->company_id === (int) $companyId;
});

// Company budget channels
Broadcast::channel('company.{companyId}.budgets', function ($user, $companyId) {
    return (int) $user->company_id === (int) $companyId;
});

// Company dashboard channels
Broadcast::channel('company.{companyId}.dashboard', function ($user, $companyId) {
    return (int) $user->company_id === (int) $companyId;
});

// Company activity channels
Broadcast::channel('company.{companyId}.activity', function ($user, $companyId) {
    return (int) $user->company_id === (int) $companyId;
});

// Company manager channels
Broadcast::channel('company.{companyId}.managers', function ($user, $companyId) {
    return (int) $user->company_id === (int) $companyId && 
           $user->hasAnyRole(['Admin', 'Manager']);
});

// Company admin channels
Broadcast::channel('company.{companyId}.admins', function ($user, $companyId) {
    return (int) $user->company_id === (int) $companyId && 
           $user->hasRole('Admin');
});

// Notification channels
Broadcast::channel('notifications.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// AI chat channels
Broadcast::channel('ai.chat.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId && 
           $user->hasPermissionTo('use_ai_features');
});

// Report generation channels
Broadcast::channel('reports.{companyId}', function ($user, $companyId) {
    return (int) $user->company_id === (int) $companyId && 
           $user->hasPermissionTo('view_report');
});

// Fraud alert channels
Broadcast::channel('fraud-alerts.{companyId}', function ($user, $companyId) {
    return (int) $user->company_id === (int) $companyId && 
           $user->hasPermissionTo('view_fraud_alerts');
});

// System-wide channels (for admins only)
Broadcast::channel('system.maintenance', function ($user) {
    return $user->hasRole('Admin');
});

Broadcast::channel('system.announcements', function ($user) {
    return true; // All authenticated users can receive system announcements
});

// Private message channels
Broadcast::channel('messages.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// File upload progress channels
Broadcast::channel('uploads.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Integration sync channels
Broadcast::channel('integrations.{companyId}', function ($user, $companyId) {
    return (int) $user->company_id === (int) $companyId && 
           $user->hasPermissionTo('manage_integrations');
});

// Backup status channels
Broadcast::channel('backups.{companyId}', function ($user, $companyId) {
    return (int) $user->company_id === (int) $companyId && 
           $user->hasPermissionTo('create_backup');
});
