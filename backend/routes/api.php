<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\SidebarController;

Route::prefix('auth')->group(function () {

    Route::post('/login', [
        AuthController::class,
        'login'
    ]);

    Route::middleware('auth:api')->group(function () {

        Route::get('/me', [
            AuthController::class,
            'me'
        ]);

        Route::post('/logout', [
            AuthController::class,
            'logout'
        ]);

        Route::get(
            '/sidebar',
            [SidebarController::class, 'index']
        );

        // Auth Menus
        Route::get(
            '/menus',
            [MenuController::class, 'index']
        );

        Route::post(
            '/menus',
            [MenuController::class, 'store']
        );

        Route::put(
            '/menus/{id}',
            [MenuController::class, 'update']
        );

        Route::delete(
            '/menus/{id}',
            [MenuController::class, 'destroy']
        );

    });

});