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
                'name' => 'Create Menu',
                'slug' => 'superadmin.menu.create',
            ],
            [
                'name' => 'List Menu',
                'slug' => 'superadmin.menu.list',
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

        $rows = array_map(function ($permission) use ($now) {
            return [
                'name' => $permission['name'],
                'slug' => $permission['slug'],
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }, $permissions);

        DB::table('auth_permissions')->upsert(
            $rows,
            ['slug'],
            ['name', 'updated_at']
        );
    }
}