<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * The per-clinic sequence allocator `fn_next_seq` (used to mint patient_code,
 * invoice_number, appointment_number, …) writes to the RLS-FORCED
 * `clinic_sequences` table. Under the non-BYPASSRLS `blue_dome_app` role used
 * by `pgsql_testing_a` (mirrors production), that write only succeeds because
 * the function is SECURITY DEFINER. Without it, a secretary adding a patient
 * 500s while allocating patient_code (PatientObserver::creating ->
 * SequenceService::next -> fn_next_seq). Guards migration 2026_06_25_000020.
 *
 * Runs under the `Rls` suite (DatabaseTruncation, real second connection) — the
 * standard Feature suite can't catch this because its connection is a BYPASSRLS
 * superuser.
 */
beforeEach(function () {
    DB::connection()->statement("SELECT set_config('app.is_super_admin', 'true', false)");
    DB::connection()->statement('TRUNCATE TABLE clinics RESTART IDENTITY CASCADE');
});

afterEach(function () {
    DB::purge('pgsql_testing_a');
});

it('keeps the sequence allocator SECURITY DEFINER', function () {
    $secdef = DB::connection()
        ->selectOne("SELECT prosecdef FROM pg_proc WHERE proname = 'fn_next_seq'")
        ->prosecdef;

    expect($secdef)->toBeTrue();
});

it('allocates a clinic sequence under the non-superuser role without tenant context', function () {
    $clinic = (string) Str::uuid();

    DB::connection()->insert(
        'INSERT INTO clinics (id, name, slug, country) VALUES (?, ?, ?, ?)',
        [$clinic, 'Seq Clinic', 'seq-'.$clinic, 'MA']
    );

    $conn = DB::connection('pgsql_testing_a');
    $conn->statement('SELECT set_config(?, ?, false)', ['app.is_super_admin', 'false']);
    // Worst case: tenant GUC missing on the executing connection (the kind of
    // lost session context that connection pooling can cause). The allocator
    // must still mint a number — that's exactly what SECURITY DEFINER buys.
    $conn->statement('SELECT set_config(?, ?, false)', ['app.current_clinic_id', '']);

    // First call hits the INSERT branch, second the ON CONFLICT DO UPDATE branch
    // — both touch the RLS-forced table and must succeed.
    $first = $conn->selectOne('SELECT fn_next_seq(?::uuid, ?) AS v', [$clinic, 'patient_code'])->v;
    $second = $conn->selectOne('SELECT fn_next_seq(?::uuid, ?) AS v', [$clinic, 'patient_code'])->v;

    expect($first)->not->toBeNull();
    expect($second)->not->toBe($first);
});
