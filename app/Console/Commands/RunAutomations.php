<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\AutomationService;
use App\Models\AutomationJob;
use Illuminate\Support\Facades\Log;

class RunAutomations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'automation:run';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run pending automation jobs';

    /**
     * The automation service instance.
     *
     * @var AutomationService
     */
    protected $automationService;

    /**
     * Create a new command instance.
     *
     * @param AutomationService $automationService
     */
    public function __construct(AutomationService $automationService)
    {
        parent::__construct();
        $this->automationService = $automationService;
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(): int
    {
        $this->info('Starting automation job execution...');

        try {
            $pendingJobs = $this->automationService->getPendingJobs();
            
            if ($pendingJobs->isEmpty()) {
                $this->info('No pending automation jobs found.');
                return Command::SUCCESS;
            }

            $this->info("Found {$pendingJobs->count()} pending jobs.");

            $successCount = 0;
            $failureCount = 0;

            foreach ($pendingJobs as $job) {
                $this->line("Processing job #{$job->id} for lead #{$job->lead_id}...");
                
                try {
                    $result = $this->automationService->executeJob($job);
                    
                    if ($result) {
                        $successCount++;
                        $this->info("✓ Job #{$job->id} completed successfully.");
                    } else {
                        $failureCount++;
                        $this->error("✗ Job #{$job->id} failed.");
                    }
                } catch (\Exception $e) {
                    $failureCount++;
                    $this->error("✗ Job #{$job->id} failed: {$e->getMessage()}");
                    
                    // Log the error but continue processing
                    Log::error('Automation job execution failed', [
                        'job_id' => $job->id,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                }
            }

            $this->info("Automation execution completed.");
            $this->info("Success: {$successCount}, Failures: {$failureCount}");

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error("Automation execution failed: {$e->getMessage()}");
            
            Log::error('Automation command failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return Command::FAILURE;
        }
    }
}
