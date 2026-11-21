<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CatInteraction extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'cat_id',
        'action_type',
        'stat_changes',
        'notes',
        'created_at',
    ];

    protected $casts = [
        'stat_changes' => 'array',
        'created_at' => 'datetime',
    ];

    public function cat(): BelongsTo
    {
        return $this->belongsTo(Cat::class);
    }
}
