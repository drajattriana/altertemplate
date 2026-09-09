<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Route as LaravelRoute;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

class AuthDocumentationController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth('api')->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $routes = collect(
            Route::getRoutes()->getRoutes()
        )
            ->filter(function (LaravelRoute $route) {
                return str_starts_with(
                    $route->uri(),
                    'api/'
                );
            })
            ->filter(function (LaravelRoute $route) use ($user) {
                return $this->canViewRoute(
                    $route,
                    (int) $user->role_id
                );
            })
            ->map(function (LaravelRoute $route) {
                $middleware =
                    $route->gatherMiddleware();

                $methods =
                    collect(
                        $route->methods()
                    )
                        ->reject(
                            fn ($method) =>
                                in_array(
                                    $method,
                                    [
                                        'HEAD',
                                        'OPTIONS',
                                    ],
                                    true
                                )
                        )
                        ->values()
                        ->all();

                $uri =
                    preg_replace(
                        '/^api/',
                        '',
                        $route->uri()
                    );

                return [
                    'methods' =>
                        $methods,

                    'uri' =>
                        $uri,

                    'protected' =>
                        collect($middleware)
                            ->contains(
                                fn ($item) =>
                                    is_string($item) &&
                                    str_starts_with(
                                        $item,
                                        'auth:'
                                    )
                            ),

                    'menu_guard' =>
                        $this->getMenuGuard(
                            $middleware
                        ),
                ];
            })
            ->sortBy([
                [
                    'uri',
                    'asc',
                ],
            ])
            ->values();

        return response()->json([
            'routes' =>
                $routes,
        ]);
    }


    private function canViewRoute(
        LaravelRoute $route,
        int $roleId
    ): bool {
        $menuPath =
            $this->getMenuGuard(
                $route->gatherMiddleware()
            );

        if (
            $menuPath === null
        ) {
            return true;
        }

        $menu =
            DB::table('auth_menus')
                ->where(
                    'path',
                    $menuPath
                )
                ->where(
                    'is_active',
                    true
                )
                ->first([
                    'id',
                    'permission_id',
                ]);

        if (!$menu) {
            return false;
        }

        if (
            $menu->permission_id ===
            null
        ) {
            return true;
        }

        return DB::table(
            'auth_role_permissions'
        )
            ->where(
                'role_id',
                $roleId
            )
            ->where(
                'permission_id',
                $menu->permission_id
            )
            ->exists();
    }


    private function getMenuGuard(
        array $middleware
    ): ?string {
        foreach (
            $middleware as $item
        ) {
            if (
                !is_string($item) ||
                !str_starts_with(
                    $item,
                    'menu.permission:'
                )
            ) {
                continue;
            }

            return substr(
                $item,
                strlen(
                    'menu.permission:'
                )
            );
        }

        return null;
    }
}