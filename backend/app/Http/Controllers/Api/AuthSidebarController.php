<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuthSidebarController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth('api')->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $permissionIds = DB::table('auth_role_permissions')
            ->where('role_id', $user->role_id)
            ->pluck('permission_id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $menus = DB::table('auth_menus')
            ->where('is_active', true)
            ->where('is_hidden', false)
            ->where(function ($query) use ($permissionIds) {
                $query->whereNull(
                    'permission_id'
                );

                if (!empty($permissionIds)) {
                    $query->orWhereIn(
                        'permission_id',
                        $permissionIds
                    );
                }
            })
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get([
                'id',
                'parent_id',
                'name',
                'path',
                'icon',
                'sort_order',
                'permission_id',
                'badge_key',
            ]);

        $grouped = $menus->groupBy(function ($menu) {
            return $menu->parent_id === null
                ? 'root'
                : (string) $menu->parent_id;
        });

        $buildTree = function (
            ?int $parentId
        ) use (&$buildTree, $grouped): array {
            $key = $parentId === null
                ? 'root'
                : (string) $parentId;

            $items = $grouped->get(
                $key,
                collect()
            );

            return $items
                ->map(function ($menu) use (&$buildTree) {
                    return [
                        'id' => (int) $menu->id,
                        'name' => $menu->name,
                        'path' => $menu->path,
                        'icon' => $menu->icon,
                        'sort_order' => (int) $menu->sort_order,
                        'badge_key' => $menu->badge_key,
                        'children' => $buildTree(
                            (int) $menu->id
                        ),
                    ];
                })
                ->values()
                ->all();
        };

        return response()->json([
            'menus' => $buildTree(null),
        ]);
    }


    public function access(
        Request $request
    ): JsonResponse {
        $user = auth('api')->user();

        if (!$user) {
            abort(404);
        }

        $path = trim(
            (string) $request->query(
                'path'
            )
        );

        if (
            $path === '' ||
            !str_starts_with(
                $path,
                '/'
            )
        ) {
            abort(404);
        }

        $menu = DB::table('auth_menus')
            ->where('path', $path)
            ->where('is_active', true)
            ->first([
                'id',
                'permission_id',
            ]);

        if (!$menu) {
            abort(404);
        }


        /*
        |--------------------------------------------------------------------------
        | TANPA PERMISSION
        |--------------------------------------------------------------------------
        */

        if ($menu->permission_id === null) {
            return response()->json([
                'allowed' => true,
            ]);
        }


        /*
        |--------------------------------------------------------------------------
        | DENGAN PERMISSION
        |--------------------------------------------------------------------------
        */

        $allowed = DB::table('auth_role_permissions')
            ->where(
                'role_id',
                $user->role_id
            )
            ->where(
                'permission_id',
                $menu->permission_id
            )
            ->exists();

        if (!$allowed) {
            abort(404);
        }

        return response()->json([
            'allowed' => true,
        ]);
    }
}