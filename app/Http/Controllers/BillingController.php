<?php

namespace App\Http\Controllers;

use App\Models\Session;
use App\Models\SessionGuest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BillingController extends Controller
{
    public function checkout(Session $session)
    {
        $user = Auth::user();
        
        // Find the user's guest record for this session
        $guest = SessionGuest::where('session_id', $session->id)
            ->where('user_id', $user->id)
            ->whereNull('leave_time')
            ->first();

        if (!$guest && $session->host_id !== $user->id) {
            abort(403, 'You are not checked into this session.');
        }

        $invoice = $this->calculateInvoice($session, $user->id);

        return Inertia::render('Session/Checkout', [
            'session' => $session->load(['room.roomType', 'room.store']),
            'invoice' => $invoice,
            'is_host' => $session->host_id === $user->id,
        ]);
    }

    public function confirmPayment(Request $request, Session $session)
    {
        $user = Auth::user();

        return DB::transaction(function () use ($session, $user) {
            $guest = SessionGuest::where('session_id', $session->id)
                ->where('user_id', $user->id)
                ->whereNull('leave_time')
                ->first();

            if ($guest) {
                $guest->update(['leave_time' => now()]);
            }

            // If user is host, or if everyone has left, potentially close session
            $remainingGuests = $session->guests()->whereNull('leave_time')->count();
            
            if ($session->host_id === $user->id || $remainingGuests === 0) {
                $this->closeSession($session);
            }

            return redirect()->route('home')->with('status', 'Checkout complete. Thank you!');
        });
    }

    public function endForAll(Session $session)
    {
        if ($session->host_id !== Auth::id()) {
            abort(403);
        }

        $this->closeSession($session);

        return redirect()->route('home')->with('status', 'Session ended for all guests.');
    }

    private function calculateInvoice(Session $session, int $userId)
    {
        $guest = SessionGuest::where('session_id', $session->id)
            ->where('user_id', $userId)
            ->first();

        $startTime = $guest ? $guest->join_time : $session->start_time;
        $leaveTime = now(); // For calculation purposes before actual update

        $totalMinutes = $startTime->diffInMinutes($leaveTime);
        $freeMinutes = $session->room->roomType->free_base_minutes;
        $billableMinutes = max(0, $totalMinutes - $freeMinutes);
        
        $hourlyRate = (float) $session->room->roomType->hourly_rate;
        $timeCost = round(($billableMinutes / 60) * $hourlyRate, 2);

        $orders = $session->orders()
            ->where('user_id', $userId)
            ->whereIn('status', ['Done', 'Out for Delivery'])
            ->with('items.product')
            ->get();

        $orderItems = [];
        $productTotal = 0;

        foreach ($orders as $order) {
            foreach ($order->items as $item) {
                $cost = (float) ($item->quantity * $item->unit_price);
                $productTotal += $cost;
                $orderItems[] = [
                    'name' => $item->product->name,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'total' => $cost
                ];
            }
        }

        return [
            'time_details' => [
                'join_time' => $startTime,
                'leave_time' => $leaveTime,
                'total_minutes' => (int) $totalMinutes,
                'free_minutes' => (int) $freeMinutes,
                'billable_minutes' => (int) $billableMinutes,
                'hourly_rate' => $hourlyRate,
                'cost' => (float) $timeCost,
            ],
            'order_items' => $orderItems,
            'product_total' => (float) $productTotal,
            'grand_total' => (float) ($timeCost + $productTotal),
        ];
    }

    private function closeSession(Session $session)
    {
        DB::transaction(function () use ($session) {
            $session->update(['status' => 'completed']);
            $session->room->update(['current_status' => 'available']);
            
            \App\Events\RoomStatusChanged::dispatch($session->room->id, 'available');

            // Force leave_time for anyone remaining
            $session->guests()->whereNull('leave_time')->update(['leave_time' => now()]);
        });
    }
}
