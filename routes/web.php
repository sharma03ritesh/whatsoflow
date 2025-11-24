<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\AutomationController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PipelineColumnController;
use Inertia\Inertia;

Route::get('/', function () {
    if(Auth::check()) {
        return redirect()->route('dashboard');
    }
    return Inertia::render('welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard/Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Dashboard API endpoint
    Route::get('/data/dashboard', [DashboardController::class, 'index'])->name('dashboard.api');
    
    // Additional routes
    Route::get('/leads', function () {
        return Inertia::render('Leads/Leads');
    })->name('leads');

    // Lead data endpoint
    Route::get('/data/leads', [LeadController::class, 'apiIndex'])->name('leads.api.index');
    Route::post('/data/leads', [LeadController::class, 'store'])->name('leads.api.store');
    Route::put('/data/leads/{lead}', [LeadController::class, 'update'])->name('leads.api.update');
    Route::delete('/data/leads/{lead}', [LeadController::class, 'destroy'])->name('leads.api.destroy');
    Route::patch('/data/leads/{lead}/status', [LeadController::class, 'updateStatus'])->name('leads.api.updateStatus');
    Route::get('/data/businesses', function () {
        return response()->json([
            'businesses' => \App\Models\Business::select('id', 'business_name as name')->orderBy('business_name')->get()
        ]);
    });
    
    Route::get('/automations', function () {
        return Inertia::render('Automations/Automations');
    })->name('automations');
    
    Route::get('/data/automations', [AutomationController::class, 'index'])->name('automations.api.index');
    Route::post('/data/automations', [AutomationController::class, 'store'])->name('automations.api.store');
    Route::put('/data/automations/{automation}', [AutomationController::class, 'update'])->name('automations.api.update');
    Route::patch('/data/automations/{automation}/status', [AutomationController::class, 'updateStatus'])->name('automations.api.updateStatus');
    Route::delete('/data/automations/{automation}', [AutomationController::class, 'destroy'])->name('automations.api.destroy');
    
    Route::get('/broadcast', function () {
        return Inertia::render('Broadcast/Broadcast');
    })->name('broadcast');
    
    Route::get('/billing', function () {
        return Inertia::render('Billing/Billing');
    })->name('billing');
    
    Route::get('/settings', function () {
        return Inertia::render('Settings/Settings');
    })->name('settings');

    Route::apiResource('data/pipeline-columns', PipelineColumnController::class);
    Route::post('data/pipeline-columns/reorder', [PipelineColumnController::class, 'reorder']);
    Route::put('data/pipeline-columns/{id}', [PipelineColumnController::class, 'update']);
    Route::delete('data/pipeline-columns/{id}', [PipelineColumnController::class, 'destroy']);
    

});

require __DIR__.'/auth.php';
