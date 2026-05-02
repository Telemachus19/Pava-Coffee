<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Session;
use App\Models\Store;
use App\Jobs\ForceCheckoutSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RoomController extends Controller
{
    public function index()
    {
        if (Auth::check()) {
            $activeSession = Session::where('status', 'active')
                ->where(function ($query) {
                    $query->where('host_id', Auth::id())
                        ->orWhereHas('guests', function ($q) {
                            $q->where('user_id', Auth::id())->whereNull('leave_time');
                        });
                })->first();

            if ($activeSession) {
                return redirect()->route('session.show', $activeSession->id);
            }
        }

        return Inertia::render('Home', [
            'stores' => Store::with(['rooms' => function ($query) {
                $query->where('is_deleted', false)->with('roomType');
            }])->where('is_active', true)->where('is_deleted', false)->get(),
        ]);
    }

    public function reserve(Request $request)
    {
        $validated = $request->validate([
            'room_id' => ['required', 'exists:rooms,id'],
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $room = Room::where('id', $validated['room_id'])
                ->lockForUpdate()
                ->first();

            if ($room->current_status !== 'available') {
                return back()->withErrors(['room_id' => 'This room is no longer available.']);
            }

            $room->update(['current_status' => 'occupied']);

            $startTime = now();
            $baseMinutes = $room->roomType->free_base_minutes;
            $endTime = $startTime->copy()->addMinutes($baseMinutes);

            $session = Session::create([
                'room_id' => $room->id,
                'host_id' => $request->user()->id,
                'start_time' => $startTime->toDateTimeString(),
                'base_end_time' => $endTime->toDateTimeString(),
                'status' => 'active',
            ]);

            // Add the host as the first guest
            $session->guests()->create([
                'user_id' => $request->user()->id,
                'join_time' => $startTime,
            ]);

            ForceCheckoutSession::dispatch($session)->delay($endTime);

            return redirect()->route('session.show', $session->id);
        });
    }
}
