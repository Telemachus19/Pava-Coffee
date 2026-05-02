<?php

namespace Database\Factories;

use App\Models\Room;
use App\Models\Session;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Session>
 */
class SessionFactory extends Factory
{
    protected $model = Session::class;

    public function definition(): array
    {
        $start = fake()->dateTimeBetween('-2 days', 'now');
        $baseEnd = (clone $start)->modify('+2 hours');

        return [
            'room_id' => Room::factory(),
            'host_id' => User::factory(),
            'start_time' => $start,
            'base_end_time' => $baseEnd,
            'status' => fake()->randomElement(['scheduled', 'active', 'closed']),
        ];
    }
}
