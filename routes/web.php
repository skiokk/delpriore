<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ExpiredInvoicesController;
use App\Http\Controllers\EmailSettingController;
use App\Http\Controllers\ReminderDashboardController;
use App\Http\Controllers\EmailLogController;


// Auth Routes
Route::middleware('guest')->group(function () {
    Route::get('login', [AuthController::class, 'showLoginForm'])->name('login');
    Route::post('login', [AuthController::class, 'login']);
});

Route::middleware('auth')->group(function () {
    // Dashboard
    Route::get('/dashboard', function () {
        return view('dashboard.index');
    })->name('dashboard');

    // Profile
    Route::get('/profile', function () {
        return view('profile.index');
    })->name('profile');

    // Clients Routes
    Route::get('/clients', [ClientController::class, 'index'])->name('clients.index');
    Route::get('/clients/data', [ClientController::class, 'getData'])->name('clients.data');
    Route::get('/clients/create', [ClientController::class, 'create'])->name('clients.create');
    Route::post('/clients', [ClientController::class, 'store'])->name('clients.store');
    Route::get('/clients/{client}/edit', [ClientController::class, 'edit'])->name('clients.edit');
    Route::put('/clients/{client}', [ClientController::class, 'update'])->name('clients.update');
    Route::delete('/clients/{client}', [ClientController::class, 'destroy'])->name('clients.destroy');

    // Fatture Scadute
    Route::get('/expired-invoices', [ExpiredInvoicesController::class, 'index'])->name('expired-invoices.index');
    Route::get('/expired-invoices/data', [ExpiredInvoicesController::class, 'getData'])->name('expired-invoices.data');
    Route::post('/expired-invoices/import', [ExpiredInvoicesController::class, 'import'])->name('expired-invoices.import');
    // Email Settings
    Route::get('/settings/email', [EmailSettingController::class, 'edit'])->name('settings.email.edit');
    Route::put('/settings/email', [EmailSettingController::class, 'update'])->name('settings.email.update');
    Route::post('/settings/email/test', [EmailSettingController::class, 'testEmail'])->name('settings.email.test');

    Route::get('/dashboard/reminders', [ReminderDashboardController::class, 'index'])->name('dashboard.reminders');
    Route::get('/dashboard/reminders/details', [ReminderDashboardController::class, 'getDetails'])->name('dashboard.reminders.details');
    Route::get('/email-logs/{id}/content', [EmailLogController::class, 'getContent'])
        ->name('email-logs.content');

    Route::post('logout', [AuthController::class, 'logout'])->name('logout');
});
