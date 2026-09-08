<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class MenuController extends Controller
{
    private const ALLOWED_ICONS = [
        'alert',
        'alert-hexa',
        'angle-down',
        'angle-left',
        'angle-right',
        'angle-up',
        'arrow-down',
        'arrow-right',
        'arrow-up',
        'audio',
        'bolt',
        'box',
        'box-cube',
        'box-line',
        'calendar',
        'calender-line',
        'chat',
        'check-circle',
        'check-line',
        'chevron-down',
        'chevron-left',
        'chevron-up',
        'close',
        'close-line',
        'copy',
        'docs',
        'dollar-line',
        'download',
        'envelope',
        'eye',
        'eye-close',
        'file',
        'folder',
        'grid',
        'group',
        'horizontal-dots',
        'info',
        'info-error',
        'info-hexa',
        'list',
        'lock',
        'mail-line',
        'moredot',
        'page',
        'paper-plane',
        'pencil',
        'pie-chart',
        'plug-in',
        'plus',
        'shooting-star',
        'table',
        'task-icon',
        'time',
        'trash',
        'user-circle',
        'user-line',
        'videos',

        'GridIcon',
        'ListIcon',
        'PageIcon',
        'UserCircleIcon',
        'TableIcon',
        'BoxCubeIcon',
        'CalenderIcon',
        'PieChartIcon',
        'PlugInIcon',
    ];


    public function index(): JsonResponse
    {
        $this->authorizeMenu();

        $menus = DB::table('auth_menus as menu')
            ->leftJoin(
                'auth_menus as parent',
                'parent.id',
                '=',
                'menu.parent_id'
            )
            ->leftJoin(
                'auth_permissions as permission',
                'permission.id',
                '=',
                'menu.permission_id'
            )
            ->select([
                'menu.id',
                'menu.parent_id',
                'parent.name as parent_name',
                'menu.name',
                'menu.path',
                'menu.icon',
                'menu.sort_order',
                'menu.permission_id',
                'permission.name as permission_name',
                'permission.slug as permission_slug',
                'menu.badge_key',
                'menu.is_active',
                'menu.is_hidden',
                'menu.created_at',
                'menu.updated_at',
            ])
            ->orderBy('menu.sort_order')
            ->orderBy('menu.id')
            ->get();

        $parentMap = DB::table('auth_menus')
            ->pluck('parent_id', 'id')
            ->all();

        $menus = $menus
            ->map(function ($menu) use ($parentMap) {
                $menu->level = $this->calculateLevel(
                    (int) $menu->id,
                    $parentMap
                );

                $menu->is_active =
                    (bool) $menu->is_active;

                $menu->is_hidden =
                    (bool) $menu->is_hidden;

                return $menu;
            })
            ->values();

        $permissions = DB::table('auth_permissions')
            ->select([
                'id',
                'name',
                'slug',
            ])
            ->orderBy('name')
            ->get();

        return response()->json([
            'menus' => $menus,
            'permissions' => $permissions,
        ]);
    }


    public function store(
        Request $request
    ): JsonResponse {
        $this->authorizeMenu();

        $validated =
            $this->validateMenu(
                $request
            );

        $parentId =
            $validated['parent_id']
            ?? null;

        $this->validateParent(
            $parentId
        );

        $id = DB::table('auth_menus')
            ->insertGetId([
                'parent_id' =>
                    $parentId,

                'name' =>
                    $validated['name'],

                'path' =>
                    $validated['path']
                    ?? null,

                'icon' =>
                    $validated['icon']
                    ?? null,

                'sort_order' =>
                    $validated['sort_order'],

                'permission_id' =>
                    $validated['permission_id']
                    ?? null,

                'badge_key' =>
                    $validated['badge_key']
                    ?? null,

                'is_active' =>
                    $validated['is_active'],

                'is_hidden' =>
                    $validated['is_hidden'],

                'created_at' =>
                    now(),

                'updated_at' =>
                    now(),
            ]);

        return response()->json([
            'message' =>
                'Menu berhasil ditambahkan.',

            'id' =>
                $id,
        ], 201);
    }


    public function update(
        Request $request,
        int $id
    ): JsonResponse {
        $this->authorizeMenu();

        $menu = DB::table('auth_menus')
            ->where('id', $id)
            ->first();

        if (!$menu) {
            return response()->json([
                'message' =>
                    'Menu tidak ditemukan.',
            ], 404);
        }

        $validated =
            $this->validateMenu(
                $request,
                $id
            );

        $parentId =
            $validated['parent_id']
            ?? null;

        $this->validateParent(
            $parentId,
            $id
        );

        $this->validateTreeDepth(
            $id,
            $parentId
        );

        DB::table('auth_menus')
            ->where('id', $id)
            ->update([
                'parent_id' =>
                    $parentId,

                'name' =>
                    $validated['name'],

                'path' =>
                    $validated['path']
                    ?? null,

                'icon' =>
                    $validated['icon']
                    ?? null,

                'sort_order' =>
                    $validated['sort_order'],

                'permission_id' =>
                    $validated['permission_id']
                    ?? null,

                'badge_key' =>
                    $validated['badge_key']
                    ?? null,

                'is_active' =>
                    $validated['is_active'],

                'is_hidden' =>
                    $validated['is_hidden'],

                'updated_at' =>
                    now(),
            ]);

        return response()->json([
            'message' =>
                'Menu berhasil diperbarui.',
        ]);
    }


    public function destroy(
        int $id
    ): JsonResponse {
        $this->authorizeMenu();

        $menu = DB::table('auth_menus')
            ->where('id', $id)
            ->first();

        if (!$menu) {
            return response()->json([
                'message' =>
                    'Menu tidak ditemukan.',
            ], 404);
        }

        $hasChildren =
            DB::table('auth_menus')
                ->where(
                    'parent_id',
                    $id
                )
                ->exists();

        if ($hasChildren) {
            throw ValidationException::withMessages([
                'menu' => [
                    'Menu masih memiliki submenu. Hapus atau pindahkan submenu terlebih dahulu.',
                ],
            ]);
        }

        DB::table('auth_menus')
            ->where('id', $id)
            ->delete();

        return response()->json([
            'message' =>
                'Menu berhasil dihapus.',
        ]);
    }


    private function validateMenu(
        Request $request,
        ?int $ignoreId = null
    ): array {
        return $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
            ],

            'parent_id' => [
                'nullable',
                'integer',
                'exists:auth_menus,id',
            ],

            'path' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^\//',

                Rule::unique(
                    'auth_menus',
                    'path'
                )->ignore($ignoreId),
            ],

            'icon' => [
                'nullable',
                'string',

                Rule::in(
                    self::ALLOWED_ICONS
                ),
            ],

            'sort_order' => [
                'required',
                'integer',
                'min:0',
                'max:65535',
            ],

            'permission_id' => [
                'nullable',
                'integer',
                'exists:auth_permissions,id',
            ],

            'badge_key' => [
                'nullable',
                'string',
                'max:100',
            ],

            'is_active' => [
                'required',
                'boolean',
            ],

            'is_hidden' => [
                'required',
                'boolean',
            ],
        ]);
    }


    private function validateParent(
        ?int $parentId,
        ?int $editingId = null
    ): void {
        if ($parentId === null) {
            return;
        }

        if (
            $editingId !== null &&
            $parentId === $editingId
        ) {
            throw ValidationException::withMessages([
                'parent_id' => [
                    'Menu tidak dapat menjadi parent dirinya sendiri.',
                ],
            ]);
        }

        if (
            $editingId !== null &&
            $this->isDescendant(
                $parentId,
                $editingId
            )
        ) {
            throw ValidationException::withMessages([
                'parent_id' => [
                    'Parent tidak valid karena akan membuat struktur berulang.',
                ],
            ]);
        }

        $parentLevel =
            $this->getMenuLevel(
                $parentId
            );

        if ($parentLevel >= 3) {
            throw ValidationException::withMessages([
                'parent_id' => [
                    'Menu maksimal 3 tingkat.',
                ],
            ]);
        }
    }


    private function validateTreeDepth(
        int $menuId,
        ?int $parentId
    ): void {
        $newLevel =
            $parentId === null
                ? 1
                : $this->getMenuLevel(
                    $parentId
                ) + 1;

        $subtreeHeight =
            $this->getSubtreeHeight(
                $menuId
            );

        $maximumLevel =
            $newLevel +
            $subtreeHeight -
            1;

        if ($maximumLevel > 3) {
            throw ValidationException::withMessages([
                'parent_id' => [
                    'Perubahan parent akan membuat struktur lebih dari 3 tingkat.',
                ],
            ]);
        }
    }


    private function isDescendant(
        int $candidateParentId,
        int $menuId
    ): bool {
        $currentId =
            $candidateParentId;

        $visited = [];

        while ($currentId !== null) {
            if (
                $currentId ===
                $menuId
            ) {
                return true;
            }

            if (
                isset(
                    $visited[
                        $currentId
                    ]
                )
            ) {
                return true;
            }

            $visited[
                $currentId
            ] = true;

            $currentId =
                DB::table('auth_menus')
                    ->where(
                        'id',
                        $currentId
                    )
                    ->value(
                        'parent_id'
                    );
        }

        return false;
    }


    private function getMenuLevel(
        int $menuId
    ): int {
        $level = 1;

        $parentId =
            DB::table('auth_menus')
                ->where(
                    'id',
                    $menuId
                )
                ->value(
                    'parent_id'
                );

        $visited = [];

        while ($parentId !== null) {
            if (
                isset(
                    $visited[
                        $parentId
                    ]
                )
            ) {
                break;
            }

            $visited[
                $parentId
            ] = true;

            $level++;

            $parentId =
                DB::table('auth_menus')
                    ->where(
                        'id',
                        $parentId
                    )
                    ->value(
                        'parent_id'
                    );
        }

        return $level;
    }


    private function getSubtreeHeight(
        int $menuId
    ): int {
        $children =
            DB::table('auth_menus')
                ->where(
                    'parent_id',
                    $menuId
                )
                ->pluck('id');

        if ($children->isEmpty()) {
            return 1;
        }

        $maxHeight = 0;

        foreach (
            $children as $childId
        ) {
            $maxHeight = max(
                $maxHeight,

                $this->getSubtreeHeight(
                    (int) $childId
                )
            );
        }

        return 1 + $maxHeight;
    }


    private function calculateLevel(
        int $menuId,
        array $parentMap
    ): int {
        $level = 1;

        $parentId =
            $parentMap[
                $menuId
            ] ?? null;

        $visited = [];

        while ($parentId !== null) {
            if (
                isset(
                    $visited[
                        $parentId
                    ]
                )
            ) {
                break;
            }

            $visited[
                $parentId
            ] = true;

            $level++;

            $parentId =
                $parentMap[
                    $parentId
                ] ?? null;
        }

        return $level;
    }


    private function authorizeMenu(): void
    {
        $user =
            auth('api')->user();

        if (!$user) {
            abort(
                401,
                'Unauthenticated'
            );
        }

        $allowed =
            DB::table(
                'auth_role_permissions as rp'
            )
                ->join(
                    'auth_permissions as permission',
                    'permission.id',
                    '=',
                    'rp.permission_id'
                )
                ->where(
                    'rp.role_id',
                    $user->role_id
                )
                ->where(
                    'permission.slug',
                    'superadmin.menu'
                )
                ->exists();

        if (!$allowed) {
            abort(
                403,
                'Anda tidak memiliki akses Menu Management.'
            );
        }
    }
}