<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Broadcast extends Model
{
    protected $fillable = [
        'business_id',
        'name',
        'message',
        'filters',
        'status',
        'scheduled_for',
        'sent_at',
        'completed_at',
        'metadata',
        'created_by',
    ];

    protected $casts = [
        'filters' => 'array',
        'metadata' => 'array',
        'scheduled_for' => 'datetime',
        'sent_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    protected $attributes = [
        'status' => 'draft',
    ];

    // Relationships
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function recipients(): HasMany
    {
        return $this->hasMany(BroadcastRecipient::class);
    }

    // Scopes
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    public function scopeSending($query)
    {
        return $query->where('status', 'sending');
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
    public function schedule(\DateTimeInterface $when = null): self
    {
        $this->update([
            'status' => 'scheduled',
            'scheduled_for' => $when ?? now(),
        ]);

        // Dispatch job to process the broadcast at the scheduled time
        ProcessBroadcast::dispatch($this)
            ->delay($this->scheduled_for);

        return $this;
    }

    public function startSending(): self
    {
        $this->update([
            'status' => 'sending',
            'sent_at' => now(),
        ]);

        return $this;
    }

    public function markAsCompleted(): self
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        return $this;
    }

    public function markAsFailed(string $error = null): self
    {
        $this->update([
            'status' => 'failed',
            'metadata' => array_merge($this->metadata ?? [], ['error' => $error]),
            'completed_at' => now(),
        ]);

        return $this;
    }

    public function addRecipient(Lead $lead, array $data = []): BroadcastRecipient
    {
        return $this->recipients()->create(array_merge([
            'lead_id' => $lead->id,
            'phone' => $lead->phone,
            'status' => 'pending',
        ], $data));
    }

    public function getRecipientsCount(): int
    {
        return $this->recipients()->count();
    }

    public function getSentCount(): int
    {
        return $this->recipients()->where('status', 'sent')->count();
    }

    public function getDeliveredCount(): int
    {
        return $this->recipients()->where('status', 'delivered')->count();
    }

    public function getFailedCount(): int
    {
        return $this->recipients()->where('status', 'failed')->count();
    }

    public function getProgressPercentage(): int
    {
        $total = $this->getRecipientsCount();
        if ($total === 0) {
            return 0;
        }

        $completed = $this->getSentCount() + $this->getFailedCount();
        return (int) round(($completed / $total) * 100);
    }

    public function isSending(): bool
    {
        return $this->status === 'sending';
    }

    public function isCompleted(): bool
    {
        return in_array($this->status, ['completed', 'failed']);
    }

    public function getFilteredLeads()
    {
        $query = $this->business->leads();

        if (!empty($this->filters)) {
            if (!empty($this->filters['status'])) {
                $query->whereIn('status', (array) $this->filters['status']);
            }

            if (!empty($this->filters['tags'])) {
                $query->whereJsonContains('tags', $this->filters['tags']);
            }

            if (!empty($this->filters['created_after'])) {
                $query->where('created_at', '>=', $this->filters['created_after']);
            }

            if (!empty($this->filters['last_contacted_before'])) {
                $query->where('last_contacted_at', '<=', $this->filters['last_contacted_before'])
                    ->orWhereNull('last_contacted_at');
            }
        }

        return $query->get();
    }
}
