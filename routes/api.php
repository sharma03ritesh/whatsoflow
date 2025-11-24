<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\LeadController as ApiLeadController;
use App\Http\Controllers\AutomationController;
use App\Http\Controllers\WhatsAppWebhookController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// WhatsApp webhook (public - no auth needed)
Route::prefix('webhooks/whatsapp')->group(function () {
    Route::post('/', [WhatsAppWebhookController::class, 'webhook']);
    Route::get('/verify', [WhatsAppWebhookController::class, 'verify']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Authentication
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // Automations API
    Route::prefix('automations')->group(function () {
        Route::get('/', [AutomationController::class, 'index']);
        Route::post('/', [AutomationController::class, 'store']);
        Route::put('/{automation}', [AutomationController::class, 'update']);
        Route::delete('/{automation}', [AutomationController::class, 'destroy']);
    });
    
    // Business group for lead-related routes
    Route::prefix('businesses/{business}')->group(function () {
        // Leads API Resource
        Route::apiResource('leads', ApiLeadController::class);
        
        // Additional lead routes
        Route::post('leads/{lead}/status', [ApiLeadController::class, 'updateStatus']);
        Route::post('leads/{lead}/message', [ApiLeadController::class, 'addNote']);
        Route::post('leads/{lead}/tags', [ApiLeadController::class, 'addTag']);
        Route::delete('leads/{lead}/tags/{tag}', [ApiLeadController::class, 'removeTag']);
        Route::get('leads/{lead}/history', [ApiLeadController::class, 'history']);

        Route::apiResource('pipeline-columns', \App\Http\Controllers\Api\PipelineColumnController::class);
    });
});

// Fallback route for undefined API endpoints
Route::fallback(function(){
    return response()->json([
        'message' => 'API endpoint not found.'
    ], 404);
});
