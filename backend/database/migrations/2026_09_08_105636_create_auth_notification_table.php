<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('auth_notification', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('auth_users')
                ->cascadeOnDelete();

            $table->string('badge_key', 100)
                ->nullable();


            $table->string('title', 150);

            $table->text('message');

            $table->string('url', 255)
                ->nullable();

            $table->string('reference_type', 100)
                ->nullable();

            $table->unsignedBigInteger('reference_id')
                ->nullable();


            $table->boolean('is_read')
                ->default(false);

            $table->timestamp('read_at')
                ->nullable();



            $table->boolean('is_active')
                ->default(true);

            $table->timestamp('resolved_at')
                ->nullable();


            $table->timestamps();

            $table->index([
                'user_id',
                'is_active',
            ]);

            $table->index(
                [
                    'user_id',
                    'badge_key',
                    'is_active',
                ],
                'auth_notification_badge_index'
            );

            $table->index([
                'reference_type',
                'reference_id',
            ]);
        });
    }


    public function down(): void
    {
        Schema::dropIfExists(
            'auth_notification'
        );
    }
};
