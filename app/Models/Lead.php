<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lead extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_id',
        'pipeline_column_id',
        'name',
        'phone',
        'stage', // Keeping for backward compatibility
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'stage' => 'integer',
        'business_id' => 'integer',
        'pipeline_column_id' => 'integer',
    ];

    /**
     * Get the pipeline column that the lead belongs to.
     */
    public function pipelineColumn()
    {
        return $this->belongsTo(PipelineColumn::class);
    }
    

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function tags()
    {
        return $this->hasMany(Tag::class);
    }

    /**
     * Get the latest message for the lead.
     */
    public function latestMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }
}
