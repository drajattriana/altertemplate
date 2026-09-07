<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('auth_role_permissions', function (Blueprint $table) {

            $table->foreignId('role_id')
                ->constrained('auth_roles')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->foreignId('permission_id')
                ->constrained('auth_permissions')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            // Supaya permission yang sama tidak bisa
            // dimasukkan 2x ke role yang sama
            $table->primary([
                'role_id',
                'permission_id'
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auth_role_permissions');
    }
};