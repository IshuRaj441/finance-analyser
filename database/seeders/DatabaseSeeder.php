<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Company;
use App\Models\Category;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
        ]);

        $company = Company::create([
            'name' => 'Demo Company',
            'slug' => 'demo-company',
            'plan' => 'enterprise',
            'status' => 'active',
            'max_users' => 100,
            'max_storage_mb' => 10000,
            'can_export_reports' => true,
            'can_use_ai_features' => true,
            'can_integrate_apis' => true,
        ]);

        $admin = User::create([
            'company_id' => $company->id,
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'status' => 'active',
            'is_company_admin' => true,
        ]);
        $admin->assignRole('Admin');

        $manager = User::create([
            'company_id' => $company->id,
            'first_name' => 'Manager',
            'last_name' => 'User',
            'email' => 'manager@example.com',
            'password' => Hash::make('password'),
            'status' => 'active',
        ]);
        $manager->assignRole('Manager');

        $accountant = User::create([
            'company_id' => $company->id,
            'first_name' => 'Accountant',
            'last_name' => 'User',
            'email' => 'accountant@example.com',
            'password' => Hash::make('password'),
            'status' => 'active',
        ]);
        $accountant->assignRole('Accountant');

        $employee = User::create([
            'company_id' => $company->id,
            'first_name' => 'Employee',
            'last_name' => 'User',
            'email' => 'employee@example.com',
            'password' => Hash::make('password'),
            'status' => 'active',
        ]);
        $employee->assignRole('Employee');

        $viewer = User::create([
            'company_id' => $company->id,
            'first_name' => 'Viewer',
            'last_name' => 'User',
            'email' => 'viewer@example.com',
            'password' => Hash::make('password'),
            'status' => 'active',
        ]);
        $viewer->assignRole('Viewer');

        $categories = [
            ['name' => 'Office Supplies', 'type' => 'expense', 'color' => '#3B82F6'],
            ['name' => 'Software', 'type' => 'expense', 'color' => '#8B5CF6'],
            ['name' => 'Marketing', 'type' => 'expense', 'color' => '#EC4899'],
            ['name' => 'Travel', 'type' => 'expense', 'color' => '#F59E0B'],
            ['name' => 'Salaries', 'type' => 'expense', 'color' => '#EF4444'],
            ['name' => 'Rent', 'type' => 'expense', 'color' => '#6B7280'],
            ['name' => 'Sales', 'type' => 'income', 'color' => '#10B981'],
            ['name' => 'Services', 'type' => 'income', 'color' => '#06B6D4'],
            ['name' => 'Investments', 'type' => 'income', 'color' => '#84CC16'],
        ];

        foreach ($categories as $category) {
            Category::create([
                'company_id' => $company->id,
                'name' => $category['name'],
                'slug' => str($category['name'])->slug(),
                'type' => $category['type'],
                'color' => $category['color'],
                'is_system' => true,
            ]);
        }
    }
}
