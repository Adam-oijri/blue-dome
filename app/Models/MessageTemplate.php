<?php

namespace App\Models;

use Database\Factories\MessageTemplateFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class MessageTemplate extends Model
{
    /** @use HasFactory<MessageTemplateFactory> */
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'clinic_id',
        'template_name',
        'template_type',
        'template_category',
        'whatsapp_template_name',
        'whatsapp_template_language',
        'whatsapp_template_status',
        'subject',
        'body',
        'variables',
        'locale',
        'is_active',
        'is_default',
        'created_by',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'variables' => 'array',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
        ];
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    /**
     * Render the template body by interpolating {{key}} placeholders. Missing
     * keys are left as-is so they surface visibly in QA rather than silently.
     *
     * @param  array<string, string>  $variables
     */
    public function render(array $variables): string
    {
        return preg_replace_callback(
            '/\{\{\s*(\w+)\s*\}\}/',
            fn (array $m) => $variables[$m[1]] ?? $m[0],
            $this->body
        );
    }

    public function scopeForClinic(Builder $query, string $clinicId): Builder
    {
        return $query->where('clinic_id', $clinicId);
    }
}
