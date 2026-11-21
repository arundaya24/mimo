<?php

namespace App\Services;

use App\Models\Cat;
use App\Models\CatInteraction;
use App\Models\InventoryItem;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CatEmotionalService
{
    /**
     * Clamp a numeric value between 0 and 100.
     */
    public function clamp(float $value, float $min = 0.0, float $max = 100.0): float
    {
        return round(max($min, min($max, $value)), 2);
    }

    /**
     * Simulate elapsed time since last activity.
     * Calculated on the backend so closing/reopening the app simulates realistic time passage.
     */
    public function syncElapsedTime(Cat $cat): Cat
    {
        $cat->loadMissing(['stats', 'personality']);
        $stats = $cat->stats;
        $personality = $cat->personality;

        $now = Carbon::now();
        $lastCalculated = $cat->last_calculated_at ?? $cat->updated_at ?? $now;
        $diffInMinutes = $lastCalculated->diffInMinutes($now);

        // Cap elapsed time to 48 hours to avoid extreme death/starvation states
        $cappedMinutes = min($diffInMinutes, 48 * 60);

        if ($cappedMinutes < 1) {
            return $cat;
        }

        $hours = $cappedMinutes / 60.0;

        $hungerMultiplier = $personality ? $personality->hunger_decay_multiplier : 1.0;
        $energyMultiplier = $personality ? $personality->energy_decay_multiplier : 1.0;
        $happinessMultiplier = $personality ? $personality->happiness_decay_multiplier : 1.0;

        // Hunger increases over time (~3.5 points per hour), capped at 88% to avoid lethal starvation
        $newHunger = min(88.0, $stats->hunger + ($hours * 3.5 * $hungerMultiplier));

        // Energy behavior: recovers if sleeping (~18 pts/hr), depletes if awake (~3.5 pts/hr)
        if ($cat->is_sleeping) {
            $newEnergy = $stats->energy + ($hours * 18.0);
            if ($newEnergy >= 100.0 && $hours >= 2.0) {
                // Cat naturally wakes up once well rested
                $cat->is_sleeping = false;
            }
        } else {
            $newEnergy = max(20.0, $stats->energy - ($hours * 3.5 * $energyMultiplier));
        }

        // Cleanliness decays slowly over time
        $currentCleanliness = $stats->cleanliness ?? 90.0;
        $newCleanliness = max(30.0, $currentCleanliness - ($hours * 0.75));

        // Comfort decays, but recovers when sleeping; penalty if environment/cat is dirty
        $cleanlinessPenalty = $newCleanliness < 50 ? 1.4 : 1.0;
        $currentComfort = $stats->comfort ?? 85.0;
        if ($cat->is_sleeping) {
            $newComfort = min(100.0, $currentComfort + ($hours * 5.0));
        } else {
            $newComfort = max(25.0, $currentComfort - ($hours * 1.2 * $cleanlinessPenalty));
        }

        // Happiness decays, but has soft floor of 25 to avoid complete demoralization
        $hungerPenalty = $stats->hunger > 70 ? 1.4 : 1.0;
        $newHappiness = max(25.0, $stats->happiness - ($hours * 2.0 * $happinessMultiplier * $hungerPenalty));

        // Affection decays very slightly if neglected, but never drops below 25
        $newAffection = max(25.0, $stats->affection - ($hours * 0.4));

        // Fear naturally cools down over time towards 0
        $newFear = max(0.0, $stats->fear - ($hours * 6.0));

        // Reset boredom if inactive for > 30 minutes
        if ($hours >= 0.5) {
            $cat->boredom_counter = 0;
        }

        // Update stats with bounds enforcement [0, 100]
        $stats->update([
            'hunger' => $this->clamp($newHunger),
            'energy' => $this->clamp($newEnergy),
            'happiness' => $this->clamp($newHappiness),
            'affection' => $this->clamp($newAffection),
            'fear' => $this->clamp($newFear),
            'comfort' => $this->clamp($newComfort),
            'cleanliness' => $this->clamp($newCleanliness),
        ]);

        $cat->update([
            'last_calculated_at' => $now,
            'boredom_counter' => $cat->boredom_counter,
        ]);

        return $cat->fresh(['stats', 'personality', 'customization']);
    }

    /**
     * Determine the current emotional / behavioral state of the cat.
     */
    public function getDominantState(Cat $cat, ?string $recentAction = null): string
    {
        if ($cat->is_sleeping) {
            return 'sleeping';
        }

        if ($recentAction === 'feed') {
            return 'eating';
        }

        if ($recentAction === 'play') {
            return 'playing';
        }

        if ($recentAction === 'groom') {
            return 'grooming';
        }

        $stats = $cat->stats;
        $personality = $cat->personality;

        if ($stats->fear >= 50) {
            return ($personality && $personality->code === 'grumpy') ? 'angry' : 'scared';
        }

        if ($stats->hunger >= 85) {
            return 'angry'; // Hangry!
        }

        if ($stats->energy <= 20) {
            return 'sitting'; // Too tired to run
        }

        if (($stats->cleanliness ?? 90) < 45 && $stats->energy > 25) {
            return 'grooming';
        }

        if ($stats->affection >= 75 && $stats->trust >= 60) {
            return 'affectionate';
        }

        if ($stats->happiness >= 70) {
            return 'happy';
        }

        if ($stats->energy >= 70 && $stats->happiness >= 50) {
            return 'curious';
        }

        if ($personality && $personality->code === 'lazy' && $stats->energy <= 60) {
            return 'sitting';
        }

        return 'idle';
    }

    /**
     * Execute an interaction with the cat.
     */
    public function interact(Cat $cat, string $actionType, ?string $itemCode = null): array
    {
        $this->syncElapsedTime($cat);
        $stats = $cat->stats;
        $personality = $cat->personality;

        $statChanges = [];
        $feedbackMessage = '';
        $animationState = 'idle';

        switch ($actionType) {
            case 'feed':
                if ($cat->is_sleeping) {
                    return [
                        'success' => false,
                        'message' => "{$cat->name} sedang tidur nyenyak. Bangunkan terlebih dahulu untuk memberi makan.",
                        'cat' => $this->formatCatResponse($cat, 'sleeping'),
                    ];
                }

                $hungerReduction = 35.0;
                $happinessGain = 10.0;
                $energyGain = 5.0;
                $affectionGain = 4.0;

                // Handle special food items
                if ($itemCode) {
                    $item = InventoryItem::where('user_id', $cat->user_id)
                        ->where('item_code', $itemCode)
                        ->first();

                    if ($item && $item->quantity > 0) {
                        $item->decrement('quantity');
                        if ($itemCode === 'canned_tuna') {
                            $hungerReduction = 55.0;
                            $happinessGain = 25.0;
                            $affectionGain = 12.0;
                            $feedbackMessage = "{$cat->name} sangat menyukai tuna kaleng lezat ini! Mendengkur puas.";
                        } elseif ($itemCode === 'cat_treats') {
                            $hungerReduction = 20.0;
                            $happinessGain = 20.0;
                            $affectionGain = 10.0;
                            $feedbackMessage = "Camilan gurih dinikmati {$cat->name} dengan sangat gembira!";
                        }
                    }
                }

                $newHunger = $this->clamp($stats->hunger - $hungerReduction);
                $newHappiness = $this->clamp($stats->happiness + $happinessGain);
                $newEnergy = $this->clamp($stats->energy + $energyGain);
                $newAffection = $this->clamp($stats->affection + ($affectionGain * ($personality->affection_gain_multiplier ?? 1.0)));

                $statChanges = [
                    'hunger' => round($newHunger - $stats->hunger, 1),
                    'happiness' => round($newHappiness - $stats->happiness, 1),
                    'energy' => round($newEnergy - $stats->energy, 1),
                    'affection' => round($newAffection - $stats->affection, 1),
                ];

                $stats->update([
                    'hunger' => $newHunger,
                    'happiness' => $newHappiness,
                    'energy' => $newEnergy,
                    'affection' => $newAffection,
                ]);

                $cat->update([
                    'last_fed_at' => Carbon::now(),
                    'last_interaction_at' => Carbon::now(),
                    'last_calculated_at' => Carbon::now(),
                ]);

                $animationState = 'eating';
                if (empty($feedbackMessage)) {
                    $feedbackMessage = $personality->reaction_dialogues['feed'] ?? "{$cat->name} menikmati makanannya dengan lahap!";
                }
                break;

            case 'pet':
                if ($cat->is_sleeping) {
                    // Petting while sleeping wakes gently or purrs in sleep
                    $newAffection = $this->clamp($stats->affection + 4.0);
                    $stats->update(['affection' => $newAffection]);
                    $cat->update(['last_interaction_at' => Carbon::now()]);
                    return [
                        'success' => true,
                        'message' => "{$cat->name} mendengkur pelan dalam tidurnya saat kamu mengelus bulunya...",
                        'action' => 'pet',
                        'stat_changes' => ['affection' => 4.0],
                        'cat' => $this->formatCatResponse($cat, 'sleeping'),
                    ];
                }

                $trustMultiplier = $personality->trust_gain_multiplier ?? 1.0;
                $affectionMultiplier = $personality->affection_gain_multiplier ?? 1.0;

                $newAffection = $this->clamp($stats->affection + (12.0 * $affectionMultiplier));
                $newTrust = $this->clamp($stats->trust + (8.0 * $trustMultiplier));
                $newHappiness = $this->clamp($stats->happiness + 10.0);
                $newFear = $this->clamp($stats->fear - 10.0);

                $statChanges = [
                    'affection' => round($newAffection - $stats->affection, 1),
                    'trust' => round($newTrust - $stats->trust, 1),
                    'happiness' => round($newHappiness - $stats->happiness, 1),
                    'fear' => round($newFear - $stats->fear, 1),
                ];

                $stats->update([
                    'affection' => $newAffection,
                    'trust' => $newTrust,
                    'happiness' => $newHappiness,
                    'fear' => $newFear,
                ]);

                $cat->update([
                    'last_interaction_at' => Carbon::now(),
                    'last_calculated_at' => Carbon::now(),
                ]);

                $animationState = ($stats->affection >= 60) ? 'affectionate' : 'happy';
                $feedbackMessage = $personality->reaction_dialogues['pet'] ?? "{$cat->name} memejamkan mata dan menikmati elusan lembutmu.";
                break;

            case 'play':
                if ($cat->is_sleeping) {
                    return [
                        'success' => false,
                        'message' => "{$cat->name} sedang tidur nyenyak. Biarkan ia beristirahat.",
                        'cat' => $this->formatCatResponse($cat, 'sleeping'),
                    ];
                }

                if ($stats->energy < 15) {
                    return [
                        'success' => false,
                        'message' => "{$cat->name} terlalu lelah untuk bermain. Butuh tidur atau istirahat sebentar.",
                        'cat' => $this->formatCatResponse($cat, 'sitting'),
                    ];
                }

                $energyCost = 18.0 * ($personality->energy_decay_multiplier ?? 1.0);
                $happinessBonus = 22.0;

                // Boredom handling: playing repeatedly without break reduces effectiveness
                $isBored = ($cat->last_activity_type === 'play' && $cat->boredom_counter >= 3);
                if ($isBored) {
                    $happinessBonus = 8.0;
                } elseif ($personality->code === 'playful') {
                    $happinessBonus = 30.0;
                } elseif ($personality->code === 'lazy') {
                    $energyCost = 25.0; // Lazy cats get exhausted faster
                    $happinessBonus = 12.0;
                }

                $newHappiness = $this->clamp($stats->happiness + $happinessBonus);
                $newEnergy = $this->clamp($stats->energy - $energyCost);
                $newHunger = $this->clamp($stats->hunger + 12.0); // Playing makes them hungry
                $newTrust = $this->clamp($stats->trust + (6.0 * ($personality->trust_gain_multiplier ?? 1.0)));
                $newFear = $this->clamp($stats->fear - 8.0);
                $newComfort = $this->clamp(($stats->comfort ?? 85.0) - 5.0);

                $statChanges = [
                    'happiness' => round($newHappiness - $stats->happiness, 1),
                    'energy' => round($newEnergy - $stats->energy, 1),
                    'hunger' => round($newHunger - $stats->hunger, 1),
                    'trust' => round($newTrust - $stats->trust, 1),
                    'fear' => round($newFear - $stats->fear, 1),
                    'comfort' => round($newComfort - ($stats->comfort ?? 85.0), 1),
                ];

                $stats->update([
                    'happiness' => $newHappiness,
                    'energy' => $newEnergy,
                    'hunger' => $newHunger,
                    'trust' => $newTrust,
                    'fear' => $newFear,
                    'comfort' => $newComfort,
                ]);

                $cat->update([
                    'last_interaction_at' => Carbon::now(),
                    'last_calculated_at' => Carbon::now(),
                    'last_activity_type' => 'play',
                    'boredom_counter' => $cat->boredom_counter + 1,
                ]);

                $animationState = 'playing';
                if ($isBored) {
                    $feedbackMessage = "{$cat->name} mulai lelah mengejar mainan yang sama. Butuh jeda sejenak atau elusan lembut.";
                } else {
                    $feedbackMessage = $personality->reaction_dialogues['play'] ?? "{$cat->name} melompat lincah mengejar mainan kesukaannya!";
                }
                break;

            case 'scold':
                $fearSensitivity = $personality->fear_sensitivity ?? 1.0;
                $fearIncrease = 28.0 * $fearSensitivity;
                $trustLoss = 15.0;
                $happinessLoss = 20.0;
                $affectionLoss = 15.0;

                $newFear = $this->clamp($stats->fear + $fearIncrease);
                $newTrust = $this->clamp($stats->trust - $trustLoss);
                $newHappiness = $this->clamp($stats->happiness - $happinessLoss);
                $newAffection = $this->clamp($stats->affection - $affectionLoss);

                $statChanges = [
                    'fear' => round($newFear - $stats->fear, 1),
                    'trust' => round($newTrust - $stats->trust, 1),
                    'happiness' => round($newHappiness - $stats->happiness, 1),
                    'affection' => round($newAffection - $stats->affection, 1),
                ];

                $stats->update([
                    'fear' => $newFear,
                    'trust' => $newTrust,
                    'happiness' => $newHappiness,
                    'affection' => $newAffection,
                ]);

                $cat->update([
                    'last_interaction_at' => Carbon::now(),
                    'last_calculated_at' => Carbon::now(),
                ]);

                $animationState = ($personality->code === 'grumpy') ? 'angry' : 'scared';
                $feedbackMessage = $personality->reaction_dialogues['scold'] ?? "{$cat->name} terkejut dan mundur ketakutan!";
                break;

            case 'sleep':
                $isSleeping = !$cat->is_sleeping;
                $cat->update([
                    'is_sleeping' => $isSleeping,
                    'last_slept_at' => $isSleeping ? Carbon::now() : $cat->last_slept_at,
                    'last_interaction_at' => Carbon::now(),
                    'last_calculated_at' => Carbon::now(),
                ]);

                $animationState = $isSleeping ? 'sleeping' : 'idle';
                $feedbackMessage = $isSleeping
                    ? "{$cat->name} berbaring di tempat tidur dan terlelap dengan tenang..."
                    : "{$cat->name} meregangkan badannya dan bangun!";

                $statChanges = ['is_sleeping' => $isSleeping];
                break;

            case 'groom':
                if ($cat->is_sleeping) {
                    return [
                        'success' => false,
                        'message' => "{$cat->name} sedang tidur. Sisir bulunya setelah ia bangun.",
                        'cat' => $this->formatCatResponse($cat, 'sleeping'),
                    ];
                }

                $newAffection = $this->clamp($stats->affection + 10.0);
                $newHappiness = $this->clamp($stats->happiness + 10.0);
                $newTrust = $this->clamp($stats->trust + 6.0);
                $newFear = $this->clamp($stats->fear - 6.0);
                $newCleanliness = $this->clamp(($stats->cleanliness ?? 90.0) + 25.0);
                $newComfort = $this->clamp(($stats->comfort ?? 85.0) + 18.0);

                $statChanges = [
                    'affection' => round($newAffection - $stats->affection, 1),
                    'happiness' => round($newHappiness - $stats->happiness, 1),
                    'trust' => round($newTrust - $stats->trust, 1),
                    'fear' => round($newFear - $stats->fear, 1),
                    'cleanliness' => round($newCleanliness - ($stats->cleanliness ?? 90.0), 1),
                    'comfort' => round($newComfort - ($stats->comfort ?? 85.0), 1),
                ];

                $stats->update([
                    'affection' => $newAffection,
                    'happiness' => $newHappiness,
                    'trust' => $newTrust,
                    'fear' => $newFear,
                    'cleanliness' => $newCleanliness,
                    'comfort' => $newComfort,
                ]);

                $cat->update([
                    'last_interaction_at' => Carbon::now(),
                    'last_calculated_at' => Carbon::now(),
                    'last_activity_type' => 'groom',
                    'boredom_counter' => 0,
                ]);

                $animationState = 'grooming';
                $feedbackMessage = "Bulu {$cat->name} disisir rapi dan bersih berkilau! Dengkurannya terdengar nyaman.";
                break;

            case 'clean_room':
                $newCleanliness = $this->clamp(($stats->cleanliness ?? 90.0) + 22.0);
                $newComfort = $this->clamp(($stats->comfort ?? 85.0) + 25.0);
                $newHappiness = $this->clamp($stats->happiness + 8.0);

                $statChanges = [
                    'cleanliness' => round($newCleanliness - ($stats->cleanliness ?? 90.0), 1),
                    'comfort' => round($newComfort - ($stats->comfort ?? 85.0), 1),
                    'happiness' => round($newHappiness - $stats->happiness, 1),
                ];

                $stats->update([
                    'cleanliness' => $newCleanliness,
                    'comfort' => $newComfort,
                    'happiness' => $newHappiness,
                ]);

                $cat->update([
                    'last_interaction_at' => Carbon::now(),
                    'last_calculated_at' => Carbon::now(),
                    'last_activity_type' => 'clean_room',
                    'boredom_counter' => 0,
                ]);

                $animationState = 'happy';
                $feedbackMessage = "Ruangan dibersihkan hingga wangi dan segar. {$cat->name} merasa sangat tenteram!";
                break;

            case 'treat':
                if ($cat->is_sleeping) {
                    return [
                        'success' => false,
                        'message' => "{$cat->name} sedang tidur. Berikan camilan saat ia terbangun.",
                        'cat' => $this->formatCatResponse($cat, 'sleeping'),
                    ];
                }

                $isFavorite = ($itemCode && $itemCode === ($cat->favorite_food ?? 'canned_tuna')) || ($itemCode === 'canned_tuna');
                $happinessGain = $isFavorite ? 28.0 : 18.0;
                $affectionGain = $isFavorite ? 14.0 : 9.0;
                $hungerReduction = 20.0;
                $comfortGain = 12.0;

                $newHappiness = $this->clamp($stats->happiness + $happinessGain);
                $newAffection = $this->clamp($stats->affection + $affectionGain);
                $newHunger = $this->clamp($stats->hunger - $hungerReduction);
                $newComfort = $this->clamp(($stats->comfort ?? 85.0) + $comfortGain);

                $statChanges = [
                    'happiness' => round($newHappiness - $stats->happiness, 1),
                    'affection' => round($newAffection - $stats->affection, 1),
                    'hunger' => round($newHunger - $stats->hunger, 1),
                    'comfort' => round($newComfort - ($stats->comfort ?? 85.0), 1),
                ];

                $stats->update([
                    'happiness' => $newHappiness,
                    'affection' => $newAffection,
                    'hunger' => $newHunger,
                    'comfort' => $newComfort,
                ]);

                $cat->update([
                    'last_interaction_at' => Carbon::now(),
                    'last_calculated_at' => Carbon::now(),
                    'last_activity_type' => 'treat',
                    'boredom_counter' => 0,
                ]);

                $animationState = 'eating';
                $feedbackMessage = $isFavorite
                    ? "Camilan favorit {$cat->name}! Dimakan dengan sangat lahap dan mendengkur puas."
                    : "Camilan gurih dinikmati {$cat->name} dengan gembira!";
                break;

            case 'cat_grass':
                if ($cat->is_sleeping) {
                    return [
                        'success' => false,
                        'message' => "{$cat->name} sedang tidur lelap.",
                        'cat' => $this->formatCatResponse($cat, 'sleeping'),
                    ];
                }
                $newCleanliness = $this->clamp(($stats->cleanliness ?? 90.0) + 15.0);
                $newComfort = $this->clamp(($stats->comfort ?? 85.0) + 14.0);
                $newHappiness = $this->clamp($stats->happiness + 16.0);
                $statChanges = [
                    'cleanliness' => round($newCleanliness - ($stats->cleanliness ?? 90.0), 1),
                    'comfort' => round($newComfort - ($stats->comfort ?? 85.0), 1),
                    'happiness' => round($newHappiness - $stats->happiness, 1),
                ];
                $stats->update([
                    'cleanliness' => $newCleanliness,
                    'comfort' => $newComfort,
                    'happiness' => $newHappiness,
                ]);
                $cat->update([
                    'last_interaction_at' => Carbon::now(),
                    'last_calculated_at' => Carbon::now(),
                    'last_activity_type' => 'cat_grass',
                    'boredom_counter' => 0,
                ]);
                $animationState = 'eating';
                $feedbackMessage = "{$cat->name} mengunyah rumput gandum segar! Serat hijau alami sangat baik untuk sistem pencernaannya.";
                break;

            case 'water_fountain':
                if ($cat->is_sleeping) {
                    return [
                        'success' => false,
                        'message' => "{$cat->name} sedang tidur lelap.",
                        'cat' => $this->formatCatResponse($cat, 'sleeping'),
                    ];
                }
                $newComfort = $this->clamp(($stats->comfort ?? 85.0) + 18.0);
                $newCleanliness = $this->clamp(($stats->cleanliness ?? 90.0) + 12.0);
                $newHappiness = $this->clamp($stats->happiness + 14.0);
                $statChanges = [
                    'comfort' => round($newComfort - ($stats->comfort ?? 85.0), 1),
                    'cleanliness' => round($newCleanliness - ($stats->cleanliness ?? 90.0), 1),
                    'happiness' => round($newHappiness - $stats->happiness, 1),
                ];
                $stats->update([
                    'comfort' => $newComfort,
                    'cleanliness' => $newCleanliness,
                    'happiness' => $newHappiness,
                ]);
                $cat->update([
                    'last_interaction_at' => Carbon::now(),
                    'last_calculated_at' => Carbon::now(),
                    'last_activity_type' => 'water_fountain',
                    'boredom_counter' => 0,
                ]);
                $animationState = 'curious';
                $feedbackMessage = "{$cat->name} meminum aliran air sejuk dari water fountain. Tubuhnya segar dan terhidrasi!";
                break;

            case 'scratch_tree':
                if ($cat->is_sleeping) {
                    return [
                        'success' => false,
                        'message' => "{$cat->name} sedang tidur lelap.",
                        'cat' => $this->formatCatResponse($cat, 'sleeping'),
                    ];
                }
                $newHappiness = $this->clamp($stats->happiness + 20.0);
                $newComfort = $this->clamp(($stats->comfort ?? 85.0) + 16.0);
                $newEnergy = $this->clamp($stats->energy - 6.0);
                $statChanges = [
                    'happiness' => round($newHappiness - $stats->happiness, 1),
                    'comfort' => round($newComfort - ($stats->comfort ?? 85.0), 1),
                    'energy' => round($newEnergy - $stats->energy, 1),
                ];
                $stats->update([
                    'happiness' => $newHappiness,
                    'comfort' => $newComfort,
                    'energy' => $newEnergy,
                ]);
                $cat->update([
                    'last_interaction_at' => Carbon::now(),
                    'last_calculated_at' => Carbon::now(),
                    'last_activity_type' => 'scratch_tree',
                    'boredom_counter' => 0,
                ]);
                $animationState = 'playing';
                $feedbackMessage = "{$cat->name} mencakar tiang rami dengan riang gembira! Kukunya terawat dan rasa bosan hilang.";
                break;

            default:
                return [
                    'success' => false,
                    'message' => "Tindakan tidak dikenal.",
                    'cat' => $this->formatCatResponse($cat),
                ];
        }

        // Record interaction in history
        CatInteraction::create([
            'cat_id' => $cat->id,
            'action_type' => $actionType,
            'stat_changes' => $statChanges,
            'notes' => $feedbackMessage,
            'created_at' => Carbon::now(),
        ]);

        return [
            'success' => true,
            'action' => $actionType,
            'message' => $feedbackMessage,
            'stat_changes' => $statChanges,
            'cat' => $this->formatCatResponse($cat->fresh(['stats', 'personality', 'customization']), $animationState),
        ];
    }

    /**
     * Format cat payload for API responses.
     */
    public function formatCatResponse(Cat $cat, ?string $forcedState = null): array
    {
        $cat->loadMissing(['stats', 'personality', 'customization']);

        $currentState = $forcedState ?? $this->getDominantState($cat);
        $personality = $cat->personality;

        // Pick a dynamic idle dialogue based on personality and current state
        $dialogues = $personality ? ($personality->idle_dialogues ?? []) : [];
        $randomThought = !empty($dialogues) ? $dialogues[array_rand($dialogues)] : "Miau~";

        if ($currentState === 'sleeping') {
            $randomThought = "Zzz... Dengkur halus berirama...";
        } elseif ($currentState === 'grooming') {
            $randomThought = "Menjilati bulu dengan teliti... terasa bersih dan rapi.";
        } elseif ($currentState === 'scared') {
            $randomThought = "Tolong jangan menakutiku...";
        } elseif ($currentState === 'angry') {
            $randomThought = "Sedang sangat kesal! Hiss...";
        } elseif ($cat->stats->hunger >= 80) {
            $randomThought = "Perutku keroncongan... butuh makanan!";
        }

        return [
            'id' => $cat->id,
            'name' => $cat->name,
            'gender' => $cat->gender,
            'is_sleeping' => (bool)$cat->is_sleeping,
            'current_room' => $cat->current_room,
            'favorite_food' => $cat->favorite_food ?? 'canned_tuna',
            'boredom_counter' => (int)($cat->boredom_counter ?? 0),
            'last_interaction_at' => $cat->last_interaction_at?->toIso8601String(),
            'last_fed_at' => $cat->last_fed_at?->toIso8601String(),
            'last_slept_at' => $cat->last_slept_at?->toIso8601String(),
            'current_state' => $currentState,
            'current_thought' => $randomThought,
            'personality' => [
                'id' => $personality?->id,
                'name' => $personality?->name,
                'code' => $personality?->code,
                'description' => $personality?->description,
                'preferred_activity' => $personality?->preferred_activity,
            ],
            'stats' => [
                'hunger' => (float)$cat->stats->hunger,
                'happiness' => (float)$cat->stats->happiness,
                'energy' => (float)$cat->stats->energy,
                'trust' => (float)$cat->stats->trust,
                'fear' => (float)$cat->stats->fear,
                'affection' => (float)$cat->stats->affection,
                'comfort' => (float)($cat->stats->comfort ?? 85.0),
                'cleanliness' => (float)($cat->stats->cleanliness ?? 90.0),
            ],
            'customization' => [
                'fur_color' => $cat->customization->fur_color,
                'fur_secondary_color' => $cat->customization->fur_secondary_color,
                'pattern' => $cat->customization->pattern,
                'pattern_color' => $cat->customization->pattern_color,
                'eye_color' => $cat->customization->eye_color,
                'ear_style' => $cat->customization->ear_style,
                'collar_color' => $cat->customization->collar_color,
                'bell' => (bool)$cat->customization->bell,
                'accessory' => $cat->customization->accessory,
            ],
        ];
    }
}
