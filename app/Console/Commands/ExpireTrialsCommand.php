<?php

namespace App\Console\Commands;

use App\Models\ActivityLog;
use App\Models\Clinic;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Flips self-service clinics whose free trial has lapsed from `trial` to
 * `expired`, keeping the stored status accurate for the super-admin panel and
 * reporting. The EnsureClinicActive middleware already blocks access the
 * moment `subscription_expiry` passes (status-agnostic), so this command is a
 * reconciliation pass, not the gate itself.
 *
 * Scheduled daily in bootstrap/app.php. A clinic whose expiry is *today* is
 * still on its last valid day, so only strictly-past expiries flip — matching
 * the middleware's `subscription_expiry < today` rule.
 */
class ExpireTrialsCommand extends Command
{
    protected $signature = 'app:expire-trials
        {--dry-run : Report the count without changing anything}';

    protected $description = 'Mark lapsed free trials as expired (subscription_status: trial → expired).';

    public function handle(): int
    {
        // Cross-clinic maintenance: clinics RLS only lets a super-admin
        // session UPDATE rows, so elevate before touching the table.
        DB::statement("SELECT set_config('app.is_super_admin', 'true', false)");

        $clinics = Clinic::query()
            ->where('subscription_status', 'trial')
            ->whereNotNull('subscription_expiry')
            ->whereDate('subscription_expiry', '<', today())
            ->get(['id']);

        if ($clinics->isEmpty()) {
            $this->info('No lapsed trials to expire.');

            return self::SUCCESS;
        }

        if ((bool) $this->option('dry-run')) {
            $this->info("Would expire {$clinics->count()} trial clinic(s).");

            return self::SUCCESS;
        }

        $ids = $clinics->pluck('id')->all();

        // Bulk update via the query builder — no model events / AuditObserver,
        // so no null-actor surprises in this CLI context.
        Clinic::query()->whereIn('id', $ids)->update(['subscription_status' => 'expired']);

        foreach ($ids as $id) {
            ActivityLog::create([
                'clinic_id' => $id,
                'user_id' => null,
                'action' => 'subscription_changed',
                'entity_type' => 'Clinic',
                'entity_id' => $id,
                'description' => 'Free trial expired.',
                'old_values' => ['subscription_status' => 'trial'],
                'new_values' => ['subscription_status' => 'expired'],
                'created_at' => now(),
            ]);
        }

        $this->info("Expired {$clinics->count()} trial clinic(s).");

        return self::SUCCESS;
    }
}
