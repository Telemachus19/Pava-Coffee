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

        $users = User::factory()
            ->count(12)
            ->state(fn () => ['role_id' => $roles->random()->id])
            ->create();

        User::factory()->create([
            'role_id' => $roles->first()->id,
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $roomTypes = RoomType::factory()->count(3)->create();
        $rooms = Room::factory()
            ->count(8)
            ->state(fn () => ['room_type_id' => $roomTypes->random()->id])
            ->create();

        $categories = Category::factory()->count(4)->create();
        $products = Product::factory()
            ->count(12)
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
