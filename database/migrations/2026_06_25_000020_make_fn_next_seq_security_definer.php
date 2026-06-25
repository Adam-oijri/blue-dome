<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * `fn_next_seq(uuid, varchar)` mints the per-clinic running numbers
 * (patient_code, invoice_number, appointment_number, …) by writing to
 * `clinic_sequences`. That table keeps RLS enabled + FORCED, and the function
 * was SECURITY INVOKER, so the `INSERT … ON CONFLICT` ran with the *caller's*
 * privileges. Under the non-superuser production role (`blue_dome_app`,
 * NOSUPERUSER NOBYPASSRLS) that write is rejected — `permission denied for
 * table clinic_sequences` / `new row violates row-level security policy` —
 * which surfaces as a 500 the first time any record needing a sequence number
 * is created (e.g. a secretary adding a patient: PatientObserver::creating ->
 * SequenceService::next -> fn_next_seq). It is invisible locally because the
 * dev/test superuser bypasses both grants and RLS.
 *
 * `clinic_sequences` is only ever touched through this function (always with an
 * explicit clinic id), so making the allocator SECURITY DEFINER — it then runs
 * as the function owner (the schema/migration owner, which has the privileges
 * and bypasses the forced policy) — fixes the write without weakening RLS on
 * the table for any direct access. `SET search_path` pins resolution so the
 * definer function can't be hijacked. Only the security attributes change; the
 * allocation logic is untouched.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER FUNCTION fn_next_seq(uuid, character varying) SECURITY DEFINER');
        DB::statement('ALTER FUNCTION fn_next_seq(uuid, character varying) SET search_path = public, pg_temp');
    }

    public function down(): void
    {
        DB::statement('ALTER FUNCTION fn_next_seq(uuid, character varying) RESET search_path');
        DB::statement('ALTER FUNCTION fn_next_seq(uuid, character varying) SECURITY INVOKER');
    }
};
