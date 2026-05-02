<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(3, true),
            'price' => fake()->randomFloat(2, 2, 45),
            'image' => fake()->boolean(70) ? fake()->imageUrl(640, 480, 'food', true) : null,
            'is_available' => fake()->boolean(90),
            'category_id' => Category::factory(),
            'is_deleted' => false,
        ];
    }
}
