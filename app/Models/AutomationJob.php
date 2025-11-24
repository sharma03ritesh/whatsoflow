<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AutomationJob extends Model
{
    protected $fillable = [
        'automation_id',
        'lead_id',
        'execute_at',
        'status',
        'result',
        'error_message',
    ];

    protected $casts = [
        'execute_at' => 'datetime',
        'result' => 'json',
    ];

    protected $attributes = [
        'status' => 'pending',
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

    public function automationLogs(): HasMany
    {
        return $this->hasMany(AutomationLog::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeRunning($query)
    {
        return $query->where('status', 'running');
    }

    public function scopeDone($query)
    {
        return $query->where('status', 'done');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeReadyToExecute($query)
    {
        return $query->where('status', 'pending')
                    ->where('execute_at', '<=', now());
    }

    // Methods
    public function markAsRunning(): self
    {
        $this->update(['status' => 'running']);
        return $this;
    }

    public function markAsDone(array $result = null): self
    {
        $this->update([
            'status' => 'done',
            'result' => $result,
        ]);
        return $this;
    }

    public function markAsFailed(string $errorMessage = null): self
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
        ]);
        return $this;
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isRunning(): bool
    {
        return $this->status === 'running';
    }

    public function isDone(): bool
    {
        return $this->status === 'done';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    public function canExecute(): bool
    {
        return $this->isPending() && $this->execute_at->isPast();
    }
}
