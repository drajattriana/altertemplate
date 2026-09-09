<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthRoleController extends Controller
{
    public function index(): JsonResponse
    {
        $roles = DB::table('auth_roles as role')
            ->select([
                'role.id',
                'role.name',
                'role.slug',
                'role.redirect_path',
                'role.description',
                'role.created_at',
                'role.updated_at',
            ])
            ->selectSub(
                function ($query) {
                    $query
                        ->from('auth_users as user')
                        ->selectRaw('COUNT(*)')
                        ->whereColumn(
                            'user.role_id',
                            'role.id'
                        );
                },
                'user_count'
            )
            ->selectSub(
                function ($query) {
                    $query
                        ->from('auth_role_permissions as role_permission')
                        ->selectRaw('COUNT(*)')
                        ->whereColumn(
                            'role_permission.role_id',
                            'role.id'
                        );
                },
                'permission_count'
            )
            ->orderBy('role.id')
            ->get();

        $rolePermissions =
            DB::table('auth_role_permissions')
                ->select([
                    'role_id',
                    'permission_id',
                ])
                ->get()
                ->groupBy('role_id');

        $roles = $roles
            ->map(function ($role) use ($rolePermissions) {
                $role->id =
                    (int) $role->id;

                $role->user_count =
                    (int) $role->user_count;

                $role->permission_count =
                    (int) $role->permission_count;

                $role->permission_ids =
                    collect(
                        $rolePermissions->get(
                            $role->id,
                            collect()
                        )
                    )
                        ->pluck('permission_id')
                        ->map(
                            fn ($id) => (int) $id
                        )
                        ->values()
                        ->all();

                return $role;
            })
            ->values();

        $permissions =
            DB::table('auth_permissions')
                ->select([
                    'id',
                    'name',
                    'slug',
                ])
                ->orderBy('slug')
                ->get()
                ->map(function ($permission) {
                    $permission->id =
                        (int) $permission->id;

                    return $permission;
                })
                ->values();

        return response()->json([
            'roles' =>
                $roles,

            'permissions' =>
                $permissions,
        ]);
    }


    public function store(
        Request $request
    ): JsonResponse {
        $validated =
            $this->validateRole(
                $request
            );

        $roleId =
            DB::transaction(
                function () use ($validated) {
                    $roleId =
                        DB::table('auth_roles')
                            ->insertGetId([
                                'name' =>
                                    $validated['name'],

                                'slug' =>
                                    $validated['slug'],

                                'redirect_path' =>
                                    $validated['redirect_path'],

                                'description' =>
                                    $validated['description']
                                    ?? null,

                                'created_at' =>
                                    now(),

                                'updated_at' =>
                                    now(),
                            ]);

                    $this->syncPermissions(
                        $roleId,
                        $validated['permission_ids']
                        ?? []
                    );

                    return $roleId;
                }
            );

        return response()->json([
            'message' =>
                'Role berhasil ditambahkan.',

            'id' =>
                $roleId,
        ], 201);
    }


    public function update(
        Request $request,
        int $id
    ): JsonResponse {
        $role =
            DB::table('auth_roles')
                ->where('id', $id)
                ->first();

        if (!$role) {
            return response()->json([
                'message' =>
                    'Role tidak ditemukan.',
            ], 404);
        }

        $validated =
            $this->validateRole(
                $request,
                $id
            );

        DB::transaction(
            function () use (
                $id,
                $validated
            ) {
                DB::table('auth_roles')
                    ->where('id', $id)
                    ->update([
                        'name' =>
                            $validated['name'],

                        'slug' =>
                            $validated['slug'],

                        'redirect_path' =>
                            $validated['redirect_path'],

                        'description' =>
                            $validated['description']
                            ?? null,

                        'updated_at' =>
                            now(),
                    ]);

                $this->syncPermissions(
                    $id,
                    $validated['permission_ids']
                    ?? []
                );
            }
        );

        return response()->json([
            'message' =>
                'Role berhasil diperbarui.',
        ]);
    }


    public function destroy(
        int $id
    ): JsonResponse {
        $role =
            DB::table('auth_roles')
                ->where('id', $id)
                ->first();

        if (!$role) {
            return response()->json([
                'message' =>
                    'Role tidak ditemukan.',
            ], 404);
        }

        $usedByUser =
            DB::table('auth_users')
                ->where(
                    'role_id',
                    $id
                )
                ->exists();

        if ($usedByUser) {
            throw ValidationException::withMessages([
                'role' => [
                    'Role masih digunakan oleh user. Pindahkan role user terlebih dahulu.',
                ],
            ]);
        }

        DB::transaction(
            function () use ($id) {
                DB::table(
                    'auth_role_permissions'
                )
                    ->where(
                        'role_id',
                        $id
                    )
                    ->delete();

                DB::table('auth_roles')
                    ->where('id', $id)
                    ->delete();
            }
        );

        return response()->json([
            'message' =>
                'Role berhasil dihapus.',
        ]);
    }


    private function validateRole(
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

            'redirect_path' =>
                trim(
                    (string) $request->input(
                        'redirect_path'
                    )
                ),

            'description' =>
                $request->input(
                    'description'
                ) !== null
                    ? trim(
                        (string) $request->input(
                            'description'
                        )
                    )
                    : null,
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
                    'auth_roles',
                    'slug'
                )->ignore(
                    $ignoreId
                ),
            ],

            'redirect_path' => [
                'required',
                'string',
                'max:255',
                'regex:/^\//',
            ],

            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'permission_ids' => [
                'nullable',
                'array',
            ],

            'permission_ids.*' => [
                'integer',
                'distinct',
                'exists:auth_permissions,id',
            ],
        ]);
    }


    private function syncPermissions(
        int $roleId,
        array $permissionIds
    ): void {
        DB::table(
            'auth_role_permissions'
        )
            ->where(
                'role_id',
                $roleId
            )
            ->delete();

        if (
            count($permissionIds) === 0
        ) {
            return;
        }

        $rows =
            collect($permissionIds)
                ->unique()
                ->map(
                    function ($permissionId) use ($roleId) {
                        return [
                            'role_id' =>
                                $roleId,

                            'permission_id' =>
                                (int) $permissionId,
                        ];
                    }
                )
                ->values()
                ->all();

        DB::table(
            'auth_role_permissions'
        )->insert(
            $rows
        );
    }
}