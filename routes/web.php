<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;

use App\Http\Controllers\RoomController;

use App\Http\Controllers\InvitationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\DashboardController;

Route::get('/', [RoomController::class, 'index'])->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/orders/{order}/cancel', [DashboardController::class, 'cancelOrder'])->name('orders.cancel');

    Route::post('/reserve', [RoomController::class, 'reserve'])->name('room.reserve');
    Route::get('/session/{session}', function (\App\Models\Session $session) {
        return Inertia::render('Session/Show', [
            'session' => $session->load([
                'room.roomType', 
                'host', 
                'guests.user', 
                'invitations.user',
                'orders' => function($query) {
                    $query->where('user_id', Auth::id())->with('items.product');
                }
            ])
        ]);
    })->name('session.show');

    // Invitations
    Route::get('/sessions/{session}/search-users', [InvitationController::class, 'searchUsers'])->name('invitations.search');
    Route::post('/sessions/{session}/invite', [InvitationController::class, 'invite'])->name('invitations.invite');
    Route::patch('/sessions/{session}/privacy', [InvitationController::class, 'updatePrivacy'])->name('session.privacy');
    Route::post('/invitations/{invitation}/respond', [InvitationController::class, 'respond'])->name('invitations.respond');
    Route::get('/pending-invitations', [InvitationController::class, 'pendingInvitations'])->name('invitations.pending');

    // Ordering
    Route::get('/sessions/{session}/menu', [OrderController::class, 'menu'])->name('session.menu');
    Route::post('/sessions/{session}/order', [OrderController::class, 'store'])->name('order.store');

    // Billing
    Route::get('/sessions/{session}/checkout', [BillingController::class, 'checkout'])->name('session.checkout');
    Route::post('/sessions/{session}/pay', [BillingController::class, 'confirmPayment'])->name('session.pay');
    Route::post('/sessions/{session}/end-all', [BillingController::class, 'endForAll'])->name('session.end-all');
});

Route::middleware('guest')->group(function () {
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'storeRegistration']);

    Route::get('/login', [AuthController::class, 'create'])->name('login');
    Route::post('/login', [AuthController::class, 'store']);

    Route::get('/forgot-password', [AuthController::class, 'forgotPassword'])->name('password.request');
    Route::post('/forgot-password', [AuthController::class, 'sendResetLink'])->name('password.email');

    Route::get('/reset-password/{token}', [AuthController::class, 'resetPassword'])->name('password.reset');
    Route::post('/reset-password', [AuthController::class, 'updatePassword'])->name('password.update');
});

Route::post('/logout', [AuthController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');
