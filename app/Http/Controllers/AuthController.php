<?php

namespace App\Http\Controllers;

use App\Mail\ResetPasswordMail;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showRegister()
    {
        return Inertia::render('Auth/Register');
    }

    public function storeRegistration(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'confirmed', PasswordRule::defaults()],
        ]);

        $role = Role::firstOrCreate(['name' => 'Guest'], ['description' => 'Room guest']);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password_hash' => Hash::make($validated['password']),
            'role_id' => $role->id,
        ]);

        Auth::login($user);

        return redirect()->intended('/');
    }

    public function create()
    {
        return Inertia::render('Auth/Login');
    }

    public function store(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
        ]);

        $remember = (bool) ($credentials['remember'] ?? false);

        if (! Auth::attempt($request->only('email', 'password'), $remember)) {
            return back()->withErrors([
                'email' => __('auth.failed'),
            ])->onlyInput('email');
        }

        $request->session()->regenerate();

        return redirect()->intended('/');
    }

    public function destroy(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    public function forgotPassword()
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            // We do not want to reveal if a user exists or not
            return back()->with('status', 'If an account with that email exists, we have sent a password reset link.');
        }

        $token = Str::random(60);
        $user->forceFill([
            'reset_token' => hash('sha256', $token),
            'reset_token_expires_at' => now()->addMinutes(60),
        ])->save();

        $resetUrl = route('password.reset', [
            'token' => $token,
            'email' => $user->email,
        ]);

        Mail::to($user->email)->send(new ResetPasswordMail($resetUrl));

        return back()->with('status', 'If an account with that email exists, we have sent a password reset link.');
    }

    public function resetPassword(Request $request, string $token)
    {
        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
            'email' => $request->query('email'),
        ]);
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'string', 'email'],
            'password' => [
                'required',
                'string',
                'confirmed',
                PasswordRule::min(8)->letters()->mixedCase()->numbers()->symbols(),
            ],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user) {
            return back()->withErrors(['email' => __('passwords.user')]);
        }

        if (! $user->reset_token || ! hash_equals($user->reset_token, hash('sha256', $validated['token']))) {
            return back()->withErrors(['email' => __('passwords.token')]);
        }

        if (! $user->reset_token_expires_at || $user->reset_token_expires_at->isPast()) {
            return back()->withErrors(['email' => __('passwords.token')]);
        }

        $user->forceFill([
            'password_hash' => Hash::make($validated['password']),
            'reset_token' => null,
            'reset_token_expires_at' => null,
        ])->save();

        return redirect()->route('login')->with('status', __('passwords.reset'));
    }
}
