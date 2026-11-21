<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CatController;
use App\Http\Controllers\Api\InteractionController;
use App\Http\Controllers\Api\InventoryController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/personalities', [CatController::class, 'personalities']);

// Protected routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Pet management
    Route::get('/cat', [CatController::class, 'show']);
    Route::post('/cat/adopt', [CatController::class, 'adopt']);
    Route::patch('/cat/customization', [CatController::class, 'updateCustomization']);
    Route::patch('/cat/room', [CatController::class, 'updateRoom']);

    // Interactions
    Route::post('/cat/interact', [InteractionController::class, 'interact']);
    Route::get('/cat/history', [InteractionController::class, 'history']);

    // Inventory
    Route::get('/inventory', [InventoryController::class, 'index']);
    Route::post('/inventory/use', [InventoryController::class, 'useItem']);
});
