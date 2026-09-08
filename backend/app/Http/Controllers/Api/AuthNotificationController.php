<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuthNotificationController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | LIST NOTIFICATION
    |--------------------------------------------------------------------------
    |
    | Ini nanti bisa dipakai dropdown notification di HEADER.
    |
    */

    public function index(
        Request $request
    ): JsonResponse {
        $user = auth('api')->user();

        if (!$user) {
            abort(
                401,
                'Unauthenticated'
            );
        }


        $limit = (int) $request->query(
            'limit',
            10
        );

        $limit = max(
            1,
            min(
                $limit,
                50
            )
        );


        $notifications = DB::table(
            'auth_notification'
        )
            ->where(
                'user_id',
                $user->id
            )
            ->where(
                'is_active',
                true
            )
            ->orderByDesc(
                'created_at'
            )
            ->limit(
                $limit
            )
            ->get()
            ->map(
                function ($notification) {
                    $notification->is_read =
                        (bool) $notification->is_read;

                    $notification->is_active =
                        (bool) $notification->is_active;

                    return $notification;
                }
            );


        $totalActive = DB::table(
            'auth_notification'
        )
            ->where(
                'user_id',
                $user->id
            )
            ->where(
                'is_active',
                true
            )
            ->count();


        return response()->json([
            'notifications' =>
                $notifications,

            'total_active' =>
                $totalActive,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | SIDEBAR BADGES
    |--------------------------------------------------------------------------
    |
    | Semua badge sidebar diambil lewat SATU request.
    |
    */

    public function badges(): JsonResponse
    {
        $user = auth('api')->user();

        if (!$user) {
            abort(
                401,
                'Unauthenticated'
            );
        }


        $badges = DB::table(
            'auth_notification'
        )
            ->where(
                'user_id',
                $user->id
            )
            ->where(
                'is_active',
                true
            )
            ->whereNotNull(
                'badge_key'
            )
            ->select(
                'badge_key',
                DB::raw(
                    'COUNT(*) as total'
                )
            )
            ->groupBy(
                'badge_key'
            )
            ->pluck(
                'total',
                'badge_key'
            )
            ->map(
                fn ($total) =>
                    (int) $total
            );


        return response()->json([
            'badges' =>
                $badges,
        ]);
    }
}