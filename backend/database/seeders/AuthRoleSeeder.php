<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AuthRoleSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('auth_roles')->updateOrInsert(
            ['slug' => 'superadmin'],
            [
                'name' => 'Super Admin',
                'redirect_path' => '/superadmin/dashboard',
                'description' => 'Full access administrator',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('auth_roles')->updateOrInsert(
            ['slug' => 'admin'],
            [
                'name' => 'Admin',
                'redirect_path' => '/admin/dashboard',
                'description' => 'Administrator',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }
}