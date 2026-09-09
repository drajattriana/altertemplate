<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class AuthPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $permissions = [
            [
                'name' =>
                    'Superadmin Access',

                'slug' =>
                    'superadmin.access',
            ],
            [
                'name' =>
                    'Admin Access',

                'slug' =>
                    'admin.access',
            ],
        ];

        $rows = array_map(
            function ($permission) use ($now) {
                return [
                    'name' =>
                        $permission['name'],

                    'slug' =>
                        $permission['slug'],

                    'created_at' =>
                        $now,

                    'updated_at' =>
                        $now,
                ];
            },
            $permissions
        );

        DB::table('auth_permissions')
            ->upsert(
                $rows,
                ['slug'],
                [
                    'name',
                    'updated_at',
                ]
            );

        $superadminAccessId =
            DB::table('auth_permissions')
                ->where(
                    'slug',
                    'superadmin.access'
                )
                ->value('id');

        $adminAccessId =
            DB::table('auth_permissions')
                ->where(
                    'slug',
                    'admin.access'
                )
                ->value('id');

        if (
            !$superadminAccessId ||
            !$adminAccessId
        ) {
            throw new RuntimeException(
                'Permission utama tidak ditemukan.'
            );
        }


    }
}