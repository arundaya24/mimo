<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CatCustomization extends Model
{
    use HasFactory;

    protected $fillable = [
        'cat_id',
        'fur_color',
        'fur_secondary_color',
        'pattern',
        'pattern_color',
        'eye_color',
        'ear_style',
        'collar_color',
        'bell',
        'accessory',
    ];

    protected $casts = [
        'bell' => 'boolean',
    ];

    public function cat(): BelongsTo
    {
        return $this->belongsTo(Cat::class);
    }
}
