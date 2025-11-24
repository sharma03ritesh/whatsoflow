<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Business extends Model
{
    use HasFactory;

    
    protected $fillable = [
        'user_id',
        'business_name',
        'whatsapp_token',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }

    public function automations(): HasMany
    {
        return $this->hasMany(Automation::class);
    }

    public function broadcasts(): HasMany
    {
        return $this->hasMany(Broadcast::class);
    }

    public function messages(): HasManyThrough
    {
        return $this->hasManyThrough(Message::class, Lead::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    // Methods
    public function isConnected(): bool
    {
        return $this->status === 'active' && $this->whatsapp_token !== null;
    }

    public function markAsConnected(): void
    {
        $this->update([
            'status' => 'active',
            'connected_at' => now(),
        ]);
    }

    public function markAsDisconnected(): void
    {
        $this->update([
            'status' => 'inactive',
            'whatsapp_token' => null,
            'whatsapp_phone' => null,
        ]);
    }
}
