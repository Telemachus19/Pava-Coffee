<?php

namespace App\Http\Controllers;

use App\Models\SessionGuest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StayController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        // Historical Data (Completed Sessions & Finished Orders)
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

        $history = $query->orderBy('join_time', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('Stay/Index', [
            'history' => $history,
            'filters' => $request->only(['from', 'to']),
        ]);
    }
}
