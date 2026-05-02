<?php

namespace Database\Factories;

use App\Models\RoomType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RoomType>
 */
class RoomTypeFactory extends Factory
{
    protected $model = RoomType::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word(),
            'hourly_rate' => fake()->randomFloat(2, 10, 120),
            'free_base_minutes' => fake()->numberBetween(15, 90),
            'is_deleted' => false,
        ];
    }
}
