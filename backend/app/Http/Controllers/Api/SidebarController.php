<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class SidebarController extends Controller
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

        if (empty($permissionIds)) {
            return response()->json([
                'menus' => [],
            ]);
        }

        $menus = DB::table('auth_menus')
            ->where('is_active', true)
            ->where('is_hidden', false)
            ->whereNotNull('permission_id')
            ->whereIn('permission_id', $permissionIds)
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
}