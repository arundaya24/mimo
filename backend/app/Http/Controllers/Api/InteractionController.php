<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CatInteraction;
use App\Services\CatEmotionalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InteractionController extends Controller
{
    public function __construct(
        protected CatEmotionalService $emotionalService
    ) {}

    /**
     * Perform an interaction with the active cat.
     */
    public function interact(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'string', 'in:feed,pet,play,scold,sleep,wake,groom,clean_room,treat,cat_grass,water_fountain,scratch_tree'],
            'item_code' => ['nullable', 'string'],
        ]);

        $user = $request->user();
        $cat = $user->cat()->first();

        if (!$cat) {
            return response()->json([
                'success' => false,
                'message' => 'Kucing belum diadopsi.',
            ], 404);
        }

        $action = $validated['action'];
        if ($action === 'wake') {
            $action = 'sleep'; // Toggle sleep logic handles wake
        }

        $result = $this->emotionalService->interact($cat, $action, $validated['item_code'] ?? null);

        return response()->json($result, $result['success'] ? 200 : 422);
    }

    /**
     * Get recent interaction history / diary.
     */
    public function history(Request $request): JsonResponse
    {
        $user = $request->user();
        $cat = $user->cat()->first();

        if (!$cat) {
            return response()->json(['history' => []]);
        }

        $interactions = CatInteraction::where('cat_id', $cat->id)
            ->latest('id')
            ->limit(20)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'action_type' => $item->action_type,
                    'stat_changes' => $item->stat_changes,
                    'notes' => $item->notes,
                    'created_at' => $item->created_at->toIso8601String(),
                    'time_ago' => $item->created_at->diffForHumans(),
                ];
            });

        return response()->json([
            'history' => $interactions,
        ]);
    }
}
