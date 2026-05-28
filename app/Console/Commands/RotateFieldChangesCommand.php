<?php

namespace App\Console\Commands;

use App\Models\FieldChange;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Phase 9 cleanup for the Phase 8 `field_changes` table. The IG §security rules
 * sets a 7-year retention floor for `activity_log` (Loi 09-08 medical-record
 * traceability). `field_changes` mirrors that contract — per open question
 * #16 in `docs/architecture/99-open-questions.md`.
 *
 * Scheduled in `bootstrap/app.php` to run weekly on Mondays at 03:00 UTC.
 * Uses `chunkById` so a large purge doesn't lock the table.
 */
class RotateFieldChangesCommand extends Command
{
    protected $signature = 'app:rotate-field-changes
        {--years=7 : Drop rows older than this many years (default matches activity_log retention)}
        {--dry-run : Report counts without deleting}';

    protected $description = 'Drop field_changes rows older than the retention window (default: 7 years).';

    public function handle(): int
    {
        // The command operates cross-clinic; mark the session super-admin so
        // any future RLS revival on field_changes does not block the delete.
        DB::statement("SELECT set_config('app.is_super_admin', 'true', false)");

        $years = max(1, (int) $this->option('years'));
        $cutoff = now()->subYears($years);
        $dryRun = (bool) $this->option('dry-run');

        $query = FieldChange::query()->where('changed_at', '<', $cutoff);
        $count = $query->count();

        if ($count === 0) {
            $this->info("No field_changes rows older than {$cutoff->toDateString()}.");

            return self::SUCCESS;
        }

        $this->info(sprintf(
            '%s %d field_changes rows older than %s (>%d years).',
            $dryRun ? 'Would delete' : 'Deleting',
            $count,
            $cutoff->toDateString(),
            $years,
        ));

        if ($dryRun) {
            return self::SUCCESS;
        }

        $deleted = 0;
        FieldChange::query()
            ->where('changed_at', '<', $cutoff)
            ->orderBy('id')
            ->chunkById(1000, function ($rows) use (&$deleted): void {
                $ids = $rows->pluck('id')->all();
                $deleted += FieldChange::query()->whereIn('id', $ids)->delete();
            });

        $this->info("Deleted {$deleted} field_changes rows.");

        return self::SUCCESS;
    }
}
