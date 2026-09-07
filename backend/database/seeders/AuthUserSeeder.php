<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthUserSeeder extends Seeder
{
    public function run(): void
    {
        $superadminRole = DB::table('auth_roles')
            ->where('slug', 'superadmin')
            ->first();

        $adminRole = DB::table('auth_roles')
            ->where('slug', 'admin')
            ->first();

        DB::table('auth_users')->updateOrInsert(
            ['username' => 'superadmin'],
            [
                'email' => null,
                'password' => Hash::make('superadmin'),
                'role_id' => $superadminRole->id,
                'is_active' => true,
                'last_login_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('auth_users')->updateOrInsert(
            ['username' => 'admin'],
            [
                'email' => null,
                'password' => Hash::make('admin'),
                'role_id' => $adminRole->id,
                'is_active' => true,
                'last_login_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }
}