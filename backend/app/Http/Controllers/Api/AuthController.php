<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
        ]);

        $user = User::with('role')
            ->where('username', $request->username)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Username atau kata sandi salah.',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Akun tidak aktif.',
            ], 403);
        }

        if (!$user->role) {
            return response()->json([
                'message' => 'Role akun tidak ditemukan.',
            ], 403);
        }

        /*
         * Remember ON  : 7 hari
         * Remember OFF : 2 jam
         *
         * JWT TTL menggunakan menit.
         */

        $ttl = $request->boolean('remember')
            ? 60 * 24 * 7
            : 60 * 2;

        auth('api')->factory()->setTTL($ttl);

        $token = auth('api')->login($user);

        $user->update([
            'last_login_at' => now(),
        ]);

        return response()->json([
            'message' => 'Login berhasil.',

            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => $ttl * 60,

            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,

                'role' => [
                    'id' => $user->role->id,
                    'name' => $user->role->name,
                    'slug' => $user->role->slug,
                ],

                'redirect_path' => $user->role->redirect_path,
            ],
        ]);
    }

    public function me()
    {
        $user = auth('api')->user();

        $user->load('role');

        return response()->json([
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,

                'role' => [
                    'id' => $user->role->id,
                    'name' => $user->role->name,
                    'slug' => $user->role->slug,
                ],

                'redirect_path' => $user->role->redirect_path,
            ],
        ]);
    }

    public function logout()
    {
        auth('api')->logout();

        return response()->json([
            'message' => 'Logout berhasil.',
        ]);
    }
}