@echo off
echo Running database seeder to fix AI permissions...
php artisan db:seed --class=RolePermissionSeeder
echo.
echo Seeder completed. Please refresh your browser and try the AI chat again.
pause
