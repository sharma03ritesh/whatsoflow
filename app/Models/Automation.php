<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Automation extends Model
{
    protected $fillable = [
        'business_id',
        'name',
        'trigger_type',
        'trigger_value',
        'action_type',
        'action_config',
        'delay_seconds',
        'is_active',
        'position',
    ];

    protected $casts = [
        'action_config' => 'json',
        'delay_seconds' => 'integer',
        'is_active' => 'boolean',
        'position' => 'integer',
    ];

    protected $attributes = [
        'delay_seconds' => 0,
        'is_active' => true,
        'position' => 0,
    ];

    // Relationships
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function automationJobs(): HasMany
    {
        return $this->hasMany(AutomationJob::class);
    }

    public function automationLogs(): HasMany
    {
        return $this->hasMany(AutomationLog::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForTrigger($query, string $triggerType, $triggerValue = null)
    {
        $query->where('trigger_type', $triggerType);
        
        if ($triggerValue !== null) {
            $query->where('trigger_value', $triggerValue);
        }
        
        return $query;
    }

    // Methods
    public function isActive(): bool
    {
        return $this->is_active;
    }

    public function activate(): self
    {
        $this->update(['is_active' => true]);
        return $this;
    }

    public function deactivate(): self
    {
        $this->update(['is_active' => false]);
        return $this;
    }

    public function getTriggerLabel(): string
    {
        return match($this->trigger_type) {
            'new_lead' => 'New Lead',
            'stage_change' => 'Stage Change',
            'keyword' => 'Keyword Match',
            'timed' => 'Timed',
            default => ucfirst(str_replace('_', ' ', $this->trigger_type)),
        };
    }

    public function getActionLabel(): string
    {
        return match($this->action_type) {
            'send_message' => 'Send Message',
            'update_stage' => 'Update Stage',
            'add_tag' => 'Add Tag',
            default => ucfirst(str_replace('_', ' ', $this->action_type)),
        };
    }
}
