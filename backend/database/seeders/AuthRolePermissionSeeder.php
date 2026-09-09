<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class AuthRolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $this->syncPermissions(
            'superadmin',
            [
                'superadmin.access',
            ]
        );

        $this->syncPermissions(
            'admin',
            [
                'admin.access',
            ]
        );
    }


    private function syncPermissions(
        string $roleSlug,
        array $permissionSlugs
    ): void {
        $roleId =
            DB::table('auth_roles')
                ->where(
                    'slug',
                    $roleSlug
                )
                ->value('id');

        if (!$roleId) {
            throw new RuntimeException(
                "Role {$roleSlug} tidak ditemukan."
            );
        }

        $permissionIds =
            DB::table(
                'auth_permissions'
            )
                ->whereIn(
                    'slug',
                    $permissionSlugs
                )
                ->pluck('id')
                ->all();

        if (
            count(
                $permissionIds
            ) !==
            count(
                $permissionSlugs
            )
        ) {
            throw new RuntimeException(
                "Permission untuk role {$roleSlug} tidak lengkap."
            );
        }

        DB::table(
            'auth_role_permissions'
        )
            ->where(
                'role_id',
                $roleId
            )
            ->delete();

        foreach (
            $permissionIds
            as $permissionId
        ) {
            DB::table(
                'auth_role_permissions'
            )->insert([
                'role_id' =>
                    $roleId,

                'permission_id' =>
                    $permissionId,
            ]);
        }
    }
}