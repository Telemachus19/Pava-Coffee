<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use App\Models\Session;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InvitationController extends Controller
{
    public function searchUsers(Request $request, Session $session)
    {
        $query = $request->query('query');

        if (empty($query)) {
            return response()->json([]);
        }

        // Get users matching name or email, excluding the host
        $users = User::where('id', '!=', Auth::id())
            ->where(function ($q) use ($query) {
                $q->where('name', 'ilike', "%{$query}%")
                  ->orWhere('email', 'ilike', "%{$query}%");
            })
            ->limit(10)
            ->get();

        // Check each user for active sessions
        $results = $users->map(function ($user) use ($session) {
            $isActive = Session::where('status', 'active')
                ->whereHas('guests', function ($q) use ($user) {
                    $q->where('user_id', $user->id)
                      ->whereNull('leave_time');
                })
                ->exists();
            
            $isInvited = Invitation::where('session_id', $session->id)
                ->where('user_id', $user->id)
                ->where('status', 'pending')
                ->exists();

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_busy' => $isActive,
                'is_invited' => $isInvited,
            ];
        });

        return response()->json($results);
    }

    public function invite(Request $request, Session $session)
    {
        $validated = $request->validate([
            'user_ids' => ['required', 'array'],
            'user_ids.*' => ['exists:users,id'],
        ]);

        $room = $session->room;
        $currentGuestCount = $session->guests()->whereNull('leave_time')->count();
        $pendingInvitesCount = $session->invitations()->where('status', 'pending')->count();
        
        $availableSlots = $room->max_capacity - $currentGuestCount - $pendingInvitesCount;

        if (count($validated['user_ids']) > $availableSlots) {
            return back()->withErrors(['user_ids' => "Room capacity exceeded. Max capacity is {$room->max_capacity}."]);
        }

        foreach ($validated['user_ids'] as $userId) {
            Invitation::firstOrCreate([
                'session_id' => $session->id,
                'user_id' => $userId,
                'status' => 'pending',
            ]);
        }

        return back()->with('status', 'Invitations sent successfully!');
    }

    public function updatePrivacy(Request $request, Session $session)
    {
        $validated = $request->validate([
            'privacy' => ['required', 'in:private,shared'],
        ]);

        if ($session->host_id !== Auth::id()) {
            abort(403);
        }

        $session->update(['privacy' => $validated['privacy']]);

        return back()->with('status', "Room is now {$validated['privacy']}.");
    }

    public function respond(Request $request, Invitation $invitation)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:accepted,declined'],
        ]);

        if ($invitation->user_id !== Auth::id()) {
            abort(403);
        }

        $invitation->update(['status' => $validated['status']]);

        if ($validated['status'] === 'accepted') {
            $session = $invitation->session;
            
            // Join the session
            $session->guests()->create([
                'user_id' => Auth::id(),
                'join_time' => now(),
            ]);

            return redirect()->route('session.show', $session->id);
        }

        return back()->with('status', 'Invitation declined.');
    }

    public function pendingInvitations()
    {
        $invitations = Invitation::with(['session.room', 'session.host'])
            ->where('user_id', Auth::id())
            ->where('status', 'pending')
            ->whereHas('session', function($q) {
                $q->where('status', 'active');
            })
            ->get();

        return response()->json($invitations);
    }
}
