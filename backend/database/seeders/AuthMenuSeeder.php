<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class AuthMenuSeeder extends Seeder
{
    public function run(): void
    {
        $permissionIds =
            DB::table('auth_permissions')
                ->pluck(
                    'id',
                    'slug'
                );

        if (
            $permissionIds
                ->isEmpty()
        ) {
            throw new RuntimeException(
                'Permission belum tersedia.'
            );
        }

        $saveMenu = function (
            string $name,
            ?int $parentId,
            ?string $path,
            ?string $icon,
            int $sortOrder,
            string $permissionSlug
        ) use ($permissionIds): int {

            if (
                !isset(
                    $permissionIds[
                        $permissionSlug
                    ]
                )
            ) {
                throw new RuntimeException(
                    "Permission {$permissionSlug} tidak ditemukan."
                );
            }

            $query =
                DB::table(
                    'auth_menus'
                )
                    ->where(
                        'name',
                        $name
                    );

            if (
                $parentId === null
            ) {
                $query->whereNull(
                    'parent_id'
                );
            } else {
                $query->where(
                    'parent_id',
                    $parentId
                );
            }

            $existing =
                $query->first();

            $data = [
                'parent_id' =>
                    $parentId,

                'name' =>
                    $name,

                'path' =>
                    $path,

                'icon' =>
                    $icon,

                'sort_order' =>
                    $sortOrder,

                'permission_id' =>
                    $permissionIds[
                        $permissionSlug
                    ],

                'badge_key' =>
                    null,

                'is_active' =>
                    true,

                'is_hidden' =>
                    false,

                'updated_at' =>
                    now(),
            ];

            if ($existing) {
                DB::table(
                    'auth_menus'
                )
                    ->where(
                        'id',
                        $existing->id
                    )
                    ->update(
                        $data
                    );

                return (int)
                    $existing->id;
            }

            return DB::table(
                'auth_menus'
            )->insertGetId([
                ...$data,

                'created_at' =>
                    now(),
            ]);
        };


        /*
        |--------------------------------------------------------------------------
        | SUPERADMIN
        |--------------------------------------------------------------------------
        */

        $superadminRoot =
            $saveMenu(
                'Dashboard Superadmin',
                null,
                null,
                null,
                1,
                'superadmin.access'
            );

        $saveMenu(
            'Beranda',
            $superadminRoot,
            '/superadmin/dashboard',
            'GridIcon',
            1,
            'superadmin.access'
        );

        $saveMenu(
            'Roles',
            $superadminRoot,
            '/superadmin/roles',
            'UserCircleIcon',
            2,
            'superadmin.access'
        );

        $saveMenu(
            'Permissions',
            $superadminRoot,
            '/superadmin/permissions',
            'PageIcon',
            3,
            'superadmin.access'
        );

        $saveMenu(
            'Menu',
            $superadminRoot,
            '/superadmin/menu',
            'ListIcon',
            4,
            'superadmin.access'
        );


        /*
        |--------------------------------------------------------------------------
        | ADMIN
        |--------------------------------------------------------------------------
        */

        $adminRoot =
            $saveMenu(
                'Dashboard Admin',
                null,
                null,
                null,
                2,
                'admin.access'
            );

        $saveMenu(
            'Beranda',
            $adminRoot,
            '/admin/dashboard',
            'GridIcon',
            1,
            'admin.access'
        );
    }
}