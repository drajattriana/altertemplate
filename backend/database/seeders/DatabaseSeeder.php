<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AuthRoleSeeder::class,
            AuthUserSeeder::class,

            AuthPermissionSeeder::class,
            AuthRolePermissionSeeder::class,
            AuthMenuSeeder::class,
        ]);
    }
}