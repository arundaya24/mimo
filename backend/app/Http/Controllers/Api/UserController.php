<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    /**
     * Get user settings with fallbacks.
     */
    public function getSettings(Request $request): JsonResponse
    {
        $user = $request->user();
        $defaultSettings = [
            'theme' => 'system', // light, dark, system
            'accent_color' => 'terracotta', // terracotta, sage, amber, slate, rose
            'ui_scale' => 'default', // compact, default, comfortable
            'master_volume' => 80,
            'sfx_enabled' => true,
            'ambient_sound' => false,
            'notifications' => true,
            'feeding_reminder' => true,
            'activity_simulation' => true,
        ];

        $settings = array_merge($defaultSettings, $user->settings ?? []);

        return response()->json([
            'settings' => $settings,
        ]);
    }

    /**
     * Update user settings.
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'theme' => ['sometimes', 'string', 'in:light,dark,system'],
            'accent_color' => ['sometimes', 'string', 'in:terracotta,sage,amber,slate,rose'],
            'ui_scale' => ['sometimes', 'string', 'in:compact,default,comfortable'],
            'master_volume' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'sfx_enabled' => ['sometimes', 'boolean'],
            'ambient_sound' => ['sometimes', 'boolean'],
            'notifications' => ['sometimes', 'boolean'],
            'feeding_reminder' => ['sometimes', 'boolean'],
            'activity_simulation' => ['sometimes', 'boolean'],
        ]);

        $user = $request->user();
        $currentSettings = $user->settings ?? [];
        $newSettings = array_merge($currentSettings, $validated);

        $user->update(['settings' => $newSettings]);

        return response()->json([
            'message' => 'Pengaturan berhasil disimpan.',
            'settings' => $newSettings,
        ]);
    }

    /**
     * Update user profile information.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    /**
     * Change user password.
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password saat ini tidak cocok.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return response()->json([
            'message' => 'Password berhasil diubah.',
        ]);
    }

    /**
     * Delete user account with confirmation.
     */
    public function deleteAccount(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'password' => ['required', 'string'],
        ]);

        if (!Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['Password verifikasi tidak cocok.'],
            ]);
        }

        // Delete all sanctum tokens and user record (cascades cats, stats, inventory)
        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'message' => 'Akun berhasil dihapus secara permanen.',
        ]);
    }
}
