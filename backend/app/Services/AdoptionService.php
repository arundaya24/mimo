<?php

namespace App\Services;

use App\Models\Cat;
use App\Models\CatCustomization;
use App\Models\CatPersonality;
use App\Models\CatStat;
use App\Models\InventoryItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdoptionService
{
    public function __construct(
        protected CatEmotionalService $emotionalService
    ) {}

    /**
     * Adopt a new cat for the user.
     */
    public function adopt(User $user, array $data): array
    {
        return DB::transaction(function () use ($user, $data) {
            // If user already has a cat, retrieve or update it
            $existingCat = Cat::where('user_id', $user->id)->first();
            if ($existingCat) {
                // Delete previous cat if user is adopting a new one
                $existingCat->delete();
            }

            // Find personality by code or id
            $personality = null;
            if (!empty($data['personality_code'])) {
                $personality = CatPersonality::where('code', $data['personality_code'])->first();
            } elseif (!empty($data['personality_id'])) {
                $personality = CatPersonality::find($data['personality_id']);
            }

            if (!$personality) {
                $personality = CatPersonality::where('code', 'playful')->first()
                    ?? CatPersonality::first();
            }

            // Assign random favorite food from popular foods
            $favoriteFoods = ['canned_tuna', 'dry_kibble', 'cat_treats'];
            $favoriteFood = $favoriteFoods[array_rand($favoriteFoods)];

            // Create Cat
            $cat = Cat::create([
                'user_id' => $user->id,
                'name' => $data['name'] ?? 'Mimo',
                'gender' => $data['gender'] ?? 'female',
                'personality_id' => $personality->id,
                'is_sleeping' => false,
                'current_room' => 'living_room',
                'favorite_food' => $favoriteFood,
                'boredom_counter' => 0,
                'last_activity_type' => null,
                'last_interaction_at' => Carbon::now(),
                'last_fed_at' => Carbon::now(),
                'last_slept_at' => null,
                'last_calculated_at' => Carbon::now(),
            ]);

            // Create Initial Stats
            CatStat::create([
                'cat_id' => $cat->id,
                'hunger' => 20.0,
                'happiness' => 85.0,
                'energy' => 80.0,
                'trust' => ($personality->code === 'shy') ? 35.0 : 55.0,
                'fear' => ($personality->code === 'shy') ? 20.0 : 10.0,
                'affection' => 60.0,
                'comfort' => 85.0,
                'cleanliness' => 90.0,
            ]);

            // Create Customization
            CatCustomization::create([
                'cat_id' => $cat->id,
                'fur_color' => $data['fur_color'] ?? '#E69A57',
                'fur_secondary_color' => $data['fur_secondary_color'] ?? '#FFF8F0',
                'pattern' => $data['pattern'] ?? 'stripes',
                'pattern_color' => $data['pattern_color'] ?? '#A0522D',
                'eye_color' => $data['eye_color'] ?? '#48BB78',
                'ear_style' => $data['ear_style'] ?? 'pointy',
                'collar_color' => $data['collar_color'] ?? '#D97746',
                'bell' => isset($data['bell']) ? (bool)$data['bell'] : true,
                'accessory' => $data['accessory'] ?? 'none',
            ]);

            // Seed starter inventory for this user if not already populated
            $this->ensureStarterInventory($user);

            return $this->emotionalService->formatCatResponse($cat->fresh(['stats', 'personality', 'customization']), 'happy');
        });
    }

    /**
     * Ensure starter inventory items exist for the user.
     */
    public function ensureStarterInventory(User $user): void
    {
        $starterItems = [
            [
                'item_code' => 'dry_kibble',
                'name' => 'Crunchy Kibble',
                'category' => 'food',
                'quantity' => 10,
                'icon' => 'bowl',
                'description' => 'Makanan kering lezat dengan nutrisi seimbang untuk kucing aktif.',
                'effect_summary' => 'Mengurangi lapar 35%',
            ],
            [
                'item_code' => 'canned_tuna',
                'name' => 'Tuna Gourmet',
                'category' => 'food',
                'quantity' => 3,
                'icon' => 'fish',
                'description' => 'Tuna kaleng segar pilihan istimewa yang sangat disukai kucing.',
                'effect_summary' => 'Mengurangi lapar 55%, meningkatkan kebahagiaan 25%',
            ],
            [
                'item_code' => 'feather_wand',
                'name' => 'Feather Wand',
                'category' => 'toy',
                'quantity' => 1,
                'icon' => 'feather',
                'description' => 'Tongkat bulu warna-warni yang selalu memancing insting berburu.',
                'effect_summary' => 'Meningkatkan kebahagiaan 25%',
            ],
            [
                'item_code' => 'cat_treats',
                'name' => 'Salmon Bites',
                'category' => 'food',
                'quantity' => 5,
                'icon' => 'cookie',
                'description' => 'Camilan salmon renyah yang mempererat kasih sayang.',
                'effect_summary' => 'Kasih sayang +15%, kebahagiaan +20%',
            ],
            [
                'item_code' => 'cozy_pillow',
                'name' => 'Bantal Hangat',
                'category' => 'comfort',
                'quantity' => 1,
                'icon' => 'bed',
                'description' => 'Bantal tidur bertekstur lembut untuk istirahat yang damai.',
                'effect_summary' => 'Meningkatkan pemulihan energi saat tidur',
            ],
        ];

        foreach ($starterItems as $item) {
            InventoryItem::updateOrCreate(
                ['user_id' => $user->id, 'item_code' => $item['item_code']],
                $item
            );
        }
    }
}
