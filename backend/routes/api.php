<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AuthNotificationController;
use App\Http\Controllers\Api\AuthPermissionController;
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

        // Auth Permissions
        Route::get(
            '/permissions',
            [AuthPermissionController::class, 'index']
        );

        Route::post(
            '/permissions',
            [AuthPermissionController::class, 'store']
        );

        Route::put(
            '/permissions/{id}',
            [AuthPermissionController::class, 'update']
        );

        Route::delete(
            '/permissions/{id}',
            [AuthPermissionController::class, 'destroy']
        );

        // Notification
        Route::get(
            '/notifications',
            [
                AuthNotificationController::class,
                'index',
            ]
        );
        Route::get(
            '/notifications/badges',
            [
                AuthNotificationController::class,
                'badges',
            ]
        );
    });
});
