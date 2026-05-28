<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

/**
 * Base class for any job that touches clinic-scoped data. Queue workers run in
 * a process detached from the request that dispatched them, so the
 * SetTenantContext middleware's session variables are gone by the time the job
 * starts. Subclasses pass the originating clinic + user IDs through the
 * constructor; `handle()` restores the Postgres GUCs before delegating to
 * `handleWithTenantContext()`.
 */
abstract class TenantAwareJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly string $clinicId,
        public readonly ?string $userId = null,
    ) {}

    public function handle(): void
    {
        DB::statement('SELECT set_config(?, ?, true)', [
            'app.current_clinic_id',
            $this->clinicId,
        ]);

        if ($this->userId !== null) {
            DB::statement('SELECT set_config(?, ?, true)', [
                'app.current_user_id',
                $this->userId,
            ]);
        }

        $this->handleWithTenantContext();
    }

    abstract protected function handleWithTenantContext(): void;
}
