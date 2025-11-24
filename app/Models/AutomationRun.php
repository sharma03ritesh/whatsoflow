<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class AutomationRun extends Model
{
    protected $fillable = [
        'automation_id',
        'lead_id',
        'status',
        'context',
        'result',
        'started_at',
        'completed_at',
        'error_message',
    ];

    protected $casts = [
        'context' => 'array',
        'result' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
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

    public function events(): MorphMany
    {
        return $this->morphMany(MessageEvent::class, 'messageable');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    // Methods
    public function markAsStarted(): self
    {
        $this->update([
            'status' => 'running',
            'started_at' => now(),
        ]);
        return $this;
    }

    public function markAsCompleted(array $result = []): self
    {
        $this->update([
            'status' => 'completed',
            'result' => $result,
            'completed_at' => now(),
        ]);
        return $this;
    }

    public function markAsFailed(string $error): self
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $error,
            'completed_at' => now(),
        ]);
        return $this;
    }

    public function isCompleted(): bool
    {
        return in_array($this->status, ['completed', 'failed']);
    }

    public function getContext(string $key, $default = null)
    {
        return $this->context[$key] ?? $default;
    }

    public function getResult(string $key, $default = null)
    {
        return $this->result[$key] ?? $default;
    }
}
