<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Cat extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'gender',
        'personality_id',
        'is_sleeping',
        'current_room',
        'last_interaction_at',
        'last_fed_at',
        'last_slept_at',
        'last_calculated_at',
    ];

    protected $casts = [
        'is_sleeping' => 'boolean',
        'last_interaction_at' => 'datetime',
        'last_fed_at' => 'datetime',
        'last_slept_at' => 'datetime',
        'last_calculated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function personality(): BelongsTo
    {
        return $this->belongsTo(CatPersonality::class, 'personality_id');
    }

    public function stats(): HasOne
    {
        return $this->hasOne(CatStat::class);
    }

    public function customization(): HasOne
    {
        return $this->hasOne(CatCustomization::class);
    }

    public function interactions(): HasMany
    {
        return $this->hasMany(CatInteraction::class);
    }
}
