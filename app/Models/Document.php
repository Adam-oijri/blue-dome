<?php

namespace App\Models;

use Database\Factories\DocumentFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class Document extends Model
{
    /** @use HasFactory<DocumentFactory> */
    use HasFactory, HasUuids, SoftDeletes;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'clinic_id',
        'folder_id',
        'document_name',
        'document_type',
        'file_name',
        'file_path',
        'file_size',
        'mime_type',
        'file_extension',
        'file_hash',
        'entity_type',
        'entity_id',
        'description',
        'tags',
        'metadata',
        'is_private',
        'is_archived',
        'is_shared',
        'shared_via',
        'shared_at',
        'shared_by',
        'is_encrypted',
        'uploaded_by',
        'uploaded_at',
        'expires_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'metadata' => 'array',
            'is_private' => 'boolean',
            'is_archived' => 'boolean',
            'is_shared' => 'boolean',
            'is_encrypted' => 'boolean',
            'shared_at' => 'datetime',
            'uploaded_at' => 'datetime',
            'expires_at' => 'datetime',
            'file_size' => 'integer',
            'deleted_at' => 'datetime',
        ];
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(DocumentFolder::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function scopeForCurrentClinic(Builder $query): Builder
    {
        $clinicId = DB::selectOne('SELECT fn_current_clinic_id() AS id')->id;

        return $query->where('clinic_id', $clinicId);
    }
}
