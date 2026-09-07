<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('auth_users', function (Blueprint $table) {
            $table->id();

            $table->string('username', 50)->unique();

            $table->string('email', 255)
                ->nullable()
                ->unique();

            $table->string('password', 255);

            $table->foreignId('role_id')
                ->constrained('auth_roles')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->boolean('is_active')
                ->default(true);

            // Diisi manual hanya ketika login berhasil
            $table->timestamp('last_login_at')
                ->nullable();

            // Untuk fitur Remember Me Laravel
            $table->rememberToken();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auth_users');
    }
};