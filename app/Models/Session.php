<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Session extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'room_id',
        'host_id',
        'start_time',
        'base_end_time',
        'status',
        'privacy',
    ];

    protected function casts(): array
    {
        return [
            'start_time' => 'datetime',
            'base_end_time' => 'datetime',
        ];
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function host(): BelongsTo
    {
        return $this->belongsTo(User::class, 'host_id');
    }

    public function guests(): HasMany
    {
        return $this->hasMany(SessionGuest::class);
    }

    public function attendingUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'session_guests')
            ->withPivot(['join_time', 'leave_time']);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(Invitation::class);
    }
}
