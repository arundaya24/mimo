<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CatPersonality extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'hunger_decay_multiplier',
        'energy_decay_multiplier',
        'happiness_decay_multiplier',
        'trust_gain_multiplier',
        'fear_sensitivity',
        'affection_gain_multiplier',
        'preferred_activity',
        'idle_dialogues',
        'reaction_dialogues',
    ];

    protected $casts = [
        'hunger_decay_multiplier' => 'float',
        'energy_decay_multiplier' => 'float',
        'happiness_decay_multiplier' => 'float',
        'trust_gain_multiplier' => 'float',
        'fear_sensitivity' => 'float',
        'affection_gain_multiplier' => 'float',
        'idle_dialogues' => 'array',
        'reaction_dialogues' => 'array',
    ];

    public function cats(): HasMany
    {
        return $this->hasMany(Cat::class, 'personality_id');
    }
}
