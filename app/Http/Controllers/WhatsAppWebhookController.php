<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Message;
use App\Services\AutomationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class WhatsAppWebhookController extends Controller
{
    protected AutomationService $automationService;

    public function __construct(AutomationService $automationService)
    {
        $this->automationService = $automationService;
    }

    /**
     * Handle incoming WhatsApp webhook
     */
    public function webhook(Request $request): JsonResponse
    {
        try {
            // Log incoming webhook for debugging
            Log::info('WhatsApp webhook received', $request->all());

            // Extract message data (adjust based on your WhatsApp provider format)
            $messageData = $this->extractMessageData($request);

            if (!$messageData) {
                return response()->json(['status' => 'no_message']);
            }

            // Find or create lead
            $lead = $this->findOrCreateLead($messageData);

            // Store the message
            $this->storeMessage($lead, $messageData);

            // Trigger keyword automations
            $this->triggerKeywordAutomations($lead, $messageData['message']);

            return response()->json(['status' => 'processed']);

        } catch (\Exception $e) {
            Log::error('WhatsApp webhook error', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Extract message data from webhook request
     */
    protected function extractMessageData(Request $request): ?array
    {
        // This is a placeholder implementation
        // Adjust based on your WhatsApp provider (Twilio, Meta, etc.)
        
        $data = $request->all();

        // Example for Twilio format
        if (isset($data['From']) && isset($data['Body'])) {
            return [
                'phone' => $data['From'],
                'message' => $data['Body'],
                'timestamp' => now(),
                'message_id' => $data['MessageSid'] ?? null,
            ];
        }

        // Example for Meta WhatsApp format
        if (isset($data['entry'][0]['changes'][0]['value']['messages'][0])) {
            $message = $data['entry'][0]['changes'][0]['value']['messages'][0];
            $contact = $data['entry'][0]['changes'][0]['value']['contacts'][0] ?? null;

            return [
                'phone' => $message['from'] ?? ($contact['wa_id'] ?? null),
                'message' => $message['text']['body'] ?? '',
                'timestamp' => now(),
                'message_id' => $message['id'] ?? null,
                'contact_name' => $contact['profile']['name'] ?? null,
            ];
        }

        return null;
    }

    /**
     * Find existing lead or create new one
     */
    protected function findOrCreateLead(array $messageData): Lead
    {
        $phone = $this->normalizePhone($messageData['phone']);

        $lead = Lead::where('phone', $phone)->first();

        if (!$lead) {
            $lead = Lead::create([
                'name' => $messageData['contact_name'] ?? 'Unknown Contact',
                'phone' => $phone,
                'stage' => 1, // Default first stage
                'business_id' => 1, // Adjust based on your business logic
                'notes' => 'Created from WhatsApp message',
            ]);

            // Trigger new lead automation
            $this->automationService->createJobsForLead($lead, 'new_lead');
        }

        return $lead;
    }

    /**
     * Store incoming message
     */
    protected function storeMessage(Lead $lead, array $messageData): void
    {
        Message::create([
            'lead_id' => $lead->id,
            'content' => $messageData['message'],
            'type' => 'received',
            'message_id' => $messageData['message_id'],
            'timestamp' => $messageData['timestamp'],
        ]);

        // Update lead's last message
        $lead->update(['last_message' => $messageData['message']]);
    }

    /**
     * Trigger keyword-based automations
     */
    protected function triggerKeywordAutomations(Lead $lead, string $message): void
    {
        // Get all keyword automations for this business
        $automations = \App\Models\Automation::active()
            ->where('business_id', $lead->business_id)
            ->where('trigger_type', 'keyword')
            ->get();

        foreach ($automations as $automation) {
            $keyword = is_array($automation->trigger_value) 
                ? ($automation->trigger_value['keyword'] ?? '') 
                : $automation->trigger_value;

            if (!empty($keyword) && str_contains(strtolower($message), strtolower($keyword))) {
                $this->automationService->createJobsForLead($lead, 'keyword', $keyword);
            }
        }
    }

    /**
     * Normalize phone number format
     */
    protected function normalizePhone(string $phone): string
    {
        // Remove any non-digit characters except +
        $phone = preg_replace('/[^0-9+]/', '', $phone);

        // Remove leading + if present (normalize to international format without +)
        if (str_starts_with($phone, '+')) {
            $phone = substr($phone, 1);
        }

        return $phone;
    }

    /**
     * Verify webhook (for Meta WhatsApp)
     */
    public function verify(Request $request): JsonResponse
    {
        $mode = $request->input('hub_mode');
        $token = $request->input('hub_verify_token');
        $challenge = $request->input('hub_challenge');

        if ($mode === 'subscribe' && $token === config('services.whatsapp.verify_token')) {
            return response()->json($challenge);
        }

        return response()->json(['error' => 'Invalid verification'], 403);
    }
}
