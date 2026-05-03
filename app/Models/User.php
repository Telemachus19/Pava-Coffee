<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable([
    'role_id',
    'name',
    'email',
    'password_hash',
    'profile_picture',
    'ext',
    'reset_token',
    'reset_token_expires_at',
    'created_at',
])]
#[Hidden(['password_hash', 'reset_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public $timestamps = false;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password_hash' => 'hashed',
            'reset_token_expires_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function hostedSessions(): HasMany
    {
        return $this->hasMany(Session::class, 'host_id');
    }

    public function sessionGuests(): HasMany
    {
        return $this->hasMany(SessionGuest::class);
    }

    public function sessionsAttending(): BelongsToMany
    {
        return $this->belongsToMany(Session::class, 'session_guests')
            ->withPivot(['join_time', 'leave_time']);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    public function hasActiveSession(): bool
    {
        return Session::where('status', 'active')
            ->where(function ($query) {
                $query->where('host_id', $this->id)
                    ->orWhereHas('guests', function ($q) {
                        $q->where('user_id', $this->id)
                          ->whereNull('leave_time');
                    });
            })->exists();
    }
}
