<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\Business;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr;

class LeadController extends Controller
{
    /**
     * Display a listing of leads with filters
     */
    public function index(Request $request, Business $business)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:leads,phone',
            'stage' => 'required|numeric|in:1,2,3,4,5',
            'business_id' => 'required|exists:businesses,id',
            'notes' => 'nullable|string|max:65535',
            'tags' => 'array',
            'tags.*' => 'string|max:50',
        ]);

        $query = $business->leads()
            ->with(['latestMessage'])
            ->when($request->stage, fn($q, $stage) => $q->where('stage', $stage))
            ->when($request->search, function($q, $search) {
                $q->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->tags, function($q, $tags) {
                foreach ($tags as $tag) {
                    $q->whereJsonContains('tags', $tag);
                }
            })
            ->orderBy('updated_at', 'desc');

        return response()->json([
            'data' => $query->paginate($request->per_page ?? 15)
        ]);
    }

    /**
     * Store a newly created lead
     */
    public function store(Request $request, Business $business)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'required|string|max:20',
            'stage' => 'required|in:1,2,3,4,5',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'notes' => 'nullable|string',
        ]);

        // Start a database transaction
        $lead = DB::transaction(function () use ($business, $validated) {
            // Create the lead first
            $lead = $business->leads()->create(Arr::except($validated, ['tags']));

            // Add tags if they exist
            if (!empty($validated['tags'])) {
                $lead->tags()->createMany(
                    array_map(fn($tagName) => ['name' => $tagName], $validated['tags'])
                );
            }

            return $lead->load('tags', 'latestMessage');
        });

        return response()->json([
            'message' => 'Lead created successfully',
            'data' => $lead
        ], 201);
    }

    /**
     * Display the specified lead
     */
    public function show(Business $business, Lead $lead)
    {
        $this->authorize('view', [$lead, $business]);
        
        return response()->json([
            'data' => $lead->load(['messages', 'history'])
        ]);
    }

    /**
     * Update the specified lead
     */
    public function update(Request $request, Business $business, Lead $lead)
    {
        $this->authorize('update', [$lead, $business]);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'sometimes|required|string|max:20',
            'stage' => 'sometimes|required|in:1,2,3,4,5',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'notes' => 'nullable|string',
        ]);

        $lead->update($validated);

        // Log status change if status was updated
        if ($request->has('stage') && $lead->wasChanged('stage')) {
            $lead->history()->create([
                'event_type' => 'stage_changed',
                'title' => "Stage changed to {$lead->stage}",
                'metadata' => [
                    'old_stage' => $lead->getOriginal('stage'),
                    'new_status' => $lead->status,
                ],
                'created_by' => Auth::id(),
            ]);
        }

        return response()->json([
            'message' => 'Lead updated successfully',
            'data' => $lead->fresh()
        ]);
    }

    /**
     * Remove the specified lead
     */
    public function destroy(Business $business, Lead $lead)
    {
        $this->authorize('delete', [$lead, $business]);
        
        $lead->delete();

        return response()->json([
            'message' => 'Lead deleted successfully'
        ]);
    }

    /**
     * Add a note to the lead
     */
    public function addNote(Request $request, Business $business, Lead $lead)
    {
        $this->authorize('update', [$lead, $business]);

        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $note = $lead->addNote($validated['content'], $request->user());

        return response()->json([
            'message' => 'Note added successfully',
            'data' => $note
        ], 201);
    }

    /**
     * Update lead status
     */
    public function updateStatus(Request $request, Business $business, Lead $lead)
    {
        $this->authorize('update', [$lead, $business]);

        $validated = $request->validate([
            'stage' => 'required|in:1,2,3,4,5',
            'note' => 'nullable|string',
        ]);

        $lead->updateStatus($validated['stage'], $request->user(), $validated['note'] ?? null);

        return response()->json([
            'message' => 'Lead status updated successfully',
            'data' => $lead->fresh()
        ]);
    }

    /**
     * Add a tag to the lead
     */
    public function addTag(Request $request, Business $business, Lead $lead)
    {
        $this->authorize('update', [$lead, $business]);

        $validated = $request->validate([
            'tag' => 'required|string|max:50',
        ]);

        $lead->addTag($validated['tag'], $request->user());

        return response()->json([
            'message' => 'Tag added successfully',
            'data' => $lead->fresh()
        ]);
    }

    /**
     * Remove a tag from the lead
     */
    public function removeTag(Request $request, Business $business, Lead $lead, string $tag)
    {
        $this->authorize('update', [$lead, $business]);

        $lead->removeTag($tag, $request->user());

        return response()->json([
            'message' => 'Tag removed successfully',
            'data' => $lead->fresh()
        ]);
    }

    /**
     * Get lead history
     */
    public function history(Business $business, Lead $lead)
    {
        $this->authorize('view', [$lead, $business]);

        return response()->json([
            'data' => $lead->history()->with('creator')->latest()->get()
        ]);
    }
}
