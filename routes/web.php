<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return response()->json(['message' => 'Finance Analyser API is running', 'status' => 'ok']);
});

Route::get('/test', function () {
    return response()->json(['test' => 'working', 'timestamp' => now()]);
});

Route::get('/debug', function () {
    return response()->json([
        'debug' => 'working',
        'laravel_version' => app()->version(),
        'environment' => app()->environment(),
        'timestamp' => now(),
        'database_connected' => \DB::connection()->getPdo() ? true : false,
    ]);
});

// Serve React frontend for all non-API routes
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '^(?!api).*');
