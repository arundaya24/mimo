<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CatStat extends Model
{
    use HasFactory;

    protected $fillable = [
        'cat_id',
        'hunger',
        'happiness',
        'energy',
        'trust',
        'fear',
        'affection',
        'comfort',
        'cleanliness',
    ];

    protected $casts = [
        'hunger' => 'float',
        'happiness' => 'float',
        'energy' => 'float',
        'trust' => 'float',
        'fear' => 'float',
        'affection' => 'float',
        'comfort' => 'float',
        'cleanliness' => 'float',
    ];

    public function cat(): BelongsTo
    {
        return $this->belongsTo(Cat::class);
    }
}
