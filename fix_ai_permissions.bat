@echo off
echo Fixing AI permissions for all users...
echo.
php fix_ai_permissions.php
echo.
echo If PHP is not found in PATH, you may need to run this from your PHP installation directory or use:
echo "C:\path\to\php\php.exe" fix_ai_permissions.php
echo.
pause
