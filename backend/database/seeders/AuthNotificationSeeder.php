<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class AuthNotificationSeeder extends Seeder
{
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | AMBIL USER TUJUAN
        |--------------------------------------------------------------------------
        |
        | Contoh notification ini dikirim ke SUPERADMIN.
        |
        */

        $userId = DB::table('auth_users')
            ->where('username', 'superadmin')
            ->value('id');

        if (!$userId) {
            throw new RuntimeException(
                'User superadmin tidak ditemukan.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | CONTOH NOTIFICATION ORDERS
        |--------------------------------------------------------------------------
        |
        | badge_key
        | = harus sama dengan badge_key di auth_menus
        |
        | reference_type
        | = jenis data sumber
        |
        | reference_id
        | = ID data sumber
        |
        */

        $notifications = [
            [
                'badge_key' => 'orders',

                'title' => 'Pesanan Baru',

                'message' => 'Ada pesanan baru #ORD-001.',

                'url' => '/superadmin/orders/1',

                'reference_type' => 'order',

                'reference_id' => 1,
            ],

            [
                'badge_key' => 'orders',

                'title' => 'Pesanan Baru',

                'message' => 'Ada pesanan baru #ORD-002.',

                'url' => '/superadmin/orders/2',

                'reference_type' => 'order',

                'reference_id' => 2,
            ],
        ];


        /*
        |--------------------------------------------------------------------------
        | SIMPAN DATA
        |--------------------------------------------------------------------------
        |
        | updateOrInsert digunakan supaya db:seed berulang
        | tidak membuat notification contoh menjadi dobel.
        |
        */

        foreach ($notifications as $notification) {
            DB::table('auth_notification')
                ->updateOrInsert(
                    [
                        /*
                         * Identitas notification.
                         */

                        'user_id' => $userId,

                        'badge_key' =>
                            $notification['badge_key'],

                        'reference_type' =>
                            $notification['reference_type'],

                        'reference_id' =>
                            $notification['reference_id'],
                    ],
                    [
                        /*
                         * Isi notification.
                         */

                        'title' =>
                            $notification['title'],

                        'message' =>
                            $notification['message'],

                        'url' =>
                            $notification['url'],


                        /*
                         * Status baca.
                         *
                         * Dibuka ≠ selesai.
                         */

                        'is_read' => false,

                        'read_at' => null,


                        /*
                         * Status notification.
                         *
                         * true = masih dihitung badge.
                         */

                        'is_active' => true,

                        'resolved_at' => null,


                        /*
                         * Timestamp.
                         */

                        'created_at' => now(),

                        'updated_at' => now(),
                    ]
                );
        }
    }
}