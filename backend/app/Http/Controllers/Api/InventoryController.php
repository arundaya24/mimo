<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Services\CatEmotionalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function __construct(
        protected CatEmotionalService $emotionalService
    ) {}

    /**
     * List user inventory items.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $items = InventoryItem::where('user_id', $user->id)
            ->where('quantity', '>', 0)
            ->get();

        return response()->json([
            'inventory' => $items,
        ]);
    }

    /**
     * Use an item on the cat.
     */
    public function useItem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'item_code' => ['required', 'string'],
        ]);

        $user = $request->user();
        $cat = $user->cat()->first();

        if (!$cat) {
            return response()->json([
                'success' => false,
                'message' => 'Belum ada kucing untuk diberikan item.',
            ], 404);
        }

        $item = InventoryItem::where('user_id', $user->id)
            ->where('item_code', $validated['item_code'])
            ->first();

        if (!$item || $item->quantity <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Item ini sudah habis di tas kamu.',
            ], 422);
        }

        $action = 'feed';
        if ($item->category === 'toy') {
            $action = 'play';
        } elseif ($item->category === 'care') {
            $action = 'groom';
        }

        $result = $this->emotionalService->interact($cat, $action, $item->item_code);

        return response()->json([
            ...$result,
            'remaining_quantity' => $item->fresh()->quantity,
        ]);
    }
}
