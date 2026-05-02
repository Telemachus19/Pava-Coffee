<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RoomType extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'name',
        'hourly_rate',
        'free_base_minutes',
        'is_deleted',
    ];

    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class);
    }
}
