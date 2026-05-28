<?php

use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Verifies row-level security across two distinct Postgres connections. The
 * dual-connection pattern is essential: `set_config(..., false)` is
 * session-scoped, and Laravel's DatabaseManager caches one PDO per connection
 * name, so `pgsql_testing_a` and `pgsql_testing_b` are two independent
 * sessions against the same database. RefreshDatabase cannot be used here
 * because its outer transaction would collapse both connections into one
 * shared snapshot.
 *
 * Phase 8 (global-patient-access pivot, 2026-05-22) disabled RLS on the
 * nine clinical tables — patients / appointments / medical_records /
 * prescriptions / lab_orders / vital_signs etc. The tests below retarget at
 * `users`, which retains the original `tenant_isolation` policy and so still
 * proves RLS engages under the non-BYPASSRLS `blue_dome_app` role used by
 * these two connections.
 */
beforeEach(function () {
    DB::connection()->statement("SELECT set_config('app.is_super_admin', 'true', false)");
    DB::connection()->statement('TRUNCATE TABLE clinics, branches, users, patients RESTART IDENTITY CASCADE');
});

afterEach(function () {
    DB::purge('pgsql_testing_a');
    DB::purge('pgsql_testing_b');
});

it('hides another tenant\'s users under RLS (still-isolated table)', function () {
    $clinicA = (string) Str::uuid();
    $clinicB = (string) Str::uuid();
    $userA = (string) Str::uuid();

    DB::connection()->insert(
        'INSERT INTO clinics (id, name, slug, country) VALUES (?, ?, ?, ?), (?, ?, ?, ?)',
        [
            $clinicA, 'Clinic A', 'clinic-a-'.$clinicA, 'MA',
            $clinicB, 'Clinic B', 'clinic-b-'.$clinicB, 'MA',
        ]
    );

    DB::connection()->insert(
        'INSERT INTO users (id, clinic_id, email, password_hash, first_name, last_name, role)
         VALUES (?, ?, ?, ?, ?, ?, ?)',
        [$userA, $clinicA, 'tenant-a@example.test', 'hash', 'Tenant', 'A', 'doctor']
    );

    $connA = DB::connection('pgsql_testing_a');
    $connB = DB::connection('pgsql_testing_b');

    $connA->statement('SELECT set_config(?, ?, false)', ['app.current_clinic_id', $clinicA]);
    $connA->statement('SELECT set_config(?, ?, false)', ['app.is_super_admin', 'false']);

    $connB->statement('SELECT set_config(?, ?, false)', ['app.current_clinic_id', $clinicB]);
    $connB->statement('SELECT set_config(?, ?, false)', ['app.is_super_admin', 'false']);

    $countOnA = $connA->selectOne("SELECT COUNT(*) AS n FROM users WHERE email = 'tenant-a@example.test'");
    $countOnB = $connB->selectOne("SELECT COUNT(*) AS n FROM users WHERE email = 'tenant-a@example.test'");

    expect((int) $countOnA->n)->toBe(1);
    expect((int) $countOnB->n)->toBe(0);
});

it('rejects cross-tenant writes on a still-isolated table via WITH CHECK', function () {
    $clinicA = (string) Str::uuid();
    $clinicB = (string) Str::uuid();

    DB::connection()->insert(
        'INSERT INTO clinics (id, name, slug, country) VALUES (?, ?, ?, ?), (?, ?, ?, ?)',
        [
            $clinicA, 'Clinic A', 'clinic-a-'.$clinicA, 'MA',
            $clinicB, 'Clinic B', 'clinic-b-'.$clinicB, 'MA',
        ]
    );

    $connB = DB::connection('pgsql_testing_b');
    $connB->statement('SELECT set_config(?, ?, false)', ['app.current_clinic_id', $clinicB]);
    $connB->statement('SELECT set_config(?, ?, false)', ['app.is_super_admin', 'false']);

    expect(fn () => $connB->insert(
        'INSERT INTO users (clinic_id, email, password_hash, first_name, last_name, role)
         VALUES (?, ?, ?, ?, ?, ?)',
        [$clinicA, 'forbidden@example.test', 'hash', 'Forbidden', 'Insert', 'doctor']
    ))->toThrow(QueryException::class);
});

it('reveals every clinic to a super-admin context', function () {
    $clinicA = (string) Str::uuid();
    $clinicB = (string) Str::uuid();

    DB::connection()->insert(
        'INSERT INTO clinics (id, name, slug, country) VALUES (?, ?, ?, ?), (?, ?, ?, ?)',
        [
            $clinicA, 'Clinic A', 'clinic-a-'.$clinicA, 'MA',
            $clinicB, 'Clinic B', 'clinic-b-'.$clinicB, 'MA',
        ]
    );

    $count = DB::connection()->selectOne('SELECT COUNT(*) AS n FROM clinics');

    expect((int) $count->n)->toBe(2);
});

it('exposes patients table cross-clinic now that RLS is disabled (Phase 8)', function () {
    $clinicA = (string) Str::uuid();
    $clinicB = (string) Str::uuid();

    DB::connection()->insert(
        'INSERT INTO clinics (id, name, slug, country) VALUES (?, ?, ?, ?), (?, ?, ?, ?)',
        [
            $clinicA, 'Clinic A', 'clinic-a-'.$clinicA, 'MA',
            $clinicB, 'Clinic B', 'clinic-b-'.$clinicB, 'MA',
        ]
    );

    DB::connection()->insert(
        'INSERT INTO patients (clinic_id, first_name, last_name) VALUES (?, ?, ?)',
        [$clinicA, 'Tenant', 'A-Patient']
    );

    $connB = DB::connection('pgsql_testing_b');
    $connB->statement('SELECT set_config(?, ?, false)', ['app.current_clinic_id', $clinicB]);
    $connB->statement('SELECT set_config(?, ?, false)', ['app.is_super_admin', 'false']);

    // Clinic B's session sees clinic A's patient because patients RLS is off.
    $countOnB = $connB->selectOne('SELECT COUNT(*) AS n FROM patients');
    expect((int) $countOnB->n)->toBe(1);
});
