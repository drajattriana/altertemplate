<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class AuthNotificationService
{
    /*
    |--------------------------------------------------------------------------
    | CREATE NOTIFICATION
    |--------------------------------------------------------------------------
    */

    public static function create(
        int $userId,
        ?string $badgeKey,
        string $title,
        string $message,
        ?string $url = null,
        ?string $referenceType = null,
        ?int $referenceId = null
    ): int {
        return DB::table('auth_notification')
            ->insertGetId([
                'user_id' => $userId,

                'badge_key' => $badgeKey,

                'title' => $title,

                'message' => $message,

                'url' => $url,

                'reference_type' =>
                    $referenceType,

                'reference_id' =>
                    $referenceId,

                'is_read' => false,

                'read_at' => null,

                'is_active' => true,

                'resolved_at' => null,

                'created_at' => now(),

                'updated_at' => now(),
            ]);
    }


    /*
    |--------------------------------------------------------------------------
    | RESOLVE NOTIFICATION
    |--------------------------------------------------------------------------
    |
    | Dipanggil ketika action sebenarnya selesai.
    |
    | Contoh:
    | pesanan dikonfirmasi
    | approval disetujui
    | tiket ditutup
    |
    */

    public static function resolve(
        int $userId,
        ?string $badgeKey = null,
        ?string $referenceType = null,
        ?int $referenceId = null
    ): int {
        $query = DB::table(
            'auth_notification'
        )
            ->where(
                'user_id',
                $userId
            )
            ->where(
                'is_active',
                true
            );


        if ($badgeKey !== null) {
            $query->where(
                'badge_key',
                $badgeKey
            );
        }


        if ($referenceType !== null) {
            $query->where(
                'reference_type',
                $referenceType
            );
        }


        if ($referenceId !== null) {
            $query->where(
                'reference_id',
                $referenceId
            );
        }


        return $query->update([
            'is_active' => false,

            'resolved_at' => now(),

            'updated_at' => now(),
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | MARK READ
    |--------------------------------------------------------------------------
    |
    | Disiapkan untuk header nanti.
    |
    | MARK READ TIDAK MENGHILANGKAN BADGE.
    |
    */

    public static function markAsRead(
        int $notificationId,
        int $userId
    ): int {
        return DB::table(
            'auth_notification'
        )
            ->where(
                'id',
                $notificationId
            )
            ->where(
                'user_id',
                $userId
            )
            ->update([
                'is_read' => true,

                'read_at' => now(),

                'updated_at' => now(),
            ]);
    }
}