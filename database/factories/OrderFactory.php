<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Session;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'session_id' => Session::factory(),
            'user_id' => User::factory(),
            'status' => fake()->randomElement(['open', 'paid', 'void']),
            'ordered_at' => fake()->dateTimeBetween('-2 days', 'now'),
        ];
    }
}
