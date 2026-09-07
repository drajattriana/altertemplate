<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('auth_menus', function (Blueprint $table) {
            $table->id();

            // Relasi ke menu itu sendiri
            // NULL = menu utama
            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('auth_menus')
                ->nullOnDelete()
                ->cascadeOnUpdate();
            $table->string('name', 100);
            $table->string('path', 150)->nullable();
            $table->string('icon', 100)
                ->nullable();

            // Urutan menu
            $table->unsignedSmallInteger('sort_order')
                ->default(0);

            // Permission untuk mengakses menu
            $table->foreignId('permission_id')
                ->nullable()
                ->constrained('auth_permissions')
                ->nullOnDelete()
                ->cascadeOnUpdate();

            // Optional:
            // unread_notifications
            // pending_orders
            $table->string('badge_key', 100)
                ->nullable();

            // Menu aktif/tidak
            $table->boolean('is_active')
                ->default(true);

            // Menu boleh diakses tetapi tidak ditampilkan
            // di sidebar
            $table->boolean('is_hidden')
                ->default(false);

            $table->timestamps();

            $table->index([
                'parent_id',
                'sort_order'
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auth_menus');
    }
};