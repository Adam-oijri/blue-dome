<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Per-clinic monotonic counter. The table has a composite primary key
 * (clinic_id, sequence_name); allocation always goes through
 * `SequenceService::next()` which wraps the race-safe `fn_next_seq()`
 * Postgres function. This model is read-only convenience for tests and
 * the future super-admin panel — never `create()` directly.
 */
class ClinicSequence extends Model
{
    protected $table = 'clinic_sequences';

    /**
     * The table uses a composite PK (clinic_id, sequence_name); there is no
     * `id` column. Disable autoincrement and let Eloquent treat it as a
     * read-mostly grid keyed by clinic_id for relationship access.
     */
    protected $primaryKey = null;

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = [
        'clinic_id',
        'sequence_name',
        'prefix',
        'last_value',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'last_value' => 'integer',
            'updated_at' => 'datetime',
        ];
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }
}
