<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function menu(Session $session)
    {
        // Ensure user is part of the session
        $isGuest = $session->guests()
            ->where('user_id', Auth::id())
            ->whereNull('leave_time')
            ->exists();

        if (!$isGuest && $session->host_id !== Auth::id()) {
            abort(403, 'You are not checked into this session.');
        }

        if ($session->status !== 'active') {
            return redirect()->route('home')->with('error', 'This session is no longer active.');
        }

        return Inertia::render('Session/Menu', [
            'session' => $session->load(['room.store']),
            'categories' => Category::with(['products' => function ($query) {
                $query->where('is_available', true)->where('is_deleted', false);
            }])->where('is_deleted', false)->get(),
        ]);
    }

    public function store(Request $request, Session $session)
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        // Verify session is active
        if ($session->status !== 'active') {
            return back()->withErrors(['session' => 'Session has expired.']);
        }

        // Verify user is checked in and get their active 'stay' record
        $guest = $session->guests()
            ->where('user_id', Auth::id())
            ->whereNull('leave_time')
            ->first();

        if (!$guest && $session->host_id !== Auth::id()) {
            return back()->withErrors(['session' => 'You are not checked into this session.']);
        }

        return DB::transaction(function () use ($validated, $session, $guest) {
            $order = Order::create([
                'session_id' => $session->id,
                'user_id' => Auth::id(),
                'session_guest_id' => $guest?->id, // If host is not a guest, this might be null, but we usually make them a guest.
                'status' => 'Processing',
                'ordered_at' => now(),
            ]);

            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                
                $order->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->price,
                ]);
            }

            \App\Events\OrderPlaced::dispatch($order);

            return redirect()->route('session.show', $session->id)->with('status', 'Order placed successfully!');
        });
    }
}
