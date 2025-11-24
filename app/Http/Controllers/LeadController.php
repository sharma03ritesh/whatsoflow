<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Business;
use App\Models\Tag;
use App\Models\Message;
use App\Models\PipelineColumn;
use App\Services\AutomationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LeadController extends Controller
{
    protected AutomationService $automationService;

    public function __construct(AutomationService $automationService)
    {
        $this->automationService = $automationService;
    }
    /**
     * Display a listing of the leads.
     */
    public function index()
    {
        return Inertia::render('Leads/Leads');
    }

    /**
     * Get all leads for the current user as JSON.
     */
    public function apiIndex(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            $user = \App\Models\User::first();
            if (!$user) {
                return response()->json([
                    'columns' => [],
                    'allTags' => [],
                ]);
            }
        }
        
        // Get all pipeline columns for this business
        $columns = PipelineColumn::where('business_id', $user->id)
            ->orderBy('order')
            ->withCount('leads')
            ->get()
            ->map(function ($column) {
                return [
                    'id' => (string)$column->id,
                    'name' => $column->name,
                    'title' => $column->name, // Keep for backward compatibility
                    'color' => $column->color,
                    'bg_color' => $column->bg_color,
                    'text_color' => $column->text_color,
                    'order' => $column->order,
                    'is_active' => $column->is_active,
                    'leads' => [],
                    'leads_count' => $column->leads_count,
                ];
            })
            ->toArray();

        // Get all leads with their tags, business, and messages
        $leads = Lead::with(['tags', 'business', 'latestMessage' => function($query) use ($user) {
            $query->where('business_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->first();
        }])->get();

        $allTags = Tag::pluck('name')->unique()->values()->toArray();
        
        // Create a map of column IDs to their index in the columns array
        $columnMap = [];
        foreach ($columns as $index => $column) {
            $columnMap[$column['id']] = $index;
        }

        // Group leads by their pipeline column
        foreach ($leads as $lead) {
            $lastMessage = $lead->latestMessage;

            $leadData = [
                'id' => $lead->id,
                'name' => $lead->name,
                'phone' => $lead->phone,
                'stage' => $lead->stage,
                'pipeline_column_id' => $lead->pipeline_column_id,
                'notes' => $lead->notes,
                'businessId' => $lead->business_id,
                'tags' => $lead->tags->map(function($tag) {
                    return [
                        'id' => $tag->id,
                        'name' => $tag->name
                    ];
                })->toArray(),
                'lastMessageTime' => $lastMessage ? $lastMessage->created_at->diffForHumans() : null,
                'lastMessage' => $lastMessage ? $lastMessage->content : null,
                'created_at' => $lead->created_at,
                'updated_at' => $lead->updated_at,
            ];

            // Use the pipeline_column_id from the lead if it exists, otherwise use the stage
            $columnId = (string)($lead->pipeline_column_id ?? $lead->stage);
            
            // Find the column index
            if (isset($columnMap[$columnId])) {
                $columns[$columnMap[$columnId]]['leads'][] = $leadData;
            }
        }

        // Sort leads within each column by updated_at (newest first)
        foreach ($columns as &$column) {
            usort($column['leads'], function($a, $b) {
                return strtotime($b['updated_at']) - strtotime($a['updated_at']);
            });
        }
        unset($column); // Break the reference

        return response()->json([
            'columns' => $columns,
            'allTags' => $allTags,
        ]);
    }

    /**
     * Store a newly created lead.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'nullable|email|max:255',
                'phone' => 'required|string|max:20',
                'stage' => 'required|numeric',
                'notes' => 'nullable|string',
                'tags' => 'nullable|array',
                'tags.*' => 'string|max:50',
            ]);

            DB::beginTransaction();

            // Create the lead
            $lead = Lead::create([
                'name' => $validated['name'],
                'email' => $validated['email'] ?? null,
                'phone' => $validated['phone'],
                'stage' => $validated['stage'],
                'business_id' => auth()->user()->id,
                'notes' => $validated['notes'] ?? null,
            ]);

            // Add tags if they exist
            if (!empty($validated['tags'])) {
                foreach ($validated['tags'] as $tagName) {
                    $lead->tags()->create([
                        'name' => trim($tagName)
                    ]);
                }
            }

            DB::commit();

            // Reload lead with relationships
            $lead->load('tags');

            // Trigger automation for new lead
            $this->automationService->createJobsForLead($lead, 'new_lead');

            return response()->json([
                'message' => 'Lead created successfully',
                'data' => $lead
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create lead: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified lead.
     */
    public function update(Request $request, Lead $lead): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            // Validate request
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'phone' => 'required|string|max:20|unique:leads,phone,' . $lead->id,
                'stage' => 'required|numeric',
                'notes' => 'nullable|string|max:65535',
                'tags' => 'array',
                'tags.*' => 'string|max:50',
            ]);

            // Ensure user owns this lead
            if ($lead->business_id !== $user->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            DB::beginTransaction();

            // Store old stage for automation trigger
            $oldStage = $lead->stage;

            // Update lead
            $lead->update([
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'stage' => $validated['stage'],
                'notes' => $validated['notes'] ?? null,
            ]);

            // Handle Tags (hasMany)
            // First delete old tags
            $lead->tags()->delete();

            // Add new tags
            if (!empty($validated['tags'])) {
                foreach ($validated['tags'] as $tagName) {
                    $lead->tags()->create([
                        'name' => trim($tagName),
                    ]);
                }
            }

            DB::commit();

            $lead->load('tags');

            // Trigger automation for stage change if stage was updated
            if ($oldStage !== $lead->stage) {
                $this->automationService->createJobsForLead($lead, 'stage_change', $lead->stage);
            }

            return response()->json([
                'success' => true,
                'lead' => [
                    'id' => $lead->id,
                    'name' => $lead->name,
                    'phone' => $lead->phone,
                    'notes' => $lead->notes,
                    'stage' => $lead->stage,
                    'tags' => $lead->tags->pluck('name'),
                ],
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update lead',
                'error' => $e->getMessage(),
            ], 500);
        }
    }



    /**
     * Remove the specified lead.
     */
    public function destroy(Request $request, Lead $lead): JsonResponse
    {
        try {
            // Ensure user can only delete their own leads
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
            if ($lead->business_id !== $user->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
            $lead->tags()->delete();
            $lead->delete();

            return response()->json(['success' => true]);
        } catch (\Exception $th) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete lead: ' . $th->getMessage(),
                'error' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * Update lead status (for drag and drop).
     */
    public function updateStatus(Request $request, Lead $lead): JsonResponse
    {
        try {
            // Ensure user can only update their own leads
            $user = $request->user();
            if (!$user) {
                $user = \App\Models\User::first();
            }
            if ($lead->business_id !== $user->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $validated = $request->validate([
                'stage' => 'required|numeric|in:1,2,3,4,5',
            ]);
            DB::beginTransaction();
            $lead->update(['stage' => $validated['stage']]);
            DB::commit();
            return response()->json([
                'success' => true, 
                'lead' => [
                    'id' => $lead->id,
                    'name' => $lead->name,
                    'phone' => $lead->phone,
                    'notes' => $lead->notes,
                    'stage' => $lead->stage,
                    'tags' => $lead->tags->pluck('name'),
                ],
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $th) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update lead status: ' . $th->getMessage(),
                'error' => $th->getMessage(),
            ], 500);
        }
    }

}
