<?php

namespace Database\Factories;

use App\Models\Session;
use App\Models\SessionGuest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SessionGuest>
 */
class SessionGuestFactory extends Factory
{
    protected $model = SessionGuest::class;

    public function definition(): array
    {
        $joinTime = fake()->dateTimeBetween('-2 days', 'now');

        return [
            'session_id' => Session::factory(),
            'user_id' => User::factory(),
            'join_time' => $joinTime,
            'leave_time' => fake()->boolean(50) ? (clone $joinTime)->modify('+1 hour') : null,
        ];
    }
}
