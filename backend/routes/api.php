<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AuthDocumentationController;
use App\Http\Controllers\Api\AuthMenuController;
use App\Http\Controllers\Api\AuthNotificationController;
use App\Http\Controllers\Api\AuthPermissionController;
use App\Http\Controllers\Api\AuthRoleController;
use App\Http\Controllers\Api\AuthSidebarController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {

    Route::post('/login', [
        AuthController::class,
        'login',
    ]);

    Route::middleware('auth:api')->group(function () {

        // Auth
        Route::get('/me', [
            AuthController::class,
            'me',
        ]);

        Route::put('/password', [
            AuthController::class,
            'updatePassword',
        ]);

        Route::post('/logout', [
            AuthController::class,
            'logout',
        ]);

        Route::get(
            '/documentation',
            [
                AuthDocumentationController::class,
                'index',
            ]
        );



        // Sidebar Access
        Route::get(
            '/sidebar',
            [
                AuthSidebarController::class,
                'index',
            ]
        );

        Route::get(
            '/access',
            [
                AuthSidebarController::class,
                'access',
            ]
        );


        
        // Auth Menus
        Route::middleware(
            'menu.permission:/superadmin/menu'
        )->group(function () {

            Route::get(
                '/menus',
                [
                    AuthMenuController::class,
                    'index',
                ]
            );

            Route::post(
                '/menus',
                [
                    AuthMenuController::class,
                    'store',
                ]
            );

            Route::put(
                '/menus/{id}',
                [
                    AuthMenuController::class,
                    'update',
                ]
            );

            Route::delete(
                '/menus/{id}',
                [
                    AuthMenuController::class,
                    'destroy',
                ]
            );
        });


       // Auth Permisions
        Route::middleware(
            'menu.permission:/superadmin/permissions'
        )->group(function () {

            Route::get(
                '/permissions',
                [
                    AuthPermissionController::class,
                    'index',
                ]
            );

            Route::post(
                '/permissions',
                [
                    AuthPermissionController::class,
                    'store',
                ]
            );

            Route::put(
                '/permissions/{id}',
                [
                    AuthPermissionController::class,
                    'update',
                ]
            );

            Route::delete(
                '/permissions/{id}',
                [
                    AuthPermissionController::class,
                    'destroy',
                ]
            );
        });


       // Auth Roles
        Route::middleware(
            'menu.permission:/superadmin/roles'
        )->group(function () {

            Route::get(
                '/roles',
                [
                    AuthRoleController::class,
                    'index',
                ]
            );

            Route::post(
                '/roles',
                [
                    AuthRoleController::class,
                    'store',
                ]
            );

            Route::put(
                '/roles/{id}',
                [
                    AuthRoleController::class,
                    'update',
                ]
            );

            Route::delete(
                '/roles/{id}',
                [
                    AuthRoleController::class,
                    'destroy',
                ]
            );
        });


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