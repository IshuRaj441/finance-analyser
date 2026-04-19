@echo off
echo Finance Analyser - AI Testing Script
echo ====================================
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
        echo Please install PHP or XAMPP:
        echo 1. Download XAMPP from https://www.apachefriends.org/
        echo 2. Install and start Apache+MySQL
        echo 3. Run this script again
        echo.
        pause
        exit /b 1
    )
)

echo.
echo Testing AI Configuration...
echo ==========================
echo.

REM Test AI configuration
%PHP_CMD% test_ai.php

if %ERRORLEVEL% neq 0 (
    echo.
    echo AI test failed. Please check:
    echo 1. OpenAI API key is set in .env file
    echo 2. Database is configured
    echo 3. Laravel dependencies are installed
    echo.
    pause
    exit /b 1
)

echo.
echo AI test completed successfully!
echo.
echo Next steps:
echo 1. Make sure your OpenAI API key is set in .env
echo 2. Start your Laravel application: %PHP_CMD% artisan serve
echo 3. Test the AI assistant in the frontend
echo.
pause
