<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Message extends Model
{
    protected $fillable = [
        'business_id',
        'lead_id',
        'direction',
        'content',
        'attachments',
        'status',
        'message_id',
        'error_message',
        'metadata',
        'sent_at',
        'delivered_at',
        'read_at',
        'sent_by',
    ];

    protected $casts = [
        'attachments' => 'array',
        'metadata' => 'array',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
    ];

    protected $attributes = [
        'status' => 'pending',
    ];

    // Relationships
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function sentBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sent_by');
    }

    public function events(): MorphMany
    {
        return $this->morphMany(MessageEvent::class, 'messageable');
    }

    // Scopes
    public function scopeIncoming($query)
    {
        return $query->where('direction', 'incoming');
    }

    public function scopeOutgoing($query)
    {
        return $query->where('direction', 'outgoing');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeDelivered($query)
    {
        return $query->where('status', 'delivered');
    }

    // Methods
    public function markAsSent(): self
    {
        return $this->updateStatus('sent', ['sent_at' => now()]);
    }

    public function markAsDelivered(): self
    {
        return $this->updateStatus('delivered', ['delivered_at' => now()]);
    }

    public function markAsRead(): self
    {
        return $this->updateStatus('read', ['read_at' => now()]);
    }

    public function markAsFailed(string $error): self
    {
        return $this->updateStatus('failed', [
            'error_message' => $error,
            'sent_at' => $this->sent_at ?? now(),
        ]);
    }

    protected function updateStatus(string $status, array $attributes = []): self
    {
        $this->update(array_merge(['status' => $status], $attributes));
        return $this;
    }

    public function addAttachment(string $url, string $type = 'file', ?string $name = null): self
    {
        $attachments = $this->attachments ?? [];
        $attachments[] = [
            'url' => $url,
            'type' => $type,
            'name' => $name ?? basename($url),
            'uploaded_at' => now()->toDateTimeString(),
        ];

        $this->update(['attachments' => $attachments]);
        return $this;
    }

    public function isIncoming(): bool
    {
        return $this->direction === 'incoming';
    }

    public function isOutgoing(): bool
    {
        return $this->direction === 'outgoing';
    }
}
