<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PipelineColumn;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PipelineColumnController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $businessId = auth()->user()->id;
        $columns = PipelineColumn::with("leads")->where('business_id', $businessId)
            ->orderBy('order')
            ->get();

        return response()->json($columns);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $businessId = auth()->user()->id;
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'required|string|max:50',
            'bg_color' => 'required|string|max:100',
            'text_color' => 'required|string|max:100',
            'order' => 'integer',
        ]);

        // Get the highest order value and add 1 for the new column
        $maxOrder = PipelineColumn::where('business_id', $businessId)->max('order') ?? 0;
        
        $column = PipelineColumn::create([
            'business_id' => $businessId,
            'name' => $validated['name'],
            'color' => $validated['color'],
            'bg_color' => $validated['bg_color'],
            'text_color' => $validated['text_color'],
            'order' => $validated['order'] ?? ($maxOrder + 1),
            'is_active' => true,
        ]);

        return response()->json($column, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $businessId = auth()->user()->id;
        $column = PipelineColumn::where('business_id', $businessId)->findOrFail($id);
        return response()->json($column);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $businessId = auth()->user()->id;
        $column = PipelineColumn::where('business_id', $businessId)->findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'color' => 'sometimes|string|max:50',
            'bg_color' => 'sometimes|string|max:100',
            'text_color' => 'sometimes|string|max:100',
            'order' => 'sometimes|integer',
            'is_active' => 'sometimes|boolean',
        ]);

        $column->update($validated);
        
        return response()->json($column);
    }

    /**
     * Reorder the pipeline columns.
     */
    public function reorder(Request $request)
    {
        $businessId = auth()->user()->id;
        $orderedIds = $request->input('ordered_ids');
        
        if (!is_array($orderedIds)) {
            return response()->json(['message' => 'Invalid ordered_ids parameter'], 400);
        }
        
        // Update the order of each column
        foreach ($orderedIds as $index => $id) {
            PipelineColumn::where('id', $id)
                ->where('business_id', $businessId)
                ->update(['order' => $index + 1]);
        }
        
        return response()->json(['message' => 'Columns reordered successfully']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $businessId = auth()->user()->id;
        $column = PipelineColumn::where('business_id', $businessId)
            ->with(['leads.tags']) // Eager load leads and their tags
            ->findOrFail($id);
        
        // Delete all tags associated with leads in this column
        $column->leads->each(function ($lead) {
            $lead->tags()->delete();
        });
        
        // Delete all leads in this column
        $column->leads()->delete();
        
        // Delete the column
        $column->delete();
        
        return response()->json(null, 204);
    }
}
