# Open Questions

Things `schema.sql` and `IMPLEMENTATION_GUIDE.md` left ambiguous or that
diverged during translation. Anything in here needs a decision from the
product / data owner before the next time we touch it.

## 1. Fortify-compatibility columns on `users`

**Context:** Phase 0 migration `2026_05_17_000041_add_fortify_compat_columns_to_users.php`
adds four columns that are NOT in `schema.sql`:

- `two_factor_secret TEXT`
- `two_factor_recovery_codes TEXT`
- `two_factor_confirmed_at TIMESTAMPTZ`
- `remember_token VARCHAR(100)`

**Why we added them:** Fortify's package source writes to these literal
column names via `forceFill(...)`, `update(...)`, and array writes in 10+
files (`EnableTwoFactorAuthentication`, `ConfirmTwoFactorAuthentication`,
`DisableTwoFactorAuthentication`, `GenerateNewRecoveryCodes`,
`TwoFactorSecretKeyController`, `TwoFactorQrCodeController`,
`RecoveryCodeController`, `TwoFactorLoginRequest`,
`RedirectIfTwoFactorAuthenticatable`, `InteractsWithTwoFactorState`,
`getRememberToken()` in the Authenticatable trait). These writes bypass
Eloquent accessors, so aliasing through the model is not viable. Replacing
the `TwoFactorAuthenticatable` trait wholesale would silently rot on Fortify
upgrades.

**What schema.sql says:** the canonical columns are
`two_factor_secret_enc` and `two_factor_recovery_enc` (intended to hold
KMS-encrypted blobs at rest). It has no `two_factor_confirmed_at` and no
`remember_token`.

**Decision needed:**
- Are the four added columns permanent, or do we plan a Phase 1+ migration
  that promotes 2FA into the `_enc` columns with KMS?
- If KMS migration is planned, who owns it — and when?
- Should `remember_token` stay forever (it's Laravel's "remember me" cookie
  identifier) or be removed once we adopt session-only auth?

## 2. `medical_records` partitioning discrepancy

**What `IMPLEMENTATION_GUIDE.md` says** (`=== partition rules ===`):
> "Four tables are RANGE-partitioned by month: `notifications`, `message_log`,
> `activity_log`, `medical_records`."

**What `schema.sql` actually defines** (section 11): `medical_records` is a
regular non-partitioned table with `id UUID PRIMARY KEY` (not a composite
`(id, created_at)` PK that partitioning would require).

**What we did:** followed `schema.sql` (hard rule §forbidden: "do not invent
schema") and built `medical_records` as a regular table inside
`2026_05_17_000050_create_patients_domain.php`.

**Decision needed:**
- Amend the guide to say three partitioned tables, OR
- Schedule a future migration that converts `medical_records` to a
  partitioned shape (composite PK, range partitioning by `record_date` or
  `created_at`, partition rotation in the cron job).

The Phase 3 partition-rotation command currently iterates over four table
names; that will need to be reconciled once this is decided.

## 3. `invoices.balance_due` GENERATED column references another GENERATED column

**What `schema.sql` defines** (line ~908):
```sql
balance_due NUMERIC(12,2) GENERATED ALWAYS AS (total - paid_amount) STORED,
```

…where `total` is itself a GENERATED STORED column.

**The problem:** PostgreSQL does not allow a GENERATED column expression to
reference another GENERATED column on the same table. As written, the schema
would fail at `CREATE TABLE` time.

**What we did:** in
`2026_05_17_000080_create_billing.php` we expanded the `total` expression
inline inside `balance_due`'s formula. The stored value is identical to the
intended `total - paid_amount`.

**Decision needed:**
- Confirm the inline-expansion translation is acceptable and update
  `schema.sql`'s comment block to reflect it, OR
- Convert `total` and `balance_due` to a single VIEW computation outside the
  table.

## 4. `password_hash` vs `password` naming

**Context:** `App\Models\User::getAuthPassword()` returns `$this->password_hash`.
We never added a `password` column. `App\Actions\Fortify\CreateNewUser`,
`ResetUserPassword`, and `Http\Controllers\Settings\SecurityController` all
write directly to `password_hash` via `Hash::make()`.

**Decision needed:**
- Confirm this is the permanent contract (no `password` column will ever be
  added).

## 5. Sail vs native Postgres for dev

**Context:** the approved Phase 0 plan called for Sail. Sail scaffolding has
been published (`compose.yaml` with `postgres:16-alpine`, `redis:alpine`),
but the development host currently has no Docker install. We pivoted to an
externally hosted Aiven Postgres 17 instance (`pg-b74ef94-…aivencloud.com`)
via the `.env` `DB_HOST` override. Migrations applied cleanly to both
`defaultdb` and `blue_dome_testing`.

**Decision needed:**
- Keep Aiven as the dev/test target indefinitely, OR
- Install Docker and switch back to Sail, OR
- Run a third local Postgres for tests and reserve Aiven for shared dev.

Either way the published `compose.yaml` stays in the repo for whoever needs
Sail later — it is not load-bearing for the current setup.

## 6. RLS isolation tests blocked by BYPASSRLS on `avnadmin` (RESOLVED 2026-05-17)

**Context:** Aiven creates the bundled admin role `avnadmin` with
`rolbypassrls = true`. PostgreSQL's `FORCE ROW LEVEL SECURITY` applies row
policies to *table owners*, but never to roles with the BYPASSRLS attribute.
With the initial config, the `RlsIsolationTest` suite connected as
`avnadmin` via `pgsql_testing_a` / `pgsql_testing_b`, so RLS never engaged.

**Resolution shipped:** created `blue_dome_app` on the Aiven instance as
`NOSUPERUSER NOBYPASSRLS` with full DML grants on `public.*`. Added
`DB_TEST_USERNAME` / `DB_TEST_PASSWORD` env vars; the `pgsql_testing_a` and
`pgsql_testing_b` connection blocks in `config/database.php` now read those
in preference to the admin credentials. All three RLS tests pass.

**Production note:** the production app role MUST also be NOBYPASSRLS — if
the production deploy uses an `avnadmin`-style admin role, RLS provides no
isolation. Confirm this when provisioning the production database and add
the role-creation runbook to the deployment docs (Phase 9).

## 7. `patients.national_id` and `patients.insurance_number` widened to TEXT

**Context:** `schema.sql` defines both columns as `VARCHAR(100)`.
`IMPLEMENTATION_GUIDE.md` §security rules requires both to use Laravel's
`encrypted` cast, whose base64 ciphertext is ~150-200 chars even for short
inputs. VARCHAR(100) would silently truncate every encrypted value and
corrupt it on read.

**What Phase 2 shipped:** migration
`2026_05_18_000010_widen_patient_pii_columns.php` alters both columns to
`TEXT`, with a drop-and-recreate of the `v_patients` view (Postgres pins
column types through view dependencies). `down()` reverts to VARCHAR(100).

**Decision needed:** confirm production migrations should mirror this
deviation. The reasoning is identical to item #1 (Fortify-compat columns):
the schema describes the *intended logical shape*, but the application
implementation requires accommodation. Either amend `schema.sql` to say
TEXT for these two columns or treat the Phase 2 migration as canonical.

## 8. AuditObserver + ActivityLog model deferred

**Context:** `IMPLEMENTATION_GUIDE.md` §audit rules requires every write to
land in the partitioned `activity_log` table via a model observer. The
example uses `ActivityLog::create(...)` in `AuditObserver`. The observer
should be attached to `Patient`, `Appointment`, `Prescription`, `LabOrder`,
`Invoice`, `Payment`, `MedicalRecord`, `User` (account creation), and
`PatientShareRequest`.

**What Phase 2 shipped:** nothing. Patient writes are not yet audited.

**Why deferred:** the cross-cutting work didn't appear in Phase 2's
literal deliverables list, and Phase 7 (super-admin panel) is the
natural landing zone because that's where the activity-log viewer lives.

**Decision needed:** the cleanest path is to land AuditObserver +
`ActivityLog` model (composite PK `(id, created_at)`, write-only) BEFORE
Phase 4 (medical records). Once prescriptions, lab orders, and medical
records start flowing, retroactively auditing them is non-trivial.
Recommend a dedicated cross-cutting task scheduled between Phase 3
(Appointments) and Phase 4 (Medical records / prescriptions), titled
"Cross-cutting: audit observer + activity log model".

**RESOLVED 2026-05-18 (Phase 4):** `App\Models\ActivityLog` and
`App\Observers\AuditObserver` shipped with Phase 4. The observer is
registered on `Patient`, `Appointment`, `Prescription`, `LabOrder`,
`MedicalRecord`, and `User` in `AppServiceProvider::registerObservers()`.
`Invoice` / `Payment` / `PatientShareRequest` will be added when those
phases land. The observer skips its own writes, plus `MessageLog` /
`Notification` per the IG. Hidden model attributes (e.g. the encrypted
SOAP fields on `MedicalRecord`) are excluded from `old_values` /
`new_values` snapshots so the audit log cannot become a plaintext leak.

## 9. `medical_records.diagnosis` and `medical_records.notes` do not exist

**What `IMPLEMENTATION_GUIDE.md` says** (§security rules table):
| `medical_records` | `diagnosis` | sensitive medical content |
| `medical_records` | `notes`     | sensitive clinical notes  |

…with the expectation that both columns are TEXT and cast `encrypted`.

**What the deployed schema actually has:** `medical_records` carries the
structured SOAP fields `subjective`, `objective`, `assessment`, `plan`
plus `content` and `title` — no `diagnosis` or `notes` column at all.
`diagnosis_codes` (JSONB ICD-10 array) exists but is structured, not the
free-text narrative the IG was describing.

**What Phase 4 shipped:** the `App\Models\MedicalRecord` model casts
`content`, `subjective`, `objective`, `assessment`, and `plan` as
`encrypted` and lists them in `$hidden`. Encryption test
(`tests/Feature/MedicalRecords/MedicalRecordEncryptionTest.php`)
verifies ciphertext-at-rest + decrypt-on-read round-trip for all five
columns. The plan-mode decision was option (a): "Encrypt SOAP TEXT
fields in place" — treating the structured SOAP fields as the canonical
free-text storage and mapping the IG's intent onto them, rather than
adding a deviation migration like Phase 2's widen-PII path.

**Decision needed:** confirm that the SOAP-fields-as-encrypted mapping
is acceptable, OR schedule a future migration that adds dedicated
`diagnosis` and `notes` TEXT columns to `medical_records`. If the latter,
the SOAP fields can stay structured/plaintext and the encrypted columns
get added in a Phase-2-style schema-deviation migration with the same
view drop-and-recreate dance if any views currently reference these
columns.

## 10. `activity_log.action` CHECK widened for Phase 7 events

**What `schema.sql` defines** (and migration
`2026_05_17_000110_create_partitioned_tables.php` mirrors): a 23-value
CHECK constraint on `activity_log.action` covering generic CRUD,
authentication events, and a few business-specific actions
(`confirm_appointment`, `send_invoice`, etc.). The exit-gate test for
Phase 7 asserts that impersonation writes
`activity_log.action='impersonated'` — a value the original CHECK does
not allow.

**What Phase 7 shipped:** migration
`2026_05_19_000010_extend_activity_log_action_check.php` drops the
inherited constraint (resolved by name from `pg_constraint` for
portability) and re-adds it with three new actions appended:
`impersonated`, `left_impersonation`, `subscription_changed`. The CHECK
lives on the `activity_log` partitioned parent so every child partition
plus future ones from `fn_create_monthly_partitions` inherit the
widened list automatically. `down()` reverts to the original 23-value
list. Same Phase-0 / Phase-2 precedent of "ship a deviation migration,
flag the divergence here, decide whether to amend `schema.sql` later".

**Decision needed:**
- Amend `schema.sql` to match (and treat the migration as the
  canonical reference until the schema is updated), OR
- Keep `schema.sql` as the "logical contract" and treat
  `2026_05_19_000010_extend_activity_log_action_check.php` as the
  permanent canonical deviation. The migration itself is reversible so
  either path is recoverable.

## 11. MRR placeholder pricing in `config/billing.php`

**Context:** Phase 7 introduces a cross-tenant MRR metric on the
super-admin dashboard. The schema has no per-plan pricing surface
(no `subscription_plans` table, no `price_cents` column on `clinics`),
so `config/billing.php` ships placeholder MAD values:

| plan | monthly price (MAD) |
|---|---|
| free | 0 |
| basic | 199 |
| professional | 499 |
| enterprise | 1499 |

The dashboard `SuperAdminMetricsService::mrr()` sums these values
multiplied by the count of `subscription_status='active'` clinics per
plan, and the React page renders a "placeholder pricing" notice so the
displayed amount is visibly provisional.

**Decision needed:**
- Confirm placeholder values are acceptable to ship for the Phase 7
  demo / interim period, OR replace with a canonical source
  (subscription_plans table OR Stripe price-id catalogue) before
  Phase 7 leaves "complete pending approval" status.
- Multi-currency MRR is currently out of scope — all clinics are
  assumed to bill in MAD. If a future market needs MAD + EUR + USD
  rollup, the metrics service needs a per-clinic currency lookup and
  a conversion strategy (snapshot-at-billing vs. live FX).

## 12. Impersonation target scope

**Context:** the IG permission matrix has a single row about
impersonation:

| Action | super_admin | clinic_admin | doctor | secretary |
|---|---|---|---|---|
| Impersonate clinic_admin (support) | ✅ | ❌ | ❌ | ❌ |

Phase 7's `StartImpersonationRequest::after()` and
`ImpersonationService::start()` both enforce this strictly — any
target whose `role !== 'clinic_admin'` produces a 422 with the
localized `super_admin.impersonation_only_clinic_admin` key.

**Decision needed:** confirm the matrix's strict-clinic-admin scope.
If the platform's support workflow ever needs to shadow a doctor or
secretary directly (rather than going through the clinic_admin), the
service whitelist needs a second `target_role IN (...)` setting and
the matrix row should be split. No audit-schema change is required —
the `entity_type` already carries 'User' and `new_values.target_role`
distinguishes them downstream.

## 13. RLS disabled on the nine clinical tables (Phase 8 pivot)

**Context:** the IG `=== mission rules ===` opens with the hard rule
"Do not bypass Row-Level Security. Every clinic-scoped query must run
with `app.current_clinic_id` set." Phase 8 deliberately bypasses that
rule on nine clinical tables under direct product-owner direction
recorded in the 2026-05-22 plan-mode session (Option A).

**What Phase 8 shipped:**

Migration `2026_05_22_000010_disable_rls_on_clinical_tables.php`
drops `tenant_isolation`, `NO FORCE`, and `DISABLE ROW LEVEL SECURITY`
on `patients`, `patient_communication_preferences`, `vital_signs`,
`appointments`, `medical_records`, `prescriptions`,
`prescription_items`, `lab_orders`, `lab_order_items`. The
`tenant_isolation` policies on every other table (billing, inventory,
documents, staff, integrations, settings, audit roots, reference data)
remain intact.

`down()` reinstates each policy verbatim. Reversible.

**Decision needed:**

- Amend `IMPLEMENTATION_GUIDE.md` §mission rules with an explicit
  carve-out: "Do not bypass RLS *except* on the clinical-patient
  tables disabled by migration `2026_05_22_000010` for the
  global-patient-access feature." Same Phase 0 / Phase 2 / Phase 7
  precedent: schema.sql / IG stays the logical contract; the
  migration is the canonical override.
- Future agents must NOT re-enable RLS on these tables without
  explicit product-owner approval. A `tests/Rls/RlsIsolationTest`
  case now asserts the opposite (`patients` is cross-clinic
  readable) so a re-enable attempt will surface immediately as a
  test failure.

## 14. `patient_share_requests` is now schema dead weight

**Context:** the schema (and migration
`2026_05_17_000100_create_messaging_settings.php`) ships
`patient_share_requests` to back the IG-defined consented sharing
flow. Phase 8's Option A pivot makes the table unused — no model, no
controller, no routes, no AuditObserver registration, no FormRequest,
no service caller.

**What Phase 8 shipped:** nothing on this table. It remains in the
schema as orphaned shape.

**Decision needed:**

- (a) Drop the table via a deviation migration. Cleanest, but
  destructive — `down()` would need to re-create the original
  `CREATE TABLE` + indexes + trigger + RLS policy.
- (b) Keep the table indefinitely as graceful dead weight (no
  performance impact, no migration). The schema stays self-consistent
  with the original IG.
- (c) Repurpose for a future audited-data-export / data-share-event
  feature. The shape (patient_id, from_clinic_id, to_clinic_id,
  token, status, approved_via) is generic enough to host a
  hypothetical "export receipt" or "consent ledger" record.

Recommendation: (b) for now; revisit when a real consent-tracking
need lands.

## 15. Cross-clinic data access vs. Moroccan medical-privacy law

**Context:** Phase 8 gives every clinic SELECT + INSERT + UPDATE on
every patient's clinical data with no per-patient consent gate. The
IG `=== security rules ===` invokes Loi 09-08 (Moroccan data
protection) and GDPR as the compliance baseline. Both regimes
require either consent or another lawful basis for sharing personal
medical data between data controllers (separate clinics ARE separate
controllers).

**What Phase 8 shipped:** no consent capture. The only carve-out is
`PatientPolicy::export` / `erase` — those still require the patient's
origin-clinic admin (preserved in `PatientErasureRestrictedTest`).

**Decision needed before production:**

- Confirm where consent IS captured for cross-clinic data exchange.
  Candidates: patient onboarding intake forms, signed T&Cs at the
  point of registration, a separate consent ledger linked to the
  patient row.
- If no consent surface exists, Phase 9 should add a
  `patient.cross_clinic_consent` boolean (or richer JSON of
  consented clinics) and gate clinical-data reads through a
  policy branch.
- Auditability is already partially covered by `field_changes`
  (who-edited-what-when-from-which-clinic). What's missing is a
  *patient-facing* record of which clinics have accessed their data
  (a "data subject access request" log per GDPR Art. 15).

This is a legal/compliance blocker, not a technical one. Flag to
counsel before sign-off.

## 16. `field_changes` storage retention

**Context:** Phase 8 introduced `field_changes`, written one row per
changed attribute on every Patient / Appointment / MedicalRecord /
Prescription / LabOrder update. Storage grows linearly with edit
volume. The IG §security rules sets a 7-year retention floor for
`activity_log` (Loi 09-08 medical-record audit traceability).

**What Phase 8 shipped:** no retention policy. The table grows
unbounded. No partitioning shape was chosen (composite PK on
`(id, changed_at)` would have allowed RANGE partitioning by
`changed_at` matching `activity_log` — deferred to keep Phase 8
focused on the access pivot).

**Decision needed (Phase 9):**

- Pick a retention floor — recommendation: match `activity_log` at
  7 years.
- Decide whether to partition (RANGE by `changed_at` monthly,
  matching the existing four partitioned tables) or rely on a daily
  `field_changes:rotate` command to drop rows older than the
  retention floor. Partitioning is cheaper long-term; the rotation
  command is faster to implement.
- Add the chosen approach to the `RotatePartitionsCommand` /
  `RetentionCleanupCommand` family that Phase 9 builds for
  notifications + message_log + activity_log.
