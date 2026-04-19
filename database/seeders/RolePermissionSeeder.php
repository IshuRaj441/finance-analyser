<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // User Management
            'create_user',
            'view_user',
            'update_user',
            'delete_user',
            'manage_user_roles',
            
            // Company Management
            'create_company',
            'view_company',
            'update_company',
            'delete_company',
            'manage_company_settings',
            
            // Transaction Management
            'create_transaction',
            'view_transaction',
            'update_transaction',
            'delete_transaction',
            'approve_transaction',
            'reject_transaction',
            
            // Category Management
            'create_category',
            'view_category',
            'update_category',
            'delete_category',
            
            // Budget Management
            'create_budget',
            'view_budget',
            'update_budget',
            'delete_budget',
            
            // Report Management
            'create_report',
            'view_report',
            'update_report',
            'delete_report',
            'export_report',
            
            // File Management
            'upload_file',
            'download_file',
            'delete_file',
            
            // Dashboard Management
            'view_dashboard',
            'customize_dashboard',
            
            // Audit & Logs
            'view_audit_logs',
            'export_audit_logs',
            
            // Notifications
            'send_notification',
            'manage_notifications',
            
            // Backup & Restore
            'create_backup',
            'restore_backup',
            'download_backup',
            
            // Integrations
            'manage_integrations',
            'sync_integrations',
            
            // AI Features
            'use_ai_features',
            'view_ai_insights',
            
            // Fraud Detection
            'view_fraud_alerts',
            'manage_fraud_alerts',
            
            // System Settings
            'manage_settings',
            'view_system_logs',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'api']);
        }

        $roles = [
            'Admin' => [
                'create_user', 'view_user', 'update_user', 'delete_user', 'manage_user_roles',
                'create_company', 'view_company', 'update_company', 'delete_company', 'manage_company_settings',
                'create_transaction', 'view_transaction', 'update_transaction', 'delete_transaction', 'approve_transaction', 'reject_transaction',
                'create_category', 'view_category', 'update_category', 'delete_category',
                'create_budget', 'view_budget', 'update_budget', 'delete_budget',
                'create_report', 'view_report', 'update_report', 'delete_report', 'export_report',
                'upload_file', 'download_file', 'delete_file',
                'view_dashboard', 'customize_dashboard',
                'view_audit_logs', 'export_audit_logs',
                'send_notification', 'manage_notifications',
                'create_backup', 'restore_backup', 'download_backup',
                'manage_integrations', 'sync_integrations',
                'use_ai_features', 'view_ai_insights',
                'view_fraud_alerts', 'manage_fraud_alerts',
                'manage_settings', 'view_system_logs',
            ],
            'Manager' => [
                'view_user', 'update_user',
                'view_company', 'update_company',
                'create_transaction', 'view_transaction', 'update_transaction',
                'approve_transaction', 'reject_transaction',
                'view_category', 'update_category',
                'create_budget', 'view_budget', 'update_budget',
                'create_report', 'view_report', 'export_report',
                'upload_file', 'download_file',
                'view_dashboard', 'customize_dashboard',
                'view_audit_logs',
                'send_notification',
                'manage_integrations',
                'use_ai_features', 'view_ai_insights',
                'view_fraud_alerts', 'manage_fraud_alerts',
            ],
            'Accountant' => [
                'create_transaction', 'view_transaction', 'update_transaction',
                'view_category',
                'create_budget', 'view_budget', 'update_budget',
                'create_report', 'view_report', 'export_report',
                'upload_file', 'download_file',
                'view_dashboard',
                'view_audit_logs',
                'use_ai_features', 'view_ai_insights',
            ],
            'Employee' => [
                'create_transaction', 'view_transaction', 'update_transaction',
                'view_category',
                'view_budget',
                'view_report',
                'upload_file', 'download_file',
                'view_dashboard',
                'use_ai_features', 'view_ai_insights',
            ],
            'Viewer' => [
                'view_transaction',
                'view_category',
                'view_budget',
                'view_report',
                'download_file',
                'view_dashboard',
                'use_ai_features', 'view_ai_insights',
            ],
        ];

        foreach ($roles as $roleName => $rolePermissions) {
            $role = Role::firstOrCreate(['name' => $roleName]);
            $role->givePermissionTo($rolePermissions);
        }
    }
}
