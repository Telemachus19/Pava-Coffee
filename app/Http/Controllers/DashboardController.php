<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\SessionGuest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        // 1. Active Orders (Processing or Out for Delivery)
        $activeOrders = Order::with(['items.product', 'session.room.store'])
            ->where('user_id', $user->id)
            ->whereIn('status', ['Processing', 'Out for Delivery'])
            ->orderBy('ordered_at', 'desc')
            ->get();

        // 2. Historical Data (Completed Sessions & Finished Orders)
        // We look for sessions the user has joined and left
        $query = SessionGuest::with(['session.room.store', 'session.room.roomType'])
            ->where('user_id', $user->id)
            ->whereNotNull('leave_time');

        // Filtering by date
        if ($request->has('from')) {
            $query->whereDate('join_time', '>=', $request->date('from'));
        }
        if ($request->has('to')) {
            $query->whereDate('join_time', '<=', $request->date('to'));
        }

        $history = $query->orderBy('join_time', 'desc')->paginate(10)->withQueryString();

        return Inertia::render('Dashboard/Index', [
            'activeOrders' => $activeOrders,
            'history' => $history,
            'filters' => $request->only(['from', 'to']),
        ]);
    }

    public function cancelOrder(Order $order)
    {
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        if ($order->status !== 'Processing') {
            return back()->with('error', 'Only orders in "Processing" status can be cancelled.');
        }

        $order->update(['status' => 'Cancelled']);

        return back()->with('status', 'Order cancelled successfully.');
    }
}
