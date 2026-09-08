<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AuthPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $permissions = [
            // SUPERADMIN
            [
                'name' => 'Superadmin Access',
                'slug' => 'superadmin.access',
            ],
            [
                'name' => 'Superadmin Dashboard',
                'slug' => 'superadmin.dashboard',
            ],
            [
                'name' => 'Menu Management',
                'slug' => 'superadmin.menu',
            ],
            [
                'name' => 'Roles Management',
                'slug' => 'superadmin.roles',
            ],
            [
                'name' => 'Permissions Management',
                'slug' => 'superadmin.permissions',
            ],

            // ADMIN
            [
                'name' => 'Admin Access',
                'slug' => 'admin.access',
            ],
            [
                'name' => 'Admin Dashboard',
                'slug' => 'admin.dashboard',
            ],
        ];

        $rows = array_map(
            function ($permission) use ($now) {
                return [
                    'name' => $permission['name'],
                    'slug' => $permission['slug'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            },
            $permissions
        );

        DB::table('auth_permissions')->upsert(
            $rows,
            ['slug'],
            ['name', 'updated_at']
        );

        /*
        |--------------------------------------------------------------------------
        | HAPUS PERMISSION MENU MODEL LAMA
        |--------------------------------------------------------------------------
        |
        | Kita sekarang hanya menggunakan:
        | superadmin.menu
        |
        */

        $menuPermissionId = DB::table('auth_permissions')
            ->where('slug', 'superadmin.menu')
            ->value('id');

        $obsoletePermissionIds = DB::table('auth_permissions')
            ->whereIn('slug', [
                'superadmin.menu.create',
                'superadmin.menu.list',
                'superadmin.menu.update',
                'superadmin.menu.delete',
            ])
            ->pluck('id');

        if ($obsoletePermissionIds->isNotEmpty()) {
            /*
             * Kalau ada menu lama yang memakai permission lama,
             * pindahkan ke superadmin.menu terlebih dahulu.
             */
            DB::table('auth_menus')
                ->whereIn('permission_id', $obsoletePermissionIds)
                ->update([
                    'permission_id' => $menuPermissionId,
                ]);

            /*
             * Hapus relasi role permission lama.
             */
            DB::table('auth_role_permissions')
                ->whereIn('permission_id', $obsoletePermissionIds)
                ->delete();

            /*
             * Baru hapus permission lama.
             */
            DB::table('auth_permissions')
                ->whereIn('id', $obsoletePermissionIds)
                ->delete();
        }
    }
}