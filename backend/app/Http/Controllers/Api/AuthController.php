<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $token = $user->createToken('mimo-token')->plainTextToken;

        return response()->json([
            'message' => 'Selamat datang di MIMO! Akun berhasil dibuat.',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'has_cat' => false,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password yang kamu masukkan salah.'],
            ]);
        }

        $token = $user->createToken('mimo-token')->plainTextToken;
        $hasCat = $user->cat()->exists();

        return response()->json([
            'message' => 'Berhasil masuk ke MIMO.',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'has_cat' => $hasCat,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $cat = $user->cat()->with(['personality', 'customization'])->first();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'has_cat' => (bool)$cat,
            'cat_summary' => $cat ? [
                'id' => $cat->id,
                'name' => $cat->name,
                'gender' => $cat->gender,
                'personality' => $cat->personality?->name,
            ] : null,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sampai jumpa lagi!',
        ]);
    }
}
