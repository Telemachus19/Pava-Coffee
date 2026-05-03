<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;

use App\Http\Controllers\RoomController;

use App\Http\Controllers\InvitationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\StayController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\CategoryController;

Route::get('/', [RoomController::class, 'index'])->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/stays', [StayController::class, 'index'])->name('stays.index');
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');

    Route::post('/reserve', [RoomController::class, 'reserve'])->name('room.reserve');
    Route::get('/session/{session}', function (\App\Models\Session $session) {
        $activeGuest = $session->guests()
            ->where('user_id', Auth::id())
            ->whereNull('leave_time')
            ->first();

        return Inertia::render('Session/Show', [
            'session' => $session->load([
                'room.roomType', 
                'host', 
                'guests.user', 
                'invitations.user',
                'orders' => function($query) use ($activeGuest) {
                    $query->where('user_id', Auth::id())
                        ->where('session_guest_id', $activeGuest?->id)
                        ->with('items.product');
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
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/sessions/{session}/menu', [OrderController::class, 'menu'])->name('session.menu');
    Route::post('/sessions/{session}/order', [OrderController::class, 'store'])->name('order.store');

    // Billing
    Route::get('/sessions/{session}/checkout', [BillingController::class, 'checkout'])->name('session.checkout');
    Route::post('/sessions/{session}/pay', [BillingController::class, 'confirmPayment'])->name('session.pay');
    Route::post('/sessions/{session}/end-all', [BillingController::class, 'endForAll'])->name('session.end-all');

    // Admin Routes
    Route::middleware('admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
        
        Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
        Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::patch('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

        Route::get('/products', [AdminController::class, 'productsIndex'])->name('products.index');
        Route::post('/products', [AdminController::class, 'storeProduct'])->name('products.store');
        Route::patch('/products/{product}/toggle', [AdminController::class, 'toggleProduct'])->name('products.toggle');
        
        Route::get('/orders', [AdminController::class, 'ordersIndex'])->name('orders.index');
        Route::patch('/orders/{order}/status', [AdminController::class, 'updateOrderStatus'])->name('orders.update-status');
        
        Route::get('/stores', [AdminController::class, 'storesIndex'])->name('stores.index');
        Route::post('/stores', [AdminController::class, 'storeStore'])->name('stores.store');
        Route::patch('/stores/{store}', [AdminController::class, 'updateStore'])->name('stores.update');
        Route::delete('/stores/{store}', [AdminController::class, 'destroyStore'])->name('stores.destroy');

        Route::get('/stores/{store}/rooms', [AdminController::class, 'roomsIndex'])->name('stores.rooms.index');
        Route::post('/stores/{store}/rooms', [AdminController::class, 'storeRoom'])->name('stores.rooms.store');
        Route::patch('/stores/{store}/rooms/{room}', [AdminController::class, 'updateRoom'])->name('stores.rooms.update');
        Route::delete('/stores/{store}/rooms/{room}', [AdminController::class, 'destroyRoom'])->name('stores.rooms.destroy');
        
        Route::get('/staff', [AdminController::class, 'staffIndex'])->name('staff.index');
        Route::post('/staff', [AdminController::class, 'storeStaff'])->name('staff.store');
    });
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
