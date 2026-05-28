<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

/**
 * Thin wrapper around the Postgres function `fn_next_seq()` defined in
 * 2026_05_17_000020_create_helper_functions.php. The function uses
 * INSERT ... ON CONFLICT DO UPDATE ... RETURNING which is race-safe across
 * concurrent transactions — every caller gets a distinct value, no duplicates.
 *
 * Format: prefix (from clinic_sequences.prefix) + zero-padded value, e.g.
 * "PAT-000001", "INV-001234". Always allocate from inside a transaction so the
 * row lock holds across the consuming INSERT.
 */
class SequenceService
{
    public function next(string $clinicId, string $sequenceName): string
    {
        $row = DB::selectOne(
            'SELECT fn_next_seq(?::uuid, ?) AS value',
            [$clinicId, $sequenceName]
        );

        return $row->value;
    }
}
