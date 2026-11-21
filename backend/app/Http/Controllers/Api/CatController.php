<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cat;
use App\Models\CatPersonality;
use App\Services\AdoptionService;
use App\Services\CatEmotionalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CatController extends Controller
{
    public function __construct(
        protected CatEmotionalService $emotionalService,
        protected AdoptionService $adoptionService
    ) {}

    /**
     * Get list of all personalities available for adoption.
     */
    public function personalities(): JsonResponse
    {
        $personalities = CatPersonality::all()->map(function ($p) {
            return [
                'id' => $p->id,
                'name' => $p->name,
                'code' => $p->code,
                'description' => $p->description,
                'preferred_activity' => $p->preferred_activity,
                'traits' => [
                    'hunger_rate' => $p->hunger_decay_multiplier,
                    'energy_rate' => $p->energy_decay_multiplier,
                    'trust_speed' => $p->trust_gain_multiplier,
                    'fear_sensitivity' => $p->fear_sensitivity,
                    'affection_gain' => $p->affection_gain_multiplier,
                ],
            ];
        });

        return response()->json([
            'personalities' => $personalities,
        ]);
    }

    /**
     * Get active cat of the authenticated user.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $cat = $user->cat()->first();

        if (!$cat) {
            return response()->json([
                'has_cat' => false,
                'message' => 'Belum ada kucing yang diadopsi.',
            ], 404);
        }

        // Simulate elapsed time since user last opened or interacted
        $this->emotionalService->syncElapsedTime($cat);

        return response()->json([
            'has_cat' => true,
            'cat' => $this->emotionalService->formatCatResponse($cat),
        ]);
    }

    /**
     * Adopt a new cat.
     */
    public function adopt(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'gender' => ['nullable', 'string', 'in:male,female,non-binary'],
            'personality_code' => ['required', 'string', 'exists:cat_personalities,code'],
            'fur_color' => ['required', 'string'],
            'fur_secondary_color' => ['nullable', 'string'],
            'pattern' => ['required', 'string', 'in:solid,stripes,tuxedo,calico,socks'],
            'pattern_color' => ['nullable', 'string'],
            'eye_color' => ['required', 'string'],
            'ear_style' => ['nullable', 'string', 'in:pointy,folded,round'],
            'collar_color' => ['nullable', 'string'],
            'bell' => ['nullable', 'boolean'],
            'accessory' => ['nullable', 'string'],
        ]);

        $catData = $this->adoptionService->adopt($request->user(), $validated);

        return response()->json([
            'message' => "Selamat datang di rumah barumu, {$validated['name']}!",
            'cat' => $catData,
        ], 201);
    }

    /**
     * Update cat customizations (accessories, collar, etc.)
     */
    public function updateCustomization(Request $request): JsonResponse
    {
        $user = $request->user();
        $cat = $user->cat()->firstOrFail();

        $validated = $request->validate([
            'fur_color' => ['sometimes', 'string'],
            'fur_secondary_color' => ['sometimes', 'string'],
            'pattern' => ['sometimes', 'string', 'in:solid,stripes,tuxedo,calico,socks'],
            'pattern_color' => ['sometimes', 'string'],
            'eye_color' => ['sometimes', 'string'],
            'ear_style' => ['sometimes', 'string', 'in:pointy,folded,round'],
            'collar_color' => ['sometimes', 'string'],
            'bell' => ['sometimes', 'boolean'],
            'accessory' => ['sometimes', 'string'],
        ]);

        $cat->customization->update($validated);

        return response()->json([
            'message' => 'Penampilan kucing berhasil diperbarui.',
            'cat' => $this->emotionalService->formatCatResponse($cat->fresh()),
        ]);
    }

    /**
     * Update room or activity environment.
     */
    public function updateRoom(Request $request): JsonResponse
    {
        $user = $request->user();
        $cat = $user->cat()->firstOrFail();

        $validated = $request->validate([
            'room' => ['required', 'string', 'in:living_room,bedroom,balcony,garden'],
        ]);

        $cat->update(['current_room' => $validated['room']]);

        return response()->json([
            'message' => 'Ruangan berpindah.',
            'cat' => $this->emotionalService->formatCatResponse($cat),
        ]);
    }
}
