<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Role;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\Session;
use App\Models\Store;
use App\Models\SessionGuest;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $roles = collect([
            Role::create(['name' => 'Admin', 'description' => 'System administrator']),
            Role::create(['name' => 'Host', 'description' => 'Room host']),
            Role::create(['name' => 'Guest', 'description' => 'Room guest']),
            Role::create(['name' => 'Staff', 'description' => 'Operations staff']),
        ]);

        $stores = collect([
            Store::create(['name' => 'Pava Coffee - Downtown', 'address' => '123 Main St']),
            Store::create(['name' => 'Pava Coffee - Westside', 'address' => '456 West Ave']),
        ]);

        $users = User::factory()
            ->count(12)
            ->state(fn () => ['role_id' => $roles->random()->id])
            ->create();

        User::factory()->create([
            'role_id' => $roles->first()->id,
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $roomTypes = collect([
            RoomType::create(['name' => 'Single Pod', 'hourly_rate' => 12, 'free_base_minutes' => 30]),
            RoomType::create(['name' => 'Standard Room', 'hourly_rate' => 20, 'free_base_minutes' => 60]),
            RoomType::create(['name' => 'Large Suite', 'hourly_rate' => 45, 'free_base_minutes' => 60]),
            RoomType::create(['name' => 'Conference Hall', 'hourly_rate' => 120, 'free_base_minutes' => 0]),
        ]);

        $rooms = Room::factory()
            ->count(24)
            ->state(fn () => [
                'room_type_id' => $roomTypes->random()->id,
                'store_id' => $stores->random()->id,
                'max_capacity' => fake()->randomElement([1, 2, 4, 8, 12, 20]),
                'current_status' => 'available',
            ])
            ->create();

        $categories = Category::factory()->count(5)->create();
        $products = Product::factory()
            ->count(25)
            ->state(fn () => ['category_id' => $categories->random()->id])
            ->create();

        $sessions = Session::factory()
            ->count(6)
            ->state(fn () => [
                'room_id' => $rooms->random()->id,
                'host_id' => $users->random()->id,
            ])
            ->create();

        $sessions->each(function (Session $session) use ($users) {
            $guestCount = fake()->numberBetween(1, 3);

            SessionGuest::factory()
                ->count($guestCount)
                ->state(fn () => [
                    'session_id' => $session->id,
                    'user_id' => $users->random()->id,
                ])
                ->create();
        });

        $orders = collect();
        $sessions->each(function (Session $session) use ($users, $orders) {
            $orderBatch = Order::factory()
                ->count(fake()->numberBetween(1, 2))
                ->state(fn () => [
                    'session_id' => $session->id,
                    'user_id' => $users->random()->id,
                ])
                ->create();

            $orders->push(...$orderBatch->all());
        });

        $orders->each(function (Order $order) use ($products) {
            OrderItem::factory()
                ->count(fake()->numberBetween(1, 3))
                ->state(fn () => [
                    'order_id' => $order->id,
                    'product_id' => $products->random()->id,
                ])
                ->create();
        });
    }
}
