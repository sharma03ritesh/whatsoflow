<?php

namespace Database\Seeders;

use App\Models\Lead;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;

class LeadsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first();
        
        if (!$user) {
            $this->command->error('No user found. Please run UserSeeder first.');
            return;
        }

        // Create tags
        $tags = [
            'hot-lead' => Tag::firstOrCreate(['name' => 'hot-lead', 'user_id' => $user->id]),
            'premium' => Tag::firstOrCreate(['name' => 'premium', 'user_id' => $user->id]),
            'follow-up' => Tag::firstOrCreate(['name' => 'follow-up', 'user_id' => $user->id]),
            'enterprise' => Tag::firstOrCreate(['name' => 'enterprise', 'user_id' => $user->id]),
            'won' => Tag::firstOrCreate(['name' => 'won', 'user_id' => $user->id]),
            'meeting' => Tag::firstOrCreate(['name' => 'meeting', 'user_id' => $user->id]),
            'qualified' => Tag::firstOrCreate(['name' => 'qualified', 'user_id' => $user->id]),
            'case-study' => Tag::firstOrCreate(['name' => 'case-study', 'user_id' => $user->id]),
            'budget' => Tag::firstOrCreate(['name' => 'budget', 'user_id' => $user->id]),
            'lost' => Tag::firstOrCreate(['name' => 'lost', 'user_id' => $user->id]),
        ];

        // Create leads
        $leads = [
            [
                'name' => 'John Smith',
                'email' => 'john.smith@example.com',
                'phone' => '+1 (555) 123-4567',
                'status' => 'new',
                'last_message' => 'Interested in your premium package. Can we schedule a demo?',
                'last_message_time' => now()->subHours(2),
                'tags' => ['hot-lead', 'premium'],
            ],
            [
                'name' => 'Sarah Johnson',
                'email' => 'sarah.j@company.com',
                'phone' => '+1 (555) 987-6543',
                'status' => 'contacted',
                'last_message' => 'Thanks for the follow-up. I need more information about pricing.',
                'last_message_time' => now()->subHours(5),
                'tags' => ['follow-up'],
            ],
            [
                'name' => 'Michael Chen',
                'email' => 'm.chen@techcorp.io',
                'phone' => '+1 (555) 234-5678',
                'status' => 'qualified',
                'last_message' => 'Ready to move forward with the enterprise plan.',
                'last_message_time' => now()->subHour(),
                'tags' => ['hot-lead', 'enterprise'],
            ],
            [
                'name' => 'Emily Davis',
                'email' => 'emily.davis@startup.co',
                'phone' => '+1 (555) 345-6789',
                'status' => 'won',
                'last_message' => 'Contract signed! Looking forward to getting started.',
                'last_message_time' => now()->subDays(3),
                'tags' => ['won'],
            ],
            [
                'name' => 'Robert Wilson',
                'email' => 'r.wilson@consulting.com',
                'phone' => '+1 (555) 456-7890',
                'status' => 'contacted',
                'last_message' => 'Need to postpone our meeting to next week.',
                'last_message_time' => now()->subDays(2),
                'tags' => ['follow-up', 'meeting'],
            ],
            [
                'name' => 'Lisa Anderson',
                'email' => 'lisa.a@marketing.net',
                'phone' => '+1 (555) 567-8901',
                'status' => 'qualified',
                'last_message' => 'Can you send me the case studies we discussed?',
                'last_message_time' => now()->subHours(4),
                'tags' => ['qualified', 'case-study'],
            ],
            [
                'name' => 'David Martinez',
                'email' => 'david.m@corp.com',
                'phone' => '+1 (555) 678-9012',
                'status' => 'contacted',
                'last_message' => 'Great presentation! Let\'s discuss next steps.',
                'last_message_time' => now()->subHours(6),
                'tags' => ['meeting', 'qualified'],
            ],
            [
                'name' => 'Jennifer Taylor',
                'phone' => '+1 (555) 789-0123',
                'status' => 'lost',
                'last_message' => 'Budget constraints this quarter',
                'last_message_time' => now()->subWeek(),
                'tags' => ['budget', 'lost'],
            ],
        ];

        foreach ($leads as $leadData) {
            $lead = Lead::create([
                'name' => $leadData['name'],
                'email' => $leadData['email'] ?? null,
                'phone' => $leadData['phone'],
                'status' => $leadData['status'],
                'last_message' => $leadData['last_message'],
                'last_message_time' => $leadData['last_message_time'],
                'user_id' => $user->id,
            ]);

            // Attach tags
            if (!empty($leadData['tags'])) {
                $tagIds = [];
                foreach ($leadData['tags'] as $tagName) {
                    if (isset($tags[$tagName])) {
                        $tagIds[] = $tags[$tagName]->id;
                    }
                }
                $lead->tags()->attach($tagIds);
            }
        }

        $this->command->info('Leads seeded successfully!');
    }
}
