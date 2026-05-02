<?php

namespace Database\Factories;

use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Room>
 */
class RoomFactory extends Factory
{
    protected $model = Room::class;

    public function definition(): array
    {
        return [
            'room_number' => fake()->unique()->bothify('R-###'),
            'room_type_id' => RoomType::factory(),
            'max_capacity' => fake()->numberBetween(2, 20),
            'current_status' => fake()->randomElement(['available', 'occupied', 'maintenance']),
            'is_deleted' => false,
        ];
    }
}
