<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => [
                'required',
                'string',
            ],

            'password' => [
                'required',
                'string',
            ],

            'remember' => [
                'nullable',
                'boolean',
            ],
        ]);

        $user = User::with('role')
            ->where(
                'username',
                $request->username
            )
            ->first();

        if (
            !$user ||
            !Hash::check(
                $request->password,
                $user->password
            )
        ) {
            return response()->json([
                'message' =>
                    'Username atau kata sandi salah.',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' =>
                    'Akun tidak aktif.',
            ], 403);
        }

        if (!$user->role) {
            return response()->json([
                'message' =>
                    'Role akun tidak ditemukan.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | TOKEN TTL
        |--------------------------------------------------------------------------
        */

        $ttl =
            $request->boolean(
                'remember'
            )
                ? 60 * 24 * 7
                : 60 * 2;

        auth('api')
            ->factory()
            ->setTTL(
                $ttl
            );

        $token =
            auth('api')
                ->login(
                    $user
                );

        $user->update([
            'last_login_at' =>
                now(),
        ]);

        return response()->json([
            'message' =>
                'Login berhasil.',

            'access_token' =>
                $token,

            'token_type' =>
                'bearer',

            'expires_in' =>
                $ttl * 60,

            'user' =>
                $this->userResponse(
                    $user
                ),
        ]);
    }


    public function me(): JsonResponse
    {
        $user =
            auth('api')
                ->user();

        if (!$user) {
            return response()->json([
                'message' =>
                    'Unauthenticated.',
            ], 401);
        }

        $user->load(
            'role'
        );

        return response()->json([
            'user' =>
                $this->userResponse(
                    $user
                ),
        ]);
    }


    public function updatePassword(
        Request $request
    ): JsonResponse {
        $user =
            auth('api')
                ->user();

        if (!$user) {
            return response()->json([
                'message' =>
                    'Unauthenticated.',
            ], 401);
        }

        $validated =
            $request->validate([
                'current_password' => [
                    'required',
                    'string',
                ],

                'password' => [
                    'required',
                    'string',
                    'min:8',
                    'confirmed',
                ],
            ]);

        if (
            !Hash::check(
                $validated[
                    'current_password'
                ],
                $user->password
            )
        ) {
            return response()->json([
                'message' =>
                    'Password saat ini tidak sesuai.',

                'errors' => [
                    'current_password' => [
                        'Password saat ini tidak sesuai.',
                    ],
                ],
            ], 422);
        }

        if (
            Hash::check(
                $validated[
                    'password'
                ],
                $user->password
            )
        ) {
            return response()->json([
                'message' =>
                    'Password baru tidak boleh sama dengan password saat ini.',

                'errors' => [
                    'password' => [
                        'Password baru tidak boleh sama dengan password saat ini.',
                    ],
                ],
            ], 422);
        }

        $user->update([
            'password' =>
                Hash::make(
                    $validated[
                        'password'
                    ]
                ),
        ]);

        return response()->json([
            'message' =>
                'Password berhasil diperbarui.',
        ]);
    }


    public function logout(): JsonResponse
    {
        auth('api')
            ->logout();

        return response()->json([
            'message' =>
                'Logout berhasil.',
        ]);
    }


    private function userResponse(
        User $user
    ): array {
        return [
            'id' =>
                $user->id,

            'username' =>
                $user->username,

            'email' =>
                $user->email,

            'role' => [
                'id' =>
                    $user->role->id,

                'name' =>
                    $user->role->name,

                'slug' =>
                    $user->role->slug,
            ],

            'redirect_path' =>
                $user->role->redirect_path,
        ];
    }
}