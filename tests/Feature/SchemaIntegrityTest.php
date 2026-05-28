<?php

use App\Models\Clinic;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Schema parity gate for Phase 0: every table, partition, view, extension,
 * helper function, and the GENERATED-column / GiST-exclusion / partial-unique
 * artifacts that schema.sql describes must be reachable from Laravel's
 * default test connection. If a column drifts or a migration is missed, the
 * dataset row fails fast with a clear diff.
 */
it('has every Postgres extension required by the schema', function (string $extension) {
    $row = DB::selectOne('SELECT 1 AS found FROM pg_extension WHERE extname = ?', [$extension]);

    expect($row)->not->toBeNull();
})->with(['pgcrypto', 'btree_gist', 'citext', 'pg_trgm']);

it('has every helper function required by the schema', function (string $functionName) {
    $row = DB::selectOne('SELECT 1 AS found FROM pg_proc WHERE proname = ?', [$functionName]);

    expect($row)->not->toBeNull();
})->with([
    'fn_set_updated_at',
    'fn_current_clinic_id',
    'fn_current_user_id',
    'fn_is_super_admin',
    'fn_soft_delete',
    'fn_restore',
    'fn_next_seq',
    'fn_enforce_user_role_caps',
    'fn_create_default_patient_prefs',
    'fn_sync_invoice_paid_amount',
    'fn_create_monthly_partitions',
]);

it('has every domain table from schema.sql', function (string $table) {
    expect(Schema::hasTable($table))->toBeTrue();
})->with([
    'clinics', 'branches', 'clinic_sequences',
    'users', 'user_branches', 'doctor_profiles',
    'patients', 'patient_communication_preferences', 'vital_signs',
    'appointments', 'medications', 'drug_interactions',
    'prescriptions', 'prescription_items',
    'external_labs', 'lab_orders', 'lab_order_items',
    'invoices', 'invoice_items', 'payments', 'vendors', 'expenses',
    'inventory', 'inventory_transactions',
    'document_folders', 'documents',
    'message_templates', 'clinic_settings', 'holidays',
    'whatsapp_integration', 'email_integration', 'patient_share_requests',
    'medical_records',
    'notifications', 'message_log', 'activity_log',
]);

it('has the bootstrap partitions and default partition for each partitioned parent', function (string $partition) {
    expect(Schema::hasTable($partition))->toBeTrue();
})->with([
    'notifications_2026_05', 'notifications_2026_06', 'notifications_2026_07', 'notifications_default',
    'message_log_2026_05', 'message_log_2026_06', 'message_log_2026_07', 'message_log_default',
    'activity_log_2026_05', 'activity_log_2026_06', 'activity_log_2026_07', 'activity_log_default',
]);

it('has every view from schema.sql', function (string $view) {
    $row = DB::selectOne(
        'SELECT 1 AS found FROM information_schema.views WHERE table_schema = current_schema() AND table_name = ?',
        [$view]
    );

    expect($row)->not->toBeNull();
})->with([
    'v_patients',
    'v_prescription_items',
    'v_appointments_needing_followup',
    'v_inventory_alerts',
]);

it('has the expected columns on critical tenant tables', function (string $table, array $columns) {
    expect(Schema::hasColumns($table, $columns))->toBeTrue();
})->with([
    'clinics' => ['clinics', [
        'id', 'name', 'slug', 'country', 'currency', 'timezone', 'locale',
        'subscription_plan', 'subscription_status', 'is_active', 'settings',
        'created_at', 'updated_at', 'deleted_at',
    ]],
    'users' => ['users', [
        'id', 'clinic_id', 'primary_branch_id', 'first_name', 'last_name',
        'email', 'password_hash', 'role', 'is_active', 'email_verified',
        'email_verified_at', 'two_factor_enabled', 'two_factor_secret_enc',
        'two_factor_recovery_enc', 'two_factor_secret', 'two_factor_recovery_codes',
        'two_factor_confirmed_at', 'remember_token', 'permissions', 'locale',
        'created_at', 'updated_at', 'deleted_at',
    ]],
    'patients' => ['patients', [
        'id', 'clinic_id', 'branch_id', 'patient_code', 'first_name', 'last_name',
        'date_of_birth', 'gender', 'phone', 'phone_e164', 'email', 'national_id',
        'blood_type', 'insurance_number', 'allergies', 'chronic_diseases',
        'registration_date', 'is_active', 'created_by',
        'created_at', 'updated_at', 'deleted_at',
    ]],
    'appointments' => ['appointments', [
        'id', 'clinic_id', 'branch_id', 'patient_id', 'doctor_id', 'secretary_id',
        'appointment_number', 'scheduled_start', 'scheduled_end', 'duration_minutes',
        'appointment_day', 'status', 'type', 'priority', 'confirmation_status',
        'confirmation_token', 'confirmation_token_expires',
        'needs_follow_up_call', 'follow_up_call_status', 'follow_up_call_attempts',
        'created_at', 'updated_at', 'deleted_at',
    ]],
    'invoices' => ['invoices', [
        'id', 'clinic_id', 'patient_id', 'appointment_id', 'invoice_number',
        'invoice_date', 'currency', 'subtotal', 'discount_amount', 'tax_percentage',
        'tax_amount', 'total', 'paid_amount', 'balance_due', 'status',
        'created_at', 'updated_at', 'deleted_at',
    ]],
    'payments' => ['payments', [
        'id', 'clinic_id', 'invoice_id', 'patient_id', 'payment_number',
        'amount', 'currency', 'payment_date', 'payment_method', 'payment_status',
        'created_at', 'updated_at', 'deleted_at',
    ]],
    'patient_share_requests' => ['patient_share_requests', [
        'id', 'patient_id', 'from_clinic_id', 'to_clinic_id', 'status',
        'access_type', 'token', 'requested_at', 'approved_at', 'expires_at',
    ]],
]);

it('enforces the doctor cap trigger on insert', function () {
    $clinic = Clinic::factory()->create();

    User::factory()->doctor()->create(['clinic_id' => $clinic->id]);
    User::factory()->doctor()->create(['clinic_id' => $clinic->id]);

    expect(fn () => User::factory()->doctor()->create(['clinic_id' => $clinic->id]))
        ->toThrow(QueryException::class);
});

it('enforces the secretary cap trigger on insert', function () {
    $clinic = Clinic::factory()->create();

    User::factory()->secretary()->create(['clinic_id' => $clinic->id]);
    User::factory()->secretary()->create(['clinic_id' => $clinic->id]);
    User::factory()->secretary()->create(['clinic_id' => $clinic->id]);

    expect(fn () => User::factory()->secretary()->create(['clinic_id' => $clinic->id]))
        ->toThrow(QueryException::class);
});

it('computes the bmi GENERATED column for vital_signs', function () {
    $clinic = Clinic::factory()->create();
    $patient = DB::table('patients')->insertGetId([
        'clinic_id' => $clinic->id,
        'first_name' => 'A',
        'last_name' => 'B',
    ], 'id');

    DB::table('vital_signs')->insert([
        'clinic_id' => $clinic->id,
        'patient_id' => $patient,
        'weight_kg' => 70,
        'height_cm' => 175,
    ]);

    $bmi = DB::table('vital_signs')->where('patient_id', $patient)->value('bmi');

    expect((float) $bmi)->toEqualWithDelta(22.86, 0.01);
});
