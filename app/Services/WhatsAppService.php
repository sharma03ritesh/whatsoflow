<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class WhatsAppService
{
    protected string $apiKey;
    protected string $baseUrl;
    protected string $phoneNumberId;

    public function __construct()
    {
        // Configure based on your WhatsApp provider
        $this->apiKey = config('services.whatsapp.api_key', '');
        $this->baseUrl = config('services.whatsapp.base_url', 'https://graph.facebook.com/v18.0');
        $this->phoneNumberId = config('services.whatsapp.phone_number_id', '');
    }

    /**
     * Send a WhatsApp message
     */
    public function sendMessage(string $to, string $message): array
    {
        try {
            // Normalize phone number
            $to = $this->normalizePhone($to);

            // Prepare message payload for Meta WhatsApp API
            $payload = [
                'messaging_product' => 'whatsapp',
                'to' => $to,
                'type' => 'text',
                'text' => [
                    'body' => $message
                ]
            ];

            // Send request to WhatsApp API
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
            ])->withoutVerifying()->post("{$this->baseUrl}/{$this->phoneNumberId}/messages", $payload);

            if ($response->successful()) {
                $data = $response->json();
                
                Log::info('WhatsApp message sent successfully', [
                    'to' => $to,
                    'message_id' => $data['messages'][0]['id'] ?? null,
                ]);

                return [
                    'status' => 'sent',
                    'message_id' => $data['messages'][0]['id'] ?? null,
                    'timestamp' => now()->toISOString(),
                ];
            } else {
                $error = $response->json();
                
                Log::error('WhatsApp message failed', [
                    'to' => $to,
                    'error' => $error,
                    'status' => $response->status(),
                ]);

                throw new \Exception("WhatsApp API error: " . ($error['error']['message'] ?? 'Unknown error'));
            }

        } catch (\Exception $e) {
            Log::error('WhatsApp service error', [
                'to' => $to,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Send template message
     */
    public function sendTemplate(string $to, string $templateName, array $components = []): array
    {
        try {
            $to = $this->normalizePhone($to);

            $payload = [
                'messaging_product' => 'whatsapp',
                'to' => $to,
                'type' => 'template',
                'template' => [
                    'name' => $templateName,
                    'language' => [
                        'code' => 'en_US'
                    ]
                ]
            ];

            if (!empty($components)) {
                $payload['template']['components'] = $components;
            }

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
            ])->withoutVerifying()->post("{$this->baseUrl}/{$this->phoneNumberId}/messages", $payload);

            if ($response->successful()) {
                $data = $response->json();
                
                return [
                    'status' => 'sent',
                    'message_id' => $data['messages'][0]['id'] ?? null,
                    'timestamp' => now()->toISOString(),
                ];
            } else {
                throw new \Exception("Template message failed: " . $response->body());
            }

        } catch (\Exception $e) {
            Log::error('WhatsApp template error', [
                'to' => $to,
                'template' => $templateName,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Mark message as read
     */
    public function markAsRead(string $messageId): bool
    {
        try {
            $payload = [
                'messaging_product' => 'whatsapp',
                'status' => 'read',
                'message_id' => $messageId,
            ];

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
            ])->withoutVerifying()->post("{$this->baseUrl}/{$this->phoneNumberId}/messages", $payload);

            return $response->successful();

        } catch (\Exception $e) {
            Log::error('WhatsApp mark as read error', [
                'message_id' => $messageId,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Normalize phone number for WhatsApp
     */
    protected function normalizePhone(string $phone): string
    {
        // Remove any non-digit characters
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // Remove leading zeros
        $phone = ltrim($phone, '0');

        // Add country code if not present (assuming international format)
        if (!str_starts_with($phone, '1') && strlen($phone) === 10) {
            $phone = '1' . $phone;
        }

        return $phone;
    }

    /**
     * Validate webhook signature (for Meta WhatsApp)
     */
    public function validateWebhook(string $signature, string $payload): bool
    {
        $appSecret = config('services.whatsapp.app_secret');
        
        if (!$appSecret) {
            return false;
        }

        $expectedSignature = hash_hmac('sha256', $payload, $appSecret);

        return hash_equals($signature, $expectedSignature);
    }
}
