<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthPermissionController extends Controller
{
    public function index(): JsonResponse
    {
        $permissions = DB::table('auth_permissions as permission')
            ->select([
                'permission.id',
                'permission.name',
                'permission.slug',
                'permission.created_at',
                'permission.updated_at',
            ])
            ->selectSub(
                function ($query) {
                    $query
                        ->from('auth_menus as menu')
                        ->selectRaw('COUNT(*)')
                        ->whereColumn(
                            'menu.permission_id',
                            'permission.id'
                        );
                },
                'menu_count'
            )
            ->selectSub(
                function ($query) {
                    $query
                        ->from('auth_role_permissions as role_permission')
                        ->selectRaw('COUNT(*)')
                        ->whereColumn(
                            'role_permission.permission_id',
                            'permission.id'
                        );
                },
                'role_count'
            )
            ->orderBy('permission.id')
            ->get()
            ->map(function ($permission) {
                $permission->id =
                    (int) $permission->id;

                $permission->menu_count =
                    (int) $permission->menu_count;

                $permission->role_count =
                    (int) $permission->role_count;

                return $permission;
            })
            ->values();

        return response()->json([
            'permissions' => $permissions,
        ]);
    }


    public function store(
        Request $request
    ): JsonResponse {
        $validated =
            $this->validatePermission(
                $request
            );

        $id = DB::table('auth_permissions')
            ->insertGetId([
                'name' =>
                    $validated['name'],

                'slug' =>
                    $validated['slug'],

                'created_at' =>
                    now(),

                'updated_at' =>
                    now(),
            ]);

        return response()->json([
            'message' =>
                'Permission berhasil ditambahkan.',

            'id' =>
                $id,
        ], 201);
    }


    public function update(
        Request $request,
        int $id
    ): JsonResponse {
        $permission =
            DB::table('auth_permissions')
                ->where('id', $id)
                ->first();

        if (!$permission) {
            return response()->json([
                'message' =>
                    'Permission tidak ditemukan.',
            ], 404);
        }

        $validated =
            $this->validatePermission(
                $request,
                $id
            );

        DB::table('auth_permissions')
            ->where('id', $id)
            ->update([
                'name' =>
                    $validated['name'],

                'slug' =>
                    $validated['slug'],

                'updated_at' =>
                    now(),
            ]);

        return response()->json([
            'message' =>
                'Permission berhasil diperbarui.',
        ]);
    }


    public function destroy(
        int $id
    ): JsonResponse {
        $permission =
            DB::table('auth_permissions')
                ->where('id', $id)
                ->first();

        if (!$permission) {
            return response()->json([
                'message' =>
                    'Permission tidak ditemukan.',
            ], 404);
        }

        $usedByMenu =
            DB::table('auth_menus')
                ->where(
                    'permission_id',
                    $id
                )
                ->exists();

        if ($usedByMenu) {
            throw ValidationException::withMessages([
                'permission' => [
                    'Permission masih digunakan oleh menu. Lepaskan permission dari menu terlebih dahulu.',
                ],
            ]);
        }

        $usedByRole =
            DB::table('auth_role_permissions')
                ->where(
                    'permission_id',
                    $id
                )
                ->exists();

        if ($usedByRole) {
            throw ValidationException::withMessages([
                'permission' => [
                    'Permission masih digunakan oleh role. Lepaskan permission dari role terlebih dahulu.',
                ],
            ]);
        }

        DB::table('auth_permissions')
            ->where('id', $id)
            ->delete();

        return response()->json([
            'message' =>
                'Permission berhasil dihapus.',
        ]);
    }


    private function validatePermission(
        Request $request,
        ?int $ignoreId = null
    ): array {
        $request->merge([
            'name' =>
                trim(
                    (string) $request->input(
                        'name'
                    )
                ),

            'slug' =>
                strtolower(
                    trim(
                        (string) $request->input(
                            'slug'
                        )
                    )
                ),
        ]);

        return $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
            ],

            'slug' => [
                'required',
                'string',
                'max:100',
                'regex:/^[a-z0-9._-]+$/',

                Rule::unique(
                    'auth_permissions',
                    'slug'
                )->ignore(
                    $ignoreId
                ),
            ],
        ]);
    }
}