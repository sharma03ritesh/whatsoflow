<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutomationLog extends Model
{
    protected $fillable = [
        'automation_id',
        'lead_id',
        'action_type',
        'action_value',
        'status',
        'error_message',
        'metadata',
    ];

    protected $casts = [
        'action_value' => 'json',
        'metadata' => 'json',
    ];

    protected $attributes = [
        'status' => 'success',
    ];

    // Relationships
    public function automation(): BelongsTo
    {
        return $this->belongsTo(Automation::class);
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    // Scopes
    public function scopeSuccess($query)
    {
        return $query->where('status', 'success');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    // Methods
    public function isSuccess(): bool
    {
        return $this->status === 'success';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    public static function logSuccess(
        int $automationId,
        int $leadId,
        string $actionType,
        $actionValue,
        array $metadata = null
    ): self {
        return static::create([
            'automation_id' => $automationId,
            'lead_id' => $leadId,
            'action_type' => $actionType,
            'action_value' => $actionValue,
            'status' => 'success',
            'metadata' => $metadata,
        ]);
    }

    public static function logFailure(
        int $automationId,
        int $leadId,
        string $actionType,
        $actionValue,
        string $errorMessage,
        array $metadata = null
    ): self {
        return static::create([
            'automation_id' => $automationId,
            'lead_id' => $leadId,
            'action_type' => $actionType,
            'action_value' => $actionValue,
            'status' => 'failed',
            'error_message' => $errorMessage,
            'metadata' => $metadata,
        ]);
    }
}
