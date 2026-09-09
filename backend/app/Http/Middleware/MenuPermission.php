<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class MenuPermission
{
    public function handle(
        Request $request,
        Closure $next,
        string $menuPath
    ): Response {
        $user = auth('api')->user();

        if (!$user) {
            abort(404);
        }

        $menu = DB::table('auth_menus')
            ->where('path', $menuPath)
            ->where('is_active', true)
            ->first([
                'id',
                'permission_id',
            ]);

        if (!$menu) {
            abort(404);
        }

        /*
        |--------------------------------------------------------------------------
        | TANPA PERMISSION
        |--------------------------------------------------------------------------
        */

        if ($menu->permission_id === null) {
            return $next($request);
        }


        /*
        |--------------------------------------------------------------------------
        | DENGAN PERMISSION
        |--------------------------------------------------------------------------
        */

        $allowed = DB::table('auth_role_permissions')
            ->where(
                'role_id',
                $user->role_id
            )
            ->where(
                'permission_id',
                $menu->permission_id
            )
            ->exists();

        if (!$allowed) {
            abort(404);
        }

        return $next($request);
    }
}