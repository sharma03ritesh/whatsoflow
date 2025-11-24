<?php

namespace App\Services;

use App\Models\Automation;
use App\Models\AutomationJob;
use App\Models\AutomationLog;
use App\Models\Lead;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AutomationService
{
    protected WhatsAppService $whatsAppService;

    public function __construct(WhatsAppService $whatsAppService)
    {
        $this->whatsAppService = $whatsAppService;
    }

    /**
     * Create automation jobs for a lead based on trigger type
     */
    public function createJobsForLead(Lead $lead, string $triggerType, $triggerValue = null): void
    {
        $automations = Automation::active()
            ->forTrigger($triggerType, $triggerValue)
            ->where('business_id', $lead->business_id)
            ->get();

        foreach ($automations as $automation) {
            // Check if trigger conditions match
            if (!$this->matchesTriggerConditions($automation, $lead, $triggerValue)) {
                continue;
            }

            // Calculate execution time
            $executeAt = now()->addSeconds($automation->delay_seconds);

            // Create the automation job
            AutomationJob::create([
                'automation_id' => $automation->id,
                'lead_id' => $lead->id,
                'execute_at' => $executeAt,
                'status' => 'pending',
            ]);
        }
    }

    /**
     * Execute an automation job
     */
    public function executeJob(AutomationJob $job): bool
    {
        try {
            $job->markAsRunning();

            $automation = $job->automation;
            $lead = $job->lead;

            // Execute the action
            $result = $this->executeAction($automation, $lead);

            // Log success
            AutomationLog::logSuccess(
                $automation->id,
                $lead->id,
                $automation->action_type,
                $automation->action_config,
                ['result' => $result]
            );

            $job->markAsDone(['result' => $result]);
            return true;

        } catch (\Exception $e) {
            // Log failure
            AutomationLog::logFailure(
                $job->automation_id,
                $job->lead_id,
                $job->automation->action_type,
                $job->automation->action_config,
                $e->getMessage()
            );

            $job->markAsFailed($e->getMessage());
            
            Log::error('Automation job failed', [
                'job_id' => $job->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return false;
        }
    }

    /**
     * Execute the specific action for an automation
     */
    protected function executeAction(Automation $automation, Lead $lead): mixed
    {
        return match($automation->action_type) {
            'send_message' => $this->sendMessage($lead, $automation->action_config),
            'update_stage' => $this->updateStage($lead, $automation->action_config),
            'add_tag' => $this->addTag($lead, $automation->action_config),
            default => throw new \Exception("Unknown action type: {$automation->action_type}"),
        };
    }

    /**
     * Send message action
     */
    protected function sendMessage(Lead $lead, $messageData): array
    {
        $message = is_array($messageData) ? ($messageData['message'] ?? '') : $messageData;
        
        if (empty($message)) {
            throw new \Exception('Message content is required');
        }

        // Use WhatsApp service to send message
        $result = $this->whatsAppService->sendMessage($lead->phone, $message);

        return [
            'action' => 'send_message',
            'message' => $message,
            'recipient' => $lead->phone,
            'result' => $result,
        ];
    }

    /**
     * Update stage action
     */
    protected function updateStage(Lead $lead, $stageData): array
    {
        $newStage = is_array($stageData) ? ($stageData['stage'] ?? '') : $stageData;
        
        if (empty($newStage)) {
            throw new \Exception('Stage is required');
        }

        $oldStage = $lead->status;
        $lead->update(['status' => $newStage]);

        return [
            'action' => 'update_stage',
            'old_stage' => $oldStage,
            'new_stage' => $newStage,
            'lead_id' => $lead->id,
        ];
    }

    /**
     * Add tag action
     */
    protected function addTag(Lead $lead, $tagData): array
    {
        $tag = is_array($tagData) ? ($tagData['tag'] ?? '') : $tagData;
        
        if (empty($tag)) {
            throw new \Exception('Tag is required');
        }

        $currentTags = $lead->tags ? explode(',', $lead->tags) : [];
        
        // Add tag if it doesn't exist
        if (!in_array($tag, $currentTags)) {
            $currentTags[] = $tag;
            $lead->update(['tags' => implode(',', $currentTags)]);
        }

        return [
            'action' => 'add_tag',
            'tag' => $tag,
            'all_tags' => $currentTags,
            'lead_id' => $lead->id,
        ];
    }

    /**
     * Check if trigger conditions match
     */
    protected function matchesTriggerConditions(Automation $automation, Lead $lead, $triggerValue): bool
    {
        // For keyword triggers, check if the keyword is found in the lead's data
        if ($automation->trigger_type === 'keyword') {
            $keyword = is_array($automation->trigger_value) 
                ? ($automation->trigger_value['keyword'] ?? '') 
                : $automation->trigger_value;

            if (empty($keyword)) {
                return false;
            }

            // Search in lead's name, last message, or other relevant fields
            $searchText = strtolower($keyword);
            $leadName = strtolower($lead->name ?? '');
            $leadMessage = strtolower($lead->last_message ?? '');

            return str_contains($leadName, $searchText) || str_contains($leadMessage, $searchText);
        }

        // For stage change triggers, check if the new stage matches
        if ($automation->trigger_type === 'stage_change') {
            $targetStage = is_array($automation->trigger_value) 
                ? ($automation->trigger_value['stage'] ?? '') 
                : $automation->trigger_value;

            return $lead->status === $targetStage;
        }

        // For new_lead and timed triggers, no additional conditions needed
        return true;
    }

    /**
     * Get pending jobs ready for execution
     */
    public function getPendingJobs(): \Illuminate\Database\Eloquent\Collection
    {
        return AutomationJob::with(['automation', 'lead'])
            ->readyToExecute()
            ->orderBy('execute_at')
            ->limit(100) // Process in batches to avoid memory issues
            ->get();
    }
}
