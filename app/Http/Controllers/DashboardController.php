<?php

namespace App\Http\Controllers;

use App\Models\{Broadcast, Lead, Message, Automation, Business};
use Illuminate\Support\Facades\Auth;
use \Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Display dashboard data for the authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Mock data for demonstration - replace with actual business logic
        $dashboardData = [
            'totalLeads' => $this->getTotalLeads($user),
            'activeAutomations' => $this->getActiveAutomations($user),
            'totalBroadcasts' => $this->getTotalBroadcasts($user),
            'todayMessages' => $this->getTodayMessages($user),
            'chartData' => $this->getChartData($user),
        ];

        return response()->json($dashboardData);
    }

    /**
     * Get total leads for the user.
     *
     * @param  mixed  $user
     * @return array
     */
    private function getTotalLeads($user): array
    {
        // TODO: Implement actual leads counting logic
        // This could query a leads table or related models
        // Example: $user->leads()->count();
        // return rand(100, 500); // Mock data
        // $totalLeads = Lead::where('business_id', $business->id)->count();
        // $business = $user->businesses()->first();
        $business = $user->businesses()->first();

        // 1. Count leads THIS month
        $thisMonth = Lead::where('business_id', $business->id)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // 2. Count leads LAST month
        $lastMonth = Lead::where('business_id', $business->id)
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->count();

        // 3. Calculate percentage change
        if ($lastMonth == 0) {
            $percentageChange = $thisMonth > 0 ? 100 : 0; // avoid division by zero
        } else {
            $percentageChange = (($thisMonth - $lastMonth) / $lastMonth) * 100;
        }
        
        // 4. Add + or - sign
        $symbol = $percentageChange > 0 ? '+' : ($percentageChange < 0 ? '-' : '');

        $percentageWithSymbol = number_format(abs($percentageChange), 2);
        return [
            'totalLeads' => $thisMonth,
            'symbol' => $symbol,
            'growth' => $percentageWithSymbol
        ];
    }

    /**
     * Get active automations for the user.
     *
     * @param  mixed  $user
     * @return array
     */
    private function getActiveAutomations($user): array
    {
        // TODO: Implement actual automations counting logic
        // This could query an automations table where status = 'active'
        // Example: $user->automations()->where('status', 'active')->count();
        // return rand(5, 25); // Mock data
        // $activeAutomations = Automation::where('business_id', $business->id)
        //     ->where('is_active', true)
        //     ->count();
        $business = $user->businesses()->first();
        $thisMonth = Automation::where('business_id', $business->id)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        
        $lastMonth = Automation::where('business_id', $business->id)->where('is_active', true)
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->count();
        
        // 3. Calculate percentage change
        if ($lastMonth == 0) {
            $percentageChange = $thisMonth > 0 ? 100 : 0; // avoid division by zero
        } else {
            $percentageChange = (($thisMonth - $lastMonth) / $lastMonth) * 100;
        }
        
        // 4. Add + or - sign
        $symbol = $percentageChange > 0 ? '+' : ($percentageChange < 0 ? '-' : '');

        $percentageWithSymbol = number_format(abs($percentageChange), 2);
        return [
            'activeAutomations' => $thisMonth,
            'symbol' => $symbol,
            'growth' => $percentageWithSymbol
        ];
    }

    /**
     * Get total broadcasts for the user.
     *
     * @param  mixed  $user
     * @return array
     */
    private function getTotalBroadcasts($user): array
    {
        // TODO: Implement actual broadcasts counting logic
        // This could query a broadcasts table
        // Example: $user->broadcasts()->count();
        // return rand(50, 200); // Mock data
        $business = $user->businesses()->first();
        $thisMonth = Broadcast::where('business_id', $business->id)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        
        $lastMonth = Broadcast::where('business_id', $business->id)
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->count();
        
        // 3. Calculate percentage change
        if ($lastMonth == 0) {
            $percentageChange = $thisMonth > 0 ? 100 : 0; // avoid division by zero
        } else {
            $percentageChange = (($thisMonth - $lastMonth) / $lastMonth) * 100;
        }
        
        // 4. Add + or - sign
        $symbol = $percentageChange > 0 ? '+' : ($percentageChange < 0 ? '-' : '');

        $percentageWithSymbol = number_format(abs($percentageChange), 2);
        return [
            'totalBroadcasts' => $thisMonth,
            'symbol' => $symbol,
            'growth' => $percentageWithSymbol
        ];
    }

    /**
     * Get today's messages for the user.
     *
     * @param  mixed  $user
     * @return array
     */
    private function getTodayMessages($user): array
    {
        // TODO: Implement actual message counting logic
        // This could query a messages table where created_at is today
        // Example: $user->messages()->whereDate('created_at', today())->count();
        // return rand(20, 100); // Mock data
        $business = $user->businesses()->first();
        $thisMonth = Message::where('business_id', $business->id)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        
        $lastMonth = Message::where('business_id', $business->id)
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->count();
        
        // 3. Calculate percentage change
        if ($lastMonth == 0) {
            $percentageChange = $thisMonth > 0 ? 100 : 0; // avoid division by zero
        } else {
            $percentageChange = (($thisMonth - $lastMonth) / $lastMonth) * 100;
        }
        
        // 4. Add + or - sign
        $symbol = $percentageChange > 0 ? '+' : ($percentageChange < 0 ? '-' : '');

        $percentageWithSymbol = number_format(abs($percentageChange), 2);
        return [
            'todayMessages' => $thisMonth,
            'symbol' => $symbol,
            'growth' => $percentageWithSymbol
        ];
    }

    /**
     * Get chart data for the last 7 days.
     *
     * @param  mixed  $user
     * @return array
     */
    private function getChartData($user): array
    {
        // TODO: Implement actual chart data logic
        // This should return data for the last 7 days
        // $days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        // $chartData = [];

        // foreach ($days as $day) {
        //     $chartData[] = [
        //         'name' => $day,
        //         'leads' => rand(10, 25),
        //         'messages' => rand(30, 70),
        //         'broadcasts' => rand(2, 8),
        //     ];
        // }

        $business = $user->businesses()->first();

        // Get last 7 days dates
        $days = collect(range(0, 6))
            ->map(fn($i) => now()->subDays($i)->format('Y-m-d'))
            ->reverse();

        // Fetch counts
        $leads = Lead::where('business_id', $business->id)
            ->whereIn(DB::raw('DATE(created_at)'), $days)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->pluck('count', 'date')
            ->toArray();

        $messages = Message::where('business_id', $business->id)
            ->whereIn(DB::raw('DATE(created_at)'), $days)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->pluck('count', 'date')
            ->toArray();

        $broadcasts = Broadcast::where('business_id', $business->id)
            ->whereIn(DB::raw('DATE(created_at)'), $days)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->pluck('count', 'date')
            ->toArray();

        // Build final chart structure
        $chartData = [];

        foreach ($days as $day) {
            $chartData[] = [
                'name' => \Carbon\Carbon::parse($day)->format('D'), // Mon, Tue, ...
                'leads' => $leads[$day] ?? 0,
                'messages' => $messages[$day] ?? 0,
                'broadcasts' => $broadcasts[$day] ?? 0,
            ];
        }

        return $chartData;
    }
}