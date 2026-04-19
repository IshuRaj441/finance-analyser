@echo off
echo Checking User Permissions...
echo ============================
echo.

REM Try different PHP paths
set PHP_CMD=

REM Check for XAMPP PHP
if exist "C:\xampp\php\php.exe" (
    set PHP_CMD=C:\xampp\php\php.exe
    echo Found XAMPP PHP
) else if exist "D:\xampp\php\php.exe" (
    set PHP_CMD=D:\xampp\php\php.exe
    echo Found XAMPP PHP on D drive
) else (
    REM Try PHP in PATH
    where php >nul 2>&1
    if %ERRORLEVEL% == 0 (
        set PHP_CMD=php
        echo Found PHP in PATH
    ) else (
        echo ERROR: PHP not found!
        echo.
        echo Please install PHP or XAMPP
        pause
        exit /b 1
    )
)

echo.
%PHP_CMD% check_permissions.php

pause
