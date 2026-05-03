<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Role;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard()
    {
        $activities = collect();

        // Get recent staff
        User::with('role')->whereHas('role', function($q) {
            $q->whereIn('name', ['Staff', 'Admin']);
        })->latest('id')->limit(3)->get()->each(function($user) use ($activities) {
            $activities->push([
                'id' => 'user-' . $user->id,
                'text' => "New staff account created: \"{$user->name}\"",
                'time' => $user->created_at ? $user->created_at->diffForHumans() : 'Recently'
            ]);
        });

        // Get recent products
        Product::latest('id')->limit(3)->get()->each(function($product) use ($activities) {
            $activities->push([
                'id' => 'prod-' . $product->id,
                'text' => "Added product: \"{$product->name}\"",
                'time' => 'Recently'
            ]);
        });

        // Get recent orders
        Order::with('user')->latest('id')->limit(3)->get()->each(function($order) use ($activities) {
            $activities->push([
                'id' => 'order-' . $order->id,
                'text' => "Order #{$order->id} placed by {$order->user->name}",
                'time' => $order->ordered_at ? \Carbon\Carbon::parse($order->ordered_at)->diffForHumans() : 'Recently'
            ]);
        });

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'products' => Product::where('is_deleted', false)->count(),
                'stores' => Store::where('is_deleted', false)->count(),
                'staff' => User::whereHas('role', function($q) {
                    $q->whereIn('name', ['Staff', 'Admin']);
                })->count(),
                'activeOrders' => Order::whereIn('status', ['Processing', 'Out for Delivery'])->count(),
            ],
            'recentActivities' => $activities->sortByDesc('id')->values()->all(),
        ]);
    }

    // --- Products ---
    public function productsIndex()
    {
        return Inertia::render('Admin/Products', [
            'products' => Product::with('category')->where('is_deleted', false)->orderBy('name')->paginate(10),
            'categories' => Category::where('is_deleted', false)->get(),
        ]);
    }

    public function toggleProduct(Product $product)
    {
        $product->update(['is_available' => !$product->is_available]);
        return back()->with('status', 'Product availability updated.');
    }

    public function storeProduct(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|string',
            'is_available' => 'boolean',
        ]);

        Product::create($validated);

        return back()->with('status', 'Product added successfully.');
    }

    // --- Orders ---
    public function ordersIndex()
    {
        return Inertia::render('Admin/Orders', [
            'orders' => Order::with(['items.product', 'session.room', 'user'])
                ->whereIn('status', ['Processing', 'Out for Delivery'])
                ->orderBy('ordered_at', 'asc')
                ->get(),
        ]);
    }

    public function updateOrderStatus(Order $order, Request $request)
    {
        $validated = $request->validate([
            'status' => 'required|in:Processing,Out for Delivery,Done,Cancelled',
        ]);

        $order->update(['status' => $validated['status']]);

        \App\Events\OrderStatusUpdated::dispatch($order->id, $validated['status']);

        return back()->with('status', "Order #{$order->id} updated to {$validated['status']}.");
    }

    // --- Locations (Stores) ---
    public function storesIndex()
    {
        return Inertia::render('Admin/Stores', [
            'stores' => Store::where('is_deleted', false)->get(),
        ]);
    }

    public function storeStore(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        Store::create($validated);

        return back()->with('status', 'Location added successfully.');
    }

    public function updateStore(Request $request, Store $store)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $store->update($validated);

        return back()->with('status', 'Location updated successfully.');
    }

    public function destroyStore(Store $store)
    {
        $store->update(['is_deleted' => true]);
        return back()->with('status', 'Location removed successfully.');
    }

    // --- Rooms ---
    public function roomsIndex(Store $store)
    {
        return Inertia::render('Admin/Rooms', [
            'store' => $store,
            'rooms' => $store->rooms()->with('roomType')->where('is_deleted', false)->paginate(10),
            'roomTypes' => RoomType::where('is_deleted', false)->get(),
        ]);
    }

    public function storeRoom(Request $request, Store $store)
    {
        $validated = $request->validate([
            'room_number' => 'required|string|max:255',
            'room_type_id' => 'required|exists:room_types,id',
            'max_capacity' => 'required|integer|min:1',
            'current_status' => 'required|in:available,occupied,maintenance',
        ]);

        $store->rooms()->create($validated);

        return back()->with('status', 'Room added successfully.');
    }

    public function updateRoom(Request $request, Store $store, Room $room)
    {
        $validated = $request->validate([
            'room_number' => 'required|string|max:255',
            'room_type_id' => 'required|exists:room_types,id',
            'max_capacity' => 'required|integer|min:1',
            'current_status' => 'required|in:available,occupied,maintenance',
        ]);

        $room->update($validated);

        return back()->with('status', 'Room updated successfully.');
    }

    public function destroyRoom(Store $store, Room $room)
    {
        $room->update(['is_deleted' => true]);
        return back()->with('status', 'Room removed successfully.');
    }

    // --- Staff Accounts ---
    public function staffIndex()
    {
        return Inertia::render('Admin/Staff', [
            'staff' => User::with('role')->whereHas('role', function ($query) {
                $query->whereIn('name', ['Staff', 'Admin']);
            })->latest('id')->paginate(10),
            'roles' => Role::whereIn('name', ['Staff', 'Admin', 'Host'])->get(),
        ]);
    }

    public function storeStaff(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
        ]);

        $validated['password_hash'] = Hash::make($validated['password']);
        unset($validated['password']);

        User::create($validated);

        return back()->with('status', 'Staff account created successfully.');
    }
}
