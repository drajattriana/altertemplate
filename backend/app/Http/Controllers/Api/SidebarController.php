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
                'message' => 'Unauthenticated',
            ], 401);
        }

        $permissionIds = DB::table('auth_role_permissions')
            ->where('role_id', $user->role_id)
            ->pluck('permission_id');

        $menus = DB::table('auth_menus')
            ->where('is_active', true)
            ->where('is_hidden', false)
            ->where(function ($query) use ($permissionIds) {
                $query
                    ->whereNull('permission_id')
                    ->orWhereIn('permission_id', $permissionIds);
            })
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $buildTree = function ($parentId = null) use (
            &$buildTree,
            $menus
        ) {
            return $menus
                ->filter(function ($menu) use ($parentId) {
                    if ($parentId === null) {
                        return $menu->parent_id === null;
                    }

                    return (int) $menu->parent_id === (int) $parentId;
                })
                ->map(function ($menu) use (&$buildTree) {
                    return [
                        'id' => $menu->id,
                        'name' => $menu->name,
                        'path' => $menu->path,
                        'icon' => $menu->icon,
                        'sort_order' => $menu->sort_order,
                        'badge_key' => $menu->badge_key,

                        'children' => $buildTree(
                            $menu->id
                        ),
                    ];
                })
                ->values()
                ->all();
        };

        return response()->json([
            'menus' => $buildTree(),
        ]);
    }
}