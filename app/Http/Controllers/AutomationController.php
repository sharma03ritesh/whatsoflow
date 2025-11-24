<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Automation;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AutomationController extends Controller
{
    public function index()
    {
        $automations = Automation::where('business_id', Auth::user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'automations' => $automations
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'trigger_type' => 'required|string|in:new_lead,stage_change,keyword,timed',
            'trigger_value' => 'nullable',
            'action_type' => 'required|string|in:send_message,update_stage,add_tag',
            'action_config' => 'required|array',
            'delay_seconds' => 'required|integer|min:0',
            'is_active' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->all();
            $data['business_id'] = Auth::user()->id;
            
            $automation = Automation::create($data);

            return response()->json([
                'message' => 'Automation created successfully',
                'automation' => $automation
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create automation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $automation = Automation::where('id', $id)
            ->where('business_id', Auth::user()->id)
            ->firstOrFail();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'trigger_type' => 'required|string|in:new_lead,stage_change,keyword,timed',
            'trigger_value' => 'nullable',
            'action_type' => 'required|string|in:send_message,update_stage,add_tag',
            'action_config' => 'required|array',
            'delay_seconds' => 'required|integer|min:0',
            'is_active' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $automation->update($request->all());

            return response()->json([
                'message' => 'Automation updated successfully',
                'automation' => $automation
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update automation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $automation = Automation::where('id', $id)
            ->where('business_id', Auth::user()->id)
            ->firstOrFail();

        try {
            $automation->delete();

            return response()->json([
                'message' => 'Automation deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete automation',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
