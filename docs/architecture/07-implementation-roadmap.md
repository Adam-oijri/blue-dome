# Implementation Roadmap

Chronological log of phase completion against `IMPLEMENTATION_GUIDE.md`. Each
entry records the date, what shipped, and the result of the exit-gate test
run.

## Phase 0 — Project bootstrap

**Status:** complete. All exit-gate tests green. Awaiting approval before
starting Phase 1.
**Date:** 2026-05-17.

### Verification run summary (2026-05-17)

- Full suite (`php artisan test --compact`): **121 / 123 passed, 2 skipped,
  0 failed** (224 assertions in ~225 s against Aiven Postgres 17).
- `SchemaIntegrityTest`: 77 / 77 passed (extensions, all 11 helper
  functions, every domain table, partition children, views, critical column
  sets, role-cap triggers on insert, GENERATED `bmi` column).
- `TenantContextMiddlewareTest`: 3 / 3 passed (clinic_admin sets GUCs,
  super_admin flips `is_super_admin`, unauthenticated leaves them empty).
- `RlsIsolationTest` (suite `Rls`): 3 / 3 passed against `blue_dome_app`
  (non-BYPASSRLS role) — confirms cross-tenant SELECT isolation,
  cross-tenant INSERT rejection via `WITH CHECK`, and super-admin global
  visibility, each across two distinct Postgres sessions.
- Adapted starter Auth + Settings + Dashboard tests: 36 / 38 passed, 2
  skipped (`RegistrationTest` auto-skips because `Features::registration()`
  is disabled per the plan).
- Pint (`vendor/bin/pint --dirty --format agent`): passed.
- Wayfinder (`php artisan wayfinder:generate --with-form --no-interaction`):
  regenerated `resources/js/actions` and `resources/js/routes` cleanly.

### Infrastructure provisioned

- `defaultdb` and `blue_dome_testing` on Aiven Postgres 17 — both fully
  migrated with all 17 migration files.
- Postgres extensions enabled (`pgcrypto`, `btree_gist`, `citext`,
  `pg_trgm`).
- Application role `blue_dome_app` created (NOSUPERUSER, NOBYPASSRLS) with
  full DML grants on `public.*` plus default privileges so future migrations
  in `blue_dome_testing` propagate automatically. Credentials live in `.env`
  as `DB_TEST_USERNAME` / `DB_TEST_PASSWORD`; `pgsql_testing_a` and
  `pgsql_testing_b` consume them.

### Shipped

- Sail scaffolding published (`compose.yaml`) with `postgres:16-alpine` and
  `redis:alpine` services; image pinned away from Sail's `postgres:18` default
  to match the guide.
- `boost.json` `sail` flipped to `true`.
- `.env` and `.env.example` rewritten — `pgsql` driver, Redis for session /
  cache / queue, `APP_LOCALE=fr`, `APP_TIMEZONE=Africa/Casablanca`, commented
  WhatsApp / Sentry placeholders.
- `config/database.php` extended with `pgsql_testing`, `pgsql_testing_a`,
  `pgsql_testing_b` connections pointing at the same `blue_dome_testing`
  database (distinct connection names give the RLS isolation test two
  separate PDOs).
- `phpunit.xml` switched to `pgsql_testing` against `blue_dome_testing`.
- Starter user + 2FA migrations removed (`0001_01_01_000000_create_users_table.php`
  and `2025_08_14_170933_add_two_factor_columns_to_users_table.php`).
- 15 new migrations translating `schema.sql` table-by-table, grouped by
  lifecycle (extensions → helper functions → tenants → users/Fortify-compat →
  patients → clinical ops → lab → billing → inventory → messaging → partitions
  → views → RLS-last).
- `App\Models\User`, `App\Models\Clinic`, `App\Models\Branch` rebuilt around
  UUIDs and the schema's column names; `getAuthPassword()` overridden to read
  `password_hash`.
- `app/Actions/Fortify/CreateNewUser.php`, `ResetUserPassword.php`,
  `app/Concerns/ProfileValidationRules.php` adapted to `first_name` /
  `last_name` / `password_hash` and clinic-scoped email uniqueness.
- `app/Http/Controllers/Settings/SecurityController.php` updated to write
  `password_hash` via `forceFill` / `Hash::make`.
- `Features::registration()` disabled in `config/fortify.php` (Phase 1 brings
  the onboarding wizard).
- `database/factories/UserFactory.php` rewritten with `clinicAdmin()`,
  `doctor()`, `secretary()`, `superAdmin()`, `withTwoFactor()`, `unverified()`
  state helpers; `database/factories/ClinicFactory.php` added.
- `database/seeders/DatabaseSeeder.php` reseeds a `Test Clinic` + `Test Admin`.
- `app/Http/Middleware/SetTenantContext.php` added and registered last in the
  `web` group; `app/Jobs/TenantAwareJob.php` abstract base class added.
- `tests/Pest.php` split: `Feature` uses `RefreshDatabase` plus a
  super-admin-bypass `beforeEach`; `Feature/Rls` uses `DatabaseTruncation`
  with per-test super-admin handling.
- Three exit-gate tests: `SchemaIntegrityTest`, `Rls/RlsIsolationTest`,
  `TenantContextMiddlewareTest`.
- Starter Auth + Settings tests adapted (`name` → `first_name`/`last_name`,
  `password` → `password_hash`); `RegistrationTest` auto-skips because the
  feature is now disabled.

### Pending verification

Host machine does not have Docker installed; Sail cannot run. To complete the
Phase 0 verification gate, the user needs to:

1. Install Docker Engine + Docker Compose plugin.
2. `./vendor/bin/sail up -d`.
3. `./vendor/bin/sail artisan migrate:fresh --seed` against `blue_dome`.
4. `./vendor/bin/sail psql -U sail -d blue_dome -c 'CREATE DATABASE blue_dome_testing;'`.
   The Sail compose stub already mounts
   `vendor/laravel/sail/database/pgsql/create-testing-database.sql` which
   creates a `testing` database — we use `blue_dome_testing` explicitly so the
   name matches the `pgsql_testing` config.
5. `./vendor/bin/sail artisan test --compact --filter='SchemaIntegrity|RlsIsolation|TenantContext'`.
6. `./vendor/bin/sail artisan test --compact tests/Feature/Auth tests/Feature/Settings tests/Feature/DashboardTest.php`.
7. `./vendor/bin/sail bin pint --dirty --format agent`.
8. `./vendor/bin/sail artisan wayfinder:generate --with-form --no-interaction`.

Once all green, append a second Phase 0 entry below this section confirming
the test summary, then ask for approval before starting Phase 1.

### Open items raised by Phase 0

See `99-open-questions.md` for the three items raised during this phase.

## Phase 1 — Fortify auth + roles

**Status:** complete. All exit-gate tests green.
**Date:** 2026-05-18.

### Shipped

- `App\Http\Middleware\EnsureRole` registered as the `role` alias in
  `bootstrap/app.php`; routes guard with `->middleware('role:doctor')` etc.
- `App\Http\Responses\LoginResponse` bound in `FortifyServiceProvider`. Sends
  super_admin / clinic_admin / doctor / secretary to their respective panels
  via `Inertia::location`.
- `App\Http\Controllers\PanelController` renders four placeholder Inertia
  pages (`panels/{role}/dashboard.tsx`) so manual visits don't 404 while
  Carbon migration is pending. Routes live under `/super-admin`, `/admin`,
  `/doctor`, `/secretary`, each gated by `auth + verified + role:X`.
- Minimal Eloquent stubs for `Patient`, `Appointment`, `Invoice`,
  `MedicalRecord`, `Prescription`, `DoctorProfile`, `WhatsAppIntegration`
  — full fillable / relationships arrive with each domain phase. The stubs
  exist so policies and the WhatsApp reset extension can reference real
  classes.
- Policies for User, Patient, Appointment, Invoice, MedicalRecord (with the
  24-hour author-edit window), Prescription. Registered in
  `AppServiceProvider::registerPolicies()`. `Controller` base class now uses
  `AuthorizesRequests` so `$this->authorize()` works in subclasses.
- Staff endpoints under `/admin/staff` (`role:clinic_admin`):
  `POST doctors`, `POST secretaries`, `DELETE {user}`,
  `POST {user}/restore`. `StoreDoctorRequest` / `StoreSecretaryRequest`
  enforce the 2 / 3 caps via the `after()` hook so users see a clean 422
  before the trigger ever fires. Restoration re-checks the cap. Creation
  fires a Fortify password reset email as the invite mechanism.
- French / Arabic / English strings for the staff invite + cap messages in
  `lang/{fr,ar,en}/staff.php`.
- `App\Contracts\WhatsAppGateway` + `App\Services\Messaging\NullWhatsAppGateway`
  bound as a singleton. `User::sendPasswordResetNotification()` now sends the
  email reset AND — when the user has a phone and the clinic has an active
  `whatsapp_integration` row — calls the gateway with the signed reset URL.
  The Null implementation logs; Phase 3 swaps in a Meta Graph API client.
- `php artisan app:create-super-admin` seats (or re-seats) a `super_admin`
  on the bootstrap "platform" clinic. `DatabaseSeeder` now seats a
  super_admin + a demo clinic with 1 admin + 2 doctors + 3 secretaries —
  exactly the cap maxima — so an end-to-end manual walkthrough touches
  every role.

### Verification run summary (2026-05-18)

- Full suite: **135 / 137 passed, 2 skipped, 0 failed** (272 assertions in
  ~260 s).
- `LoginRedirectsByRoleTest`: 6 / 6 — each of the four roles lands on the
  right panel, and a cross-role visit (doctor → /admin, clinic_admin →
  /super-admin) is rejected with 403 by the `role` middleware.
- `AccountCapsTest`: 5 / 5 — caps fire at 2 doctors / 3 secretaries; a
  doctor cannot create another doctor (403); restoration is re-checked
  against the cap and refused when full; freeing a seat via soft-delete
  re-enables creation.
- `PasswordResetTest`: 8 / 8 — Fortify email reset works as before; new
  cases verify (a) the WhatsApp gateway is invoked when phone +
  whatsapp_integration are both present and active, (b) skipped when phone
  is null, (c) skipped when no integration row exists.
- Pint: passed. Wayfinder: regenerated `resources/js/actions` and
  `resources/js/routes` cleanly.

### Carry-over for Phase 2

- The Carbon panel code in `.claude/frontend/` needs to be migrated into
  the new `resources/js/pages/panels/{admin,doctor,secretary}/`
  placeholders. Backend contracts for the patients module land in Phase 2
  and will inform the props each panel renders.
- `App\Models\Patient`, `Appointment`, `Invoice`, `MedicalRecord`,
  `Prescription`, `WhatsAppIntegration` are stubs — fillable / casts /
  relationships fill in as each phase touches them.

## Phase 2 — Patients module

**Status:** complete. All exit-gate tests green. Awaiting approval before
starting Phase 3.
**Date:** 2026-05-18.

### Shipped

- Schema deviation migration `2026_05_18_000010_widen_patient_pii_columns.php`
  widens `patients.national_id` and `patients.insurance_number` from
  VARCHAR(100) to TEXT. The view `v_patients` had to be dropped and
  recreated because Postgres pinned its column types through the view.
- `App\Models\Patient` rewritten with full `$fillable`, `$hidden` (national_id /
  insurance_number never leak to JSON by default), `encrypted` casts on PII,
  date casts, relationships (`clinic`, `branch`, `communicationPreferences`,
  `vitalSigns`, `createdBy`), and `scopeForCurrentClinic()`.
- `App\Models\PatientCommunicationPreference`, `App\Models\VitalSigns`,
  `App\Models\ClinicSequence`, `App\Models\DoctorProfile` added (the last
  was already in place from Phase 1; the others are new).
- `App\Services\SequenceService` wraps the race-safe Postgres function
  `fn_next_seq()`.
- `App\Observers\ClinicObserver::created` bulk-inserts the seven per-clinic
  sequence rows via `insertOrIgnore` so re-seeds don't blow up. Fixes a
  Phase 1 latent bug where `CreateNewUser` / seeder / artisan command all
  created clinics without sequences.
- `App\Observers\PatientObserver::creating` auto-allocates `patient_code`
  from the sequence and stamps `created_by` from `Auth::id()`. `::created`
  ensures the prefs row exists via `firstOrCreate` — idempotent with the
  Postgres trigger `trg_patients_default_prefs`.
- `App\Http\Controllers\PatientController` — resource controller with
  explicit `$this->authorize()` calls (Laravel 11+ bare controllers don't
  support `authorizeResource()` without `HasMiddleware`). Index query
  scopes explicitly to `clinic_id` for non-super_admin actors — defense in
  depth alongside RLS.
- `App\Http\Controllers\Patient\VitalSignsController` — index + store, no
  update/delete (deferred to Phase 4 medical-records context).
- FormRequests under `app/Http/Requests/Patient/`: `StorePatientRequest`,
  `UpdatePatientRequest`, `StoreVitalSignsRequest` with clinic-scoped
  uniqueness for patient_code / national_id, E.164 phone regex, branch_id
  cross-clinic check, and vital-signs physiological ranges.
- Routes: `Route::resource('patients', PatientController::class)` plus
  `GET/POST patients/{patient}/vital-signs` under
  `role:super_admin,clinic_admin,doctor,secretary` (the policy filters
  per action — e.g. super_admin's create is denied with 403).
- Inertia placeholder pages in `resources/js/pages/patients/` (index, show,
  create, edit, vital-signs.tsx). Carbon migration is still pending.
- Tightened `PatientPolicy::update()` to exclude super_admin (clinic-staff
  workflow per the matrix). View access remains cross-tenant for
  super_admin reporting.
- Localization: `lang/en/validation.php` extended with patient-field
  attribute names; full attribute translations added to `lang/fr/validation.php`
  and `lang/ar/validation.php` (Laravel falls back to en for message bodies
  until Phase 9). Module strings in `lang/{fr,ar,en}/patients.php`.
- `PatientFactory` (Moroccan-flavored names, +212 phones, MA country) plus
  `withInsurance()`, `withNationalId()`, `softDeleted()` state helpers.
  `VitalSignsFactory` produces healthy adult ranges by default.
- `php artisan lang:publish` was run; observers registered in
  `AppServiceProvider::registerObservers()`.

### Verification run summary (2026-05-18)

- Full suite: **171 / 173 passed, 2 skipped, 0 failed** (384 assertions in
  ~390 s).
- `tests/Feature/Patients/PatientCrudTest`: 11 / 11 — per-role matrix for
  index/store/update/destroy, plus a duplicate patient_code rejection.
- `tests/Feature/Patients/CrossClinicIsolationTest`: 4 / 4 — clinic A's
  admin sees only clinic A's patients on the Inertia index; cross-clinic
  reads/updates return 403 (test acknowledges the `avnadmin` BYPASSRLS
  caveat — production behavior would be 404 from RLS, exercised by the
  RLS suite); super_admin sees all four patients across both clinics.
- `tests/Feature/Patients/PatientEncryptionTest`: 3 / 3 — `national_id`
  and `insurance_number` stored as ciphertext (raw query returns a string
  >100 chars that does NOT match input), Eloquent decrypts back to
  plaintext, both columns hidden from `toArray()`.
- `tests/Feature/Patients/PatientSequenceTest`: 4 / 4 — codes increment
  per clinic (`PAT-000001`, `PAT-000002` etc.); each clinic has its own
  series; ClinicObserver writes 7 sequence rows on `created`; re-firing
  the observer is idempotent.
- `tests/Feature/Patients/VitalSignsTest`: 6 / 6 — store works for
  clinic_admin/doctor/secretary; super_admin gets 403; cross-clinic
  blocked; the GENERATED `bmi` column computes 22.86 for 70 kg / 175 cm;
  history returned latest-first; out-of-range readings 422.
- `tests/Rls/RlsIsolationTest` (re-run as smoke): 3 / 3 still green —
  widen migration didn't disturb RLS policies.
- Seeder re-applied: 14 sequence rows (7 × 2 clinics) confirms
  ClinicObserver wiring through both fresh-create and idempotent paths.
- Pint clean. Wayfinder regenerated `resources/js/actions` and
  `resources/js/routes` — `patients` action functions now available to
  the frontend.

### Carry-over for Phase 3

- Carbon panel migration still pending; index/show/create/edit/vital-signs
  TSX files exist as placeholders.
- `App\Models\Appointment`, `Invoice`, `MedicalRecord`, `Prescription`,
  `WhatsAppIntegration` are still stubs; Phase 3 fleshes out Appointment
  + WhatsAppIntegration.
- AuditObserver + ActivityLog model deferred per Phase 2 plan
  (open question #8). Recommend landing it before Phase 4 so prescriptions
  and medical records get audited from the start.

## Phase 3 — Appointments + WhatsApp confirmation

**Status:** complete. All exit-gate tests green.
**Date:** 2026-05-18.

### Shipped

- `App\Models\Appointment` fleshed out from Phase 1 stub: full fillable,
  datetime/decimal casts, every belongsTo, hasMany vitalSigns,
  `isConfirmationTokenValid()` helper, and `scopeNeedsFollowUp` mirroring
  the `v_appointments_needing_followup` view.
- `App\Models\MessageTemplate` with `{{key}}` interpolation (missing keys
  stay visible to surface in QA). `App\Models\MessageLog` (write-mostly,
  composite-PK partitioned table; Eloquent uses `id` as logical key,
  `$timestamps = false`).
- `App\Models\Patient::appointments()` hasMany added.
- Factories: AppointmentFactory + state helpers (`confirmed`, `cancelled`,
  `pendingConfirmation`, `expiredToken`, `needingFollowUp`), MessageTemplateFactory,
  MessageLogFactory.
- WhatsAppGateway contract extended with `sendAppointmentConfirmation`
  (returns message_log id). NullWhatsAppGateway writes a real row to the
  partitioned `message_log` so the exit-gate test asserts without a Meta
  API mock.
- `App\Events\AppointmentCreated` + `AppointmentConfirmed`.
  `AppointmentObserver::creating` allocates appointment_number from the
  sequence (APT-…), generates a 64-char `confirmation_token` + 48h expiry,
  stamps `appointment_day` from `scheduled_start`. `created` dispatches
  the event.
- `App\Listeners\SendAppointmentConfirmationListener` implements
  `ShouldQueueAfterCommit` so the worker sees the committed row. The
  job extends `TenantAwareJob`, runs on the `whatsapp` queue with
  `[60, 300, 1800]` backoff and `tries = 3`.
- `App\Http\Controllers\AppointmentController`: resource + custom `cancel`
  + `recordFollowUp` + public `confirm(string $token)` (200 on success,
  410 on invalid/expired, idempotent on re-click). Same explicit-authorize
  + clinic_id defense-in-depth pattern as Phase 2.
- FormRequests with **pre-flight GiST overlap check** so the same SQL the
  `excl_doctor_no_overlap` constraint uses returns a clean 422 instead of
  the trigger's 500. Update path excludes the current row.
- `App\Http\Controllers\Secretary\FollowUpController` queries
  `v_appointments_needing_followup` directly (no model — the view IS the
  filter) and paginates.
- `App\Http\Controllers\WebhookController`: GET handshake echoes
  hub_challenge only when the verify-token matches one of the active
  `whatsapp_integration` rows (compared decrypted); POST status callback
  parses Meta's nested entry/changes/value/statuses shape and updates
  `message_log.status` + delivered_at / read_at / failed_at.
- Routes: public `GET appointments/confirm/{token}` + `GET/POST webhooks/whatsapp`;
  authenticated `Route::resource('appointments')` + `cancel` +
  `follow-up-call`; `/secretary/follow-up` under role:clinic_admin,secretary.
- Inertia placeholder pages: `appointments/{index,show,create,edit,confirmation-result}.tsx`
  + `secretary/follow-up.tsx`. The confirmation-result page is the only
  unauthenticated patient-facing view and renders fr+ar+en messaging.
- `MessageTemplateSeeder` seeds 9 rows (3 templates × 3 locales) for the
  demo clinic, wired into the DatabaseSeeder chain.
- `lang/{fr,ar,en}/appointments.php` for module strings.

### Verification run summary (2026-05-18)

- Full suite: **196 / 198 passed, 2 skipped, 0 failed** (455 assertions
  in ~520 s).
- `AppointmentCrudTest`: 6 / 6 — per-role index + store matrix
  (super_admin denied on create per policy); cancel works for secretary;
  cross-clinic patient_id rejected at validation.
- `AppointmentConfirmationTest`: 5 / 5 — full end-to-end (create →
  observer stamps token → listener fires NullGateway → message_log row
  written → patient hits token URL → status flips to
  `confirmed_by_patient` + AppointmentConfirmed event dispatched);
  expired token → 410; unknown token → 410; second click idempotent
  (timestamp preserved); phoneless patient path skips the send.
- `AppointmentFollowUpTest`: 4 / 4 — secretary records outcome; doctor
  cannot (matrix); follow-up queue page reads
  `v_appointments_needing_followup`; attempt counter increments per call.
- `AppointmentOverlapTest`: 3 / 3 — overlap returns 422 (clean
  pre-flight); back-to-back allowed (`[)` exclusive upper bound);
  cancelled appointments excluded from overlap.
- `WebhookTest`: 3 / 3 — Meta handshake echoes hub_challenge; wrong
  token gets 403; delivery callback updates `message_log.status` +
  delivered_at.
- Pint clean. Wayfinder regenerated `resources/js/actions` + `routes`.

### Carry-over for Phase 4

- AuditObserver + ActivityLog still deferred. Strong recommendation:
  land it before Phase 4 medical records so the encrypted clinical
  notes are audited from the start.
- `App\Models\Invoice`, `MedicalRecord`, `Prescription` still stubs;
  Phase 4 fleshes out the latter two (Invoice waits for Phase 5).
- Reminder jobs (24h / 2h pre-appointment) not built yet — templates
  are seeded but no scheduled dispatcher. Phase 9 wires
  `Schedule::command('appointments:dispatch-reminders')`.
- No production WhatsApp gateway impl yet — Phase 9 swaps
  `NullWhatsAppGateway` for `MetaWhatsAppGateway` that calls the Graph
  API with the decrypted `whatsapp_integration.access_token_enc`.

## Phase 4 — Prescriptions, lab orders, medical records (+ audit observer)

**Status:** complete. All exit-gate tests green.
**Date:** 2026-05-18.

### Shipped

- **Cross-cutting prerequisite** (resolves open question #8):
  `App\Models\ActivityLog` — write-only Eloquent model against the
  partitioned `activity_log` table (composite PK `(id, created_at)`,
  `$timestamps = false`, casts on `old_values` / `new_values`).
  `App\Observers\AuditObserver` records `create / update / soft_delete /
  delete / restore` actions with sanitized snapshots (model `$hidden`
  attributes are excluded so encrypted SOAP fields never leak through
  the audit row). Registered on `Patient`, `Appointment`, `Prescription`,
  `LabOrder`, `MedicalRecord`, `User`; `Invoice` / `Payment` /
  `PatientShareRequest` get it as their phases land.
- **Medications + drug interactions:** `Medication` model
  (HasUuids + SoftDeletes, `requires_prescription` / `is_active` boolean
  casts), `DrugInteraction` model (immutable reference data,
  `UPDATED_AT = null`, schema's `medication_id_1 < medication_id_2`
  invariant honoured by the factory's `forPair()` state). Clinic-admin
  manages the formulary; doctors and secretaries read it. `MedicationController`
  exposes pg_trgm-backed fuzzy search via `idx_medications_trade_trgm`.
- **Prescriptions:** `Prescription` model expanded from the Phase 1 stub
  with full `$fillable`, date/datetime/bool casts, every belongsTo
  (`clinic`, `patient`, `doctor`, `appointment`, `printedBy`) and
  `items()` hasMany. `PrescriptionItem` is append-only (no `updated_at`,
  no soft delete). `PrescriptionObserver` allocates `prescription_number`
  via `SequenceService` (`RX-…`) and stamps `doctor_id = Auth::id()` if
  not provided. `PrescriptionController` wraps `Prescription::create()` +
  nested items in a single transaction. `StorePrescriptionRequest::after()`
  runs a single SQL pre-flight against `drug_interactions` to catch
  major/moderate pairs and surface a localized 422 — keeps the trigger /
  CHECK constraints as last-line defenses.
- **Lab orders:** `LabOrder` + `LabOrderItem` + `ExternalLab` models.
  `LabOrderObserver` allocates `lab_order_number` (`LAB-…`).
  `LabOrderController` provides CRUD + `recordResults()` (doctor or
  secretary), which updates each item's `result_status` / `is_abnormal` /
  `is_critical`, stamps `reviewed_by` / `reviewed_at` on the parent and
  flips status to `completed` when every item has a result, or
  `partially_completed` otherwise.
- **Medical records:** `MedicalRecord` model rebuilt from the Phase 1
  stub. The IG security rules table calls for encrypting `diagnosis` and
  `notes`; neither column exists in the schema, so the encryption is
  mapped onto the structured SOAP TEXT fields (`content`, `subjective`,
  `objective`, `assessment`, `plan`) — all five are cast `encrypted` and
  listed in `$hidden` so casual `toArray()` never leaks clinical text.
  Controllers expose them explicitly via a separate `clinical` prop the
  same way `PatientController` exposes decrypted PII. `MedicalRecordObserver`
  stamps `recorded_by` on `creating` and `signed_by` / `signed_at` on
  the `is_signed = true` transition. `MedicalRecordPolicy` keeps the
  Phase 1 24-hour author-edit window and adds a `sign()` ability.
- **Seeders:** `MedicationSeeder` — 10 Moroccan-market drugs per clinic
  (Doliprane, Brufen, Clamoxyl, Coumadine, Aspégic, Zestril, Aldactone,
  Glucophage, Tahor, Mopral). `DrugInteractionSeeder` — three logical
  pairs per clinic (warfarine + aspirine = major, lisinopril +
  spironolactone = moderate, metformine + atorvastatine = minor), each
  resolved against the local clinic's medication UUIDs and sorted to
  honour the `< ` check constraint. `ExternalLabSeeder` — CERBA Maroc,
  Pasteur Maroc, BIOSMUR Casablanca per clinic.
- **Routes** added inside the existing
  `role:super_admin,clinic_admin,doctor,secretary` group:
  `Route::resource('medications')`, `Route::resource('prescriptions')`,
  `Route::resource('lab-orders')` + `POST lab-orders/{}/results`,
  `Route::resource('medical-records')->except(['destroy'])` + `POST
  medical-records/{}/sign`. Wayfinder regenerated cleanly.
- **Localization:** module strings in `lang/{fr,ar,en}/medications.php`,
  `prescriptions.php`, `lab_orders.php`, `medical_records.php` (English
  bodies fall through for any missing French/Arabic per the Phase 2
  precedent until Phase 9).
- **Inertia placeholder pages** under `resources/js/pages/{medications,
  prescriptions,lab-orders,medical-records}/{index,show,create,edit}.tsx`
  so the Carbon migration has a target and Wayfinder regen doesn't 404
  on manual visits.

### Verification run summary (2026-05-18)

- Phase 4 test slice (`Audit|Medications|Prescriptions|LabOrders|
  MedicalRecords`): **52 / 52 passed, 0 failed, 0 skipped**
  (112 assertions in ~542 s against Aiven Postgres 17).
  - `AuditObserverTest` 3/3 — create / update (old + new values) /
    soft_delete activity_log rows present for Patient writes.
  - `MedicationCrudTest` 8/8 — role matrix, fuzzy pg_trgm search,
    `(clinic_id, trade_name, strength, form)` clinic-scoped uniqueness.
  - `PrescriptionCrudTest` 6/6 — only doctors create (super_admin /
    clinic_admin / secretary all 403); cross-clinic patient rejected at
    validation.
  - `PrescriptionSequenceTest` 1/1 — `RX-NNNNNN`, monotonically
    incrementing per clinic, distinct series across clinics.
  - `DrugInteractionWarningTest` 4/4 — major and moderate pairs return
    clean 422 with localized `prescriptions.drug_interaction_*`; minor
    pair passes; pair with no recorded interaction passes.
  - `LabOrderCrudTest` 9/9 — role matrix for list / create; doctor or
    secretary can record results, clinic_admin and super_admin cannot;
    cross-clinic patient rejected.
  - `LabOrderSequenceTest` 1/1 — `LAB-NNNNNN`, per-clinic series.
  - `MedicalRecordCrudTest` 6/6 — only doctors create; author-edit
    24-hour window enforced (stranger doctor 403 even within window;
    author 403 after window); `sign()` flips `is_signed` and stamps
    `signed_by` / `signed_at`.
  - `MedicalRecordEncryptionTest` 2/2 — raw rows for `content`,
    `subjective`, `objective`, `assessment`, `plan` are ciphertext;
    Eloquent decrypts back to plaintext; all five hidden from
    default `toArray()`.
  - `MedicalRecordCrossClinicTest` 1/1 — clinic B's doctor 403 against
    clinic A's record; super_admin 200.
- Pint (`vendor/bin/pint --dirty --format agent`): passed.
- Wayfinder regenerated `resources/js/actions/` — `MedicationController.ts`,
  `PrescriptionController.ts`, `LabOrderController.ts`, `MedicalRecordController.ts`
  all present.

### Open items raised by Phase 4

- Open question #8 (AuditObserver + ActivityLog) **resolved** by this
  phase.
- Open question #9 **opened** — `medical_records.diagnosis` and
  `medical_records.notes` named by the IG do not exist; encryption was
  applied to the structured SOAP fields instead. See
  `99-open-questions.md` for the proposed reconciliation paths.

### Carry-over for Phase 5

- `Invoice` and `Payment` models still stubs — Phase 5 fleshes them out
  along with cash + bank_wire gateways; `PaymentGateway` interface lives
  at `App\Contracts\PaymentGateway` (to be created with Phase 5).
- `MessageLog`, `Notification`, `ActivityLog`, `PatientShareRequest`
  are not (yet) on `AuditObserver`. The IG only requires `ActivityLog`
  / `MessageLog` / `Notification` to be skipped; `PatientShareRequest`
  joins when Phase 8 lands.
- Carbon panel migration still pending across all modules; placeholder
  TSX pages live alongside the patient / appointment placeholders.

## Phase 5 — Billing (cash + bank_wire)

**Status:** complete. Phase 5 exit-gate tests green.
**Date:** 2026-05-18.

### Shipped

- **Models:** `Invoice` rebuilt from the Phase 1 stub with full `$fillable`,
  decimal casts on `subtotal` / `discount_amount` / `tax_percentage` /
  GENERATED `tax_amount` / `total` / `balance_due` / `paid_amount`, every
  belongsTo and `items()` + `payments()` hasMany. New models: `InvoiceItem`
  (append-only, no `updated_at`, no soft-delete — schema only has
  `created_at`), `Payment` (HasUuids + SoftDeletes, `amount > 0` schema
  check, payment_method limited to `cash` and `bank_wire` per the
  Postgres CHECK constraint), `Expense` (HasUuids + SoftDeletes,
  `is_recurring` + frequency + end-date), `Vendor` (clinic-scoped catalog).
- **PaymentGateway abstraction:** `App\Contracts\PaymentGateway` interface
  (`charge()`, `refund()`, `verifyWebhook()`) returning
  `App\Services\Payments\PaymentResult` value objects. Fully-implemented
  `CashGateway` and `BankWireGateway` write rows whose INSERT trips
  `trg_payments_sync_invoice` → `fn_sync_invoice_paid_amount()` to keep
  `invoices.paid_amount` in lock-step with completed-payment totals.
  `CmiGateway` and `StripeGateway` are stubs that raise
  `App\Exceptions\NotImplementedException` on every call — these gateway
  classes exist so the routing table is shaped for Phase 9+ while no
  fake payments can leak through. `PaymentGatewayManager` resolves by
  method string (`for('cash')`) and is bound as a singleton in
  `AppServiceProvider::register()`.
- **Observers:** `InvoiceObserver`, `PaymentObserver`, `ExpenseObserver`
  each allocate their per-clinic sequence number via `SequenceService`
  (`INV-…`, `PAY-…`, `EXP-…`) and stamp `created_by` /
  `received_by` from `Auth::id()` on `creating`. All three are registered
  alongside `AuditObserver` in `AppServiceProvider::registerObservers()`.
- **Controllers:** `InvoiceController` — resource CRUD; `store` computes
  `subtotal` from items and persists invoice + items in a transaction
  (the GENERATED columns recompute on the next read). `PaymentController`
  — `store(StorePaymentRequest)` dispatches through `PaymentGatewayManager`
  and reconciles `invoices.status` to `paid` / `partially_paid` after
  the trigger updates `paid_amount`. `refund(Payment)` calls the same
  gateway's `refund()` and runs the same status reconciliation.
  `ExpenseController` and `VendorController` — vanilla resource CRUD
  scoped to clinic_admin per the IG matrix.
- **Policies:** `InvoicePolicy` already shipped in Phase 1 — Phase 5
  uses its existing `viewAny / view / create / update / recordPayment /
  refundPayment / delete` set unchanged. New: `PaymentPolicy`
  (clinic_admin only for `refund`), `ExpensePolicy` (clinic_admin only
  for create/update/delete; clinic_admin + super_admin for view),
  `VendorPolicy` (same shape as expenses). All four registered in
  `AppServiceProvider::registerPolicies()`.
- **FormRequests:** `Store/UpdateInvoiceRequest` (nested items array),
  `StorePaymentRequest` (`payment_method` limited to `cash` / `bank_wire`
  to match the schema CHECK), `Store/UpdateExpenseRequest` (category
  + recurring frequency enum), `Store/UpdateVendorRequest`. All requests
  use the clinic-scoped `Rule::exists(...)->whereNull('deleted_at')`
  pattern for cross-clinic safety.
- **Routes** added inside the existing
  `role:super_admin,clinic_admin,doctor,secretary` group:
  `Route::resource('invoices')`, `POST payments`, `POST payments/{}/refund`,
  `Route::resource('expenses')`, `Route::resource('vendors')`.
- **Localization:** module strings in `lang/{fr,ar,en}/` for
  `invoices.php`, `payments.php`, `expenses.php`, `vendors.php`.
- **Inertia placeholder pages** under `resources/js/pages/{invoices,
  expenses,vendors}/{index,show,create,edit}.tsx`.
- **AuditObserver coverage** extended to `Invoice`, `Payment`, `Expense`
  alongside the Phase 4 models.

### Verification run summary (2026-05-18)

- Phase 5 test slice (`Invoices|Payments|Expenses|Vendors`):
  - Initial run: 34 / 39 passed with 5 Aiven `ALTER TABLE … ENABLE
    ROW LEVEL SECURITY` deadlocks on the `ExpenseCrudTest` migration
    setup (same flake observed during Phase 4 testing).
  - Re-run of the failed slice: **10 / 10 passed clean** (101 s) — confirms
    the failures were transient Postgres deadlocks during concurrent
    RefreshDatabase migrations on Aiven, not code defects.
  - **All 39 Phase 5 tests pass on a clean re-run.**
  - `InvoiceCrudTest` — role matrix (super_admin / clinic_admin /
    secretary list; doctor 403); only clinic_admin and secretary create
    (doctor + super_admin 403); cross-clinic patient rejected.
  - `InvoiceSequenceTest` — `INV-NNNNNN` allocation, per-clinic series,
    monotonic increment.
  - `CashPaymentTriggerTest` (4 tests) — recording a 400-of-1000 cash
    payment flips `invoices.status` to `partially_paid` and
    `balance_due` to 600 via the trigger; recording exact-amount cash
    flips to `paid` with `balance_due` = 0; doctor cannot record a
    payment (403); secretary can record a `bank_wire` payment with
    `reference_number` + `bank_name`.
  - `PaymentRefundTest` (2 tests) — refund flips `payment_status` to
    `refunded`, trigger re-syncs `paid_amount` back to 0 and the
    controller reconciles `invoices.status` to `pending`; only
    clinic_admin can refund (super_admin / doctor / secretary all 403).
  - `PaymentSequenceTest` — 20 sequential payment inserts allocate
    20 distinct `PAY-NNNNNN` numbers (no duplicates).
  - `ExpenseCrudTest` (3 tests) — role matrix; `EXP-NNNNNN` allocation.
  - `VendorCrudTest` — only clinic_admin can create vendors.
- Pint (`vendor/bin/pint --dirty --format agent`): clean.
- Wayfinder regenerated `resources/js/actions/` —
  `InvoiceController.ts`, `PaymentController.ts`, `ExpenseController.ts`,
  `VendorController.ts` all present.

### Open items raised by Phase 5

- **Aiven test-DB stability note:** the `Feature` test pool with
  `RefreshDatabase` runs RLS-enabling DDL during the migration phase,
  and Aiven Postgres occasionally deadlocks two parallel test workers
  on `ALTER TABLE … ENABLE ROW LEVEL SECURITY`. Failures are transient
  and pass on re-run. If the deadlock becomes chronic, the runbook
  options are: (a) run `--parallel=1` for the migration step, or
  (b) split the RLS migration into per-table `ALTER`s with explicit
  `pg_advisory_xact_lock` to serialise. No code change needed for
  current Phase 5 sign-off; flag for the runbook.

### Carry-over for Phase 6

- `Invoice` / `Payment` / `Expense` / `Vendor` are now audited via
  `AuditObserver`.
- Inventory + documents (Phase 6) will reuse the `MedicationPolicy`-style
  clinic-admin-manages, all-staff-read pattern and the
  `LabOrderController::recordResults`-style nested-update controller
  pattern.
- The CMI and Stripe gateway stubs intentionally raise
  `NotImplementedException` — when those gateways become real
  (post-Phase 9), the `payments.payment_method` CHECK constraint must
  be extended to include `cmi` and `stripe`.

## Phase 6 — Inventory + documents

**Status:** complete. Phase 6 exit-gate tests green.
**Date:** 2026-05-18.

### Shipped

- **Models:** `Inventory` (HasUuids + SoftDeletes; `quantity_in_stock` /
  `min_stock_level` decimal-2; `requires_refrigeration` bool;
  `category` enum constrained to medication / supplies / equipment /
  office_supplies). `InventoryTransaction` (append-only: no `updated_at`,
  no soft-delete; `transaction_type` enum with 9 values; `total_amount`
  is a Postgres GENERATED column from `quantity * unit_price`; `reverses_id`
  self-FK supports tombstoning a prior transaction). `Document` (full
  metadata + JSONB `tags` / `metadata` arrays; `is_private` / `is_archived`
  / `is_shared` / `is_encrypted` bools). `DocumentFolder` (per-clinic
  hierarchy via `parent_folder_id` self-FK; `is_system` flag protects
  built-in folders from edit/delete).
- **Observer-driven stock sync:** the schema does NOT ship a trigger for
  `inventory.quantity_in_stock` ←→ `inventory_transactions` — the math
  lives in `App\Observers\InventoryTransactionObserver`. Direction table:
  `purchase` / `return` / `adjustment` → +quantity (adjustment honours
  the caller's sign); `sale` / `consumption` / `expired` / `damaged` /
  `transfer` → −quantity; `reversal` mirrors the referenced transaction.
  Uses `DB::table('inventory')->update(['quantity_in_stock' => DB::raw('… + (…)')])`
  to keep the update atomic and race-free under concurrent writes.
- **Document storage:** `DocumentController::store()` writes uploaded
  files to the default `local` disk (Laravel 11+ → `storage/app/private/`)
  under a clinic-scoped prefix `clinics/{clinic_id}/{sha256}.{ext}`. The
  `clinic_id`-prefixed path mirrors the DB-level RLS isolation: even a
  filesystem traversal that bypasses the controller couldn't cross
  clinics without traversing the directory tree.
- **Controllers:** `InventoryController` (resource CRUD + `alerts()`
  reading the `v_inventory_alerts` Postgres view, ordered by severity).
  `InventoryTransactionController::store(Inventory $inventory)` — single
  scoped endpoint at `POST inventory/{inventory}/transactions`.
  `DocumentController` (index, store, show, destroy + `download()` that
  streams the file through `Storage::disk('local')->download(...)` after
  the policy gate fires). `DocumentFolderController` (index, store,
  destroy — folders are flat-ish, edits are rare).
- **Policies:** `InventoryPolicy` (viewAny: all staff + super_admin;
  create/update: clinic_admin + secretary per IG matrix; delete:
  clinic_admin only; `recordTransaction` mirrors update). `DocumentPolicy`
  (create: clinic_admin + doctor + secretary per IG matrix; delete:
  clinic_admin only). `DocumentFolderPolicy` (clinic_admin + secretary
  manage; `is_system = true` folders cannot be edited or deleted). All
  three registered in `AppServiceProvider::registerPolicies()`.
- **FormRequests:** `Store/UpdateInventoryRequest` (clinic-scoped unique
  `item_code` with `whereNull('deleted_at')` ignoring the current row
  on update), `StoreInventoryTransactionRequest`, `StoreDocumentRequest`
  (`max:20480` KB file size; `document_type` enum with 16 values;
  required `entity_type` + `entity_id`), `StoreDocumentFolderRequest`.
- **Routes** added inside the existing
  `role:super_admin,clinic_admin,doctor,secretary` group:
  `GET inventory/alerts`, `Route::resource('inventory')`,
  `POST inventory/{inventory}/transactions`,
  `Route::resource('document-folders')->only(['index','store','destroy'])`,
  `Route::resource('documents')->except(['create','edit','update'])`,
  `GET documents/{document}/download`.
- **Localization:** module strings in `lang/{fr,ar,en}/` for
  `inventory.php`, `documents.php`, `document_folders.php`.
- **Inertia placeholder pages** under `resources/js/pages/{inventory,
  documents,document-folders}/`.
- **AuditObserver coverage** extended to `Inventory` and `Document`.
  `InventoryTransaction` deliberately *not* audited (high-volume ledger,
  same skip list as MessageLog/Notification per the IG spirit).

### Verification run summary (2026-05-18)

- Phase 6 test slice (`Inventory|Documents`):
  - Initial run: 10 / 19 passed with 9 transient Aiven `ALTER TABLE …
    ENABLE ROW LEVEL SECURITY` deadlocks (same flake reported in Phase
    5's open-items note).
  - Re-run of the failed slice: **10 / 10 passed clean** (96 s).
  - **All 19 Phase 6 tests pass on a clean re-run.**
  - `InventoryTransactionTest` (5 tests) — purchase adds 25 to a 10-unit
    starting stock → 35; consumption of 12 from 50 → 38; sale of 7 from
    100 → 93; negative `adjustment` of −3 from 20 → 17; doctor receives
    403 on the transactions endpoint.
  - `InventoryAlertsViewTest` (4 tests) — `v_inventory_alerts` flags
    a quantity=2/min=5 row as `low_stock`, an expires-in-15-days row
    as `expiring_soon`, a quantity=0 row as `out_of_stock`; the
    controller endpoint returns 200 for clinic_admin.
  - `DocumentUploadTest` (6 tests, the role-matrix data set explodes to
    4) — file is stored at `clinics/{clinic_id}/…` on the `local` disk
    and metadata persists with `uploaded_by` stamped; clinic B's admin
    receives 403 trying to download clinic A's document; per the role
    matrix only `clinic_admin` can delete (super_admin / doctor /
    secretary all 403).
- Pint (`vendor/bin/pint --dirty --format agent`): clean.
- Wayfinder regenerated `resources/js/actions/` —
  `InventoryController.ts`, `InventoryTransactionController.ts`,
  `DocumentController.ts`, `DocumentFolderController.ts` all present.

### Carry-over for Phase 7

- `InventoryTransaction` is unaudited by design; if the super-admin
  panel (Phase 7) needs a stock-movement audit, it should read directly
  from `inventory_transactions` (already an immutable ledger by
  schema).
- `Document` storage uses the `local` disk. Production deployment
  (Phase 9) may want to swap to S3-compatible object storage for
  durability and offsite backups — the disk-name constant in
  `DocumentController` is the single switch.
- The IG permission matrix says doctor can manage documents for "own
  patients only". The current `DocumentPolicy` enforces clinic
  isolation but not patient-ownership. Add a `viewPatientDocuments`
  ability + a controller-side filter in a later phase if/when the
  doctor surface needs the tighter restriction.

## Phase 7 — Super-admin panel + cross-tenant reporting

**Status:** complete. Phase 7 exit-gate tests green. Awaiting approval
before starting Phase 8.
**Date:** 2026-05-20.

### Shipped

- **Schema deviation migration**
  `2026_05_19_000010_extend_activity_log_action_check.php` drops the
  inherited `activity_log_action_check` constraint and re-adds it with
  three new actions appended: `impersonated`, `left_impersonation`, and
  `subscription_changed`. The CHECK lives on the partitioned parent so
  every child partition (and any future month created by
  `fn_create_monthly_partitions`) inherits the widened list. `down()`
  reverts to the original 23-value list. Tracked as open question #10.
- **`config/billing.php`** introduces placeholder plan prices in MAD
  (`free → 0`, `basic → 199`, `professional → 499`,
  `enterprise → 1499`). The dashboard reads
  `config('billing.plan_prices')` and renders a "placeholder pricing"
  hint so the figure isn't mistaken for canonical. Tracked as open
  question #11.
- **`App\Policies\ClinicPolicy`** — `viewAny / view / suspend / restore`
  all return `$actor->role === 'super_admin'`. Registered in
  `AppServiceProvider::registerPolicies()`.
- **`App\Services\SuperAdminMetricsService`** — read-only aggregator.
  `totalClinics`, `activeClinics` (active + trial),
  `mrr` (sums `plan_prices` × clinic-counts of `subscription_status =
  'active'`, returns `{currency, amount, by_plan}`),
  `activeAppointmentsToday`, `recentSignups`, `appointmentCountByClinic`
  (last 7 days, top 10). Class PHPDoc warns: never call from a
  non-super_admin context — the RLS bypass relies on `app.is_super_admin
  = 'true'` set by `SetTenantContext`.
- **`App\Services\ImpersonationService`** — `start(impersonator,
  target)` writes the `activity_log` row first (`action='impersonated'`,
  `clinic_id = target->clinic_id`, `user_id = impersonator->id`,
  snapshot in `new_values`), then `session()->put('impersonator_id',
  …)` and `Auth::loginUsingId($target->id)`. Defensive role checks
  re-asserted at the service layer so artisan/job callers get the same
  ValidationException the HTTP route would have produced. `stop()`
  mirrors with `action='left_impersonation'`. `isImpersonating`/
  `impersonator(Request)` feed the Inertia shared prop.
- **Controllers** under `app/Http/Controllers/SuperAdmin/`:
  `DashboardController` (renders metrics + deferred
  `appointment_counts_by_clinic`), `ClinicController` (`index`, `show`,
  `suspend(SuspendClinicRequest, Clinic)`, `restore(RestoreClinicRequest,
  Clinic)`; transactional snapshot → `forceFill → save` → explicit
  `subscription_changed` activity-log row), `ImpersonationController`
  (`store(StartImpersonationRequest, User)`, `destroy(Request)`),
  `ActivityLogController` (paginated cross-tenant read with
  `clinic:id,name` + `user:id,first_name,last_name,email` eager-loaded).
- **`HandleInertiaRequests::share`** appends an `impersonating` shared
  prop. `null` outside an impersonation session, otherwise
  `{ impersonator: { id, first_name, last_name } }` resolved via the
  service — drives the eventual Carbon panel's "Leave impersonation"
  banner.
- **AuditObserver coverage** extended to `Clinic` so generic field
  updates land in `activity_log` as `action='update'` alongside the
  explicit `subscription_changed` business event row written by the
  controller (intentional dual-row behavior — exit-gate test asserts
  existence of the explicit row, not exclusivity).
- **Routes** — within the existing `role:super_admin` group:
  `GET /super-admin → super-admin.dashboard`,
  `GET /super-admin/clinics → super-admin.clinics.index`,
  `GET /super-admin/clinics/{clinic} → super-admin.clinics.show`,
  `POST /super-admin/clinics/{clinic}/suspend →
  super-admin.clinics.suspend`,
  `POST /super-admin/clinics/{clinic}/restore →
  super-admin.clinics.restore`,
  `POST /super-admin/impersonate/{user} →
  super-admin.impersonate.start`,
  `GET /super-admin/activity-log → super-admin.activity-log`. The
  leave-impersonation route sits **outside** the `role:super_admin`
  group at `POST /super-admin/leave-impersonation →
  super-admin.impersonate.stop` because `Auth::user()` is the target
  clinic_admin during impersonation and the role middleware would 403
  it; the controller method gates on session-key presence (404 when
  absent).
- **FormRequests** under `app/Http/Requests/SuperAdmin/`:
  `SuspendClinicRequest` (`reason: required string max:500`),
  `RestoreClinicRequest` (`reason: nullable string max:500`),
  `StartImpersonationRequest` (after-validator: target must be
  `clinic_admin`, session must not already hold `impersonator_id`).
- **Localization** — `lang/{fr,ar,en}/super_admin.php` for clinic
  suspend/restore toasts, impersonation lifecycle messages, dashboard
  metric labels, and the placeholder-pricing notice.
- **Inertia placeholder pages** under `resources/js/pages/panels/super-admin/`:
  the existing `dashboard.tsx` placeholder was upgraded to consume the
  new metrics + deferred chart props, and three new pages were added
  (`clinics/index.tsx`, `clinics/show.tsx`, `activity-log.tsx`) per the
  Phase 2–6 stub pattern. The user's eventual Carbon panel replaces
  these.
- **Maintenance: dead Fortify registration scaffold removed** —
  `resources/js/pages/auth/register.tsx` was a Phase-0 starter file
  that imported `@/routes/register`, a route Wayfinder no longer
  generates because Phase 1 disabled `Features::registration()`. The
  stale import broke `npm run build` and therefore the Vite manifest,
  cascading into Inertia tests across the whole repo (every prior
  phase's tests were rendered failing in the local environment by the
  ViteException). Three minimal edits: drop the `register` import from
  `welcome.tsx` and `auth/login.tsx`, hardcode the `/register` href
  string for the disabled-but-conditional Sign-up links, and delete the
  dead `auth/register.tsx`. After this `npm run build` succeeds and the
  manifest covers every page Phases 1–7 produced.

### Verification run summary (2026-05-20)

- Phase 7 slice (`tests/Feature/SuperAdmin`): **40 / 40 passed, 0
  failed, 0 skipped** (122 assertions in ~531 s against Aiven Postgres
  17). Slice broken down:
  - `PermissionGuardTest` (22 tests via 7 routes × clinic_admin / doctor
    / secretary datasets + leave-impersonation 404 case) — every
    non-super_admin role gets 403 on every super-admin route. **Proves
    Phase 7 exit-gate #1.**
  - `DashboardMetricsTest` (4 tests) — total clinics counts across all
    statuses, active clinics excludes `suspended` + `cancelled`,
    `mrr.amount` equals the `config('billing.plan_prices')`-driven sum
    (2 × `basic` + 1 × `professional` + 1 × `enterprise` = 2396 MAD),
    active appointments today counts only `scheduled / confirmed /
    arrived / in_progress` whose `appointment_day = CURRENT_DATE`.
    Notes: shared one doctor across the appointment fixtures
    explicitly so the AppointmentFactory's nested
    `User::factory()->doctor()` allocations do not trip the 2-doctor
    cap; the GiST exclusion constraint required non-overlapping time
    slots.
  - `ClinicSuspensionTest` (5 tests) — suspend flips
    `subscription_status` to `suspended` + `is_active` to `false` and
    writes `action='subscription_changed'` with `description` from
    the FormRequest reason and a diff snapshot in `old_values` /
    `new_values`; restore flips back to `active` (when
    `subscription_expiry` is in the future) or `trial` (when not) and
    writes a second `subscription_changed` row; clinic_admin is 403d;
    missing reason → 422.
  - `ImpersonationTest` (6 tests) — gold path writes
    `action='impersonated'` with `entity_id=target->id` and
    `new_values.target_email=target->email`, and `Auth::id()` flips to
    the target. During impersonation `GET /admin` succeeds with the
    target's clinic_admin role intact. Impersonating a doctor or a
    super_admin produces a 422 with the localized
    `super_admin.impersonation_only_clinic_admin` error. Stop writes
    `action='left_impersonation'`, restores `Auth::id()` to the
    impersonator, and clears the session key. The concurrent-start
    guard is asserted at the service layer (not via HTTP — the
    `role:super_admin` middleware 403s a second POST during
    impersonation; the service throws `ValidationException` for any
    artisan / job caller). **Proves Phase 7 exit-gate #2.**
  - `ActivityLogIndexTest` (3 tests) — super_admin sees rows from
    three distinct clinics in the paginated index; clinic_admin → 403;
    impersonation rows surface in the cross-tenant log.
- `vendor/bin/pint --dirty --format agent`: clean.
- `php artisan wayfinder:generate --with-form --no-interaction`:
  regenerated `resources/js/actions/App/Http/Controllers/SuperAdmin/*`
  (`DashboardController.ts`, `ClinicController.ts`,
  `ImpersonationController.ts`, `ActivityLogController.ts`) and
  refreshed `resources/js/routes/super-admin/*`.
- `npm run build`: succeeded after removing the dead Fortify
  registration scaffold; manifest now covers every Phase 0–7 page.
- Full suite (`php artisan test --compact`): IN PROGRESS at time of
  this entry's write — kicked off in parallel with the doc update.
  Append a follow-up summary block once the run completes.

### Open items raised by Phase 7

- **#10 (new)** — `activity_log.action` CHECK widened by deviation
  migration; reconcile with `schema.sql` (amend or annotate as
  Phase 0/Phase 2 precedent).
- **#11 (new)** — `config/billing.php` plan prices are placeholders;
  needs product/finance sign-off and likely a `subscription_plans`
  table or Stripe-price-id reference in a future phase.
- **#12 (new)** — Impersonation is restricted to `clinic_admin` only
  per the IG matrix; confirm scope before any doctor/secretary
  shadowing support workflow.

### Carry-over for Phase 8

- Phase 6's "doctor own-patients only" `DocumentPolicy` filter is
  still open. Phase 8 (cross-clinic patient sharing) is the natural
  landing zone since both surfaces are patient-document oriented.
- `PatientShareRequest` is not yet on `AuditObserver`; Phase 8 should
  attach it alongside the share request controller.
- The Carbon panel migration remains pending across all modules
  including the new super-admin pages.

## Phase 8 — Global patient access + per-field provenance audit

**Status:** complete. Phase 8 exit-gate tests green; full-suite run
in progress at time of writing — append a follow-up summary block once
the run completes.
**Date:** 2026-05-22.

### Pivot from the IG-defined Phase 8

The IG (§phases rules) defined Phase 8 as a consented cross-clinic
sharing flow built around `patient_share_requests` + a WhatsApp
consent token. The product owner explicitly redirected to **Option A**
in the 2026-05-22 plan-mode session:

> "let every clinic see the data patient but add a link to know from
> where the data come, updates at wish clinic and i dont care about
> rls"

This is a **deliberate deviation from the IG hard rules** ("Do not
bypass Row-Level Security"). Three new open questions (#13, #14, #15,
#16) track the consequences; the IG itself gets a scoped carve-out
amendment.

### Shipped

- **Three deviation migrations:**
  - `2026_05_22_000010_disable_rls_on_clinical_tables.php` — drops
    `tenant_isolation` + `NO FORCE` + `DISABLE ROW LEVEL SECURITY`
    on the nine clinical tables (`patients`,
    `patient_communication_preferences`, `vital_signs`, `appointments`,
    `medical_records`, `prescriptions`, `prescription_items`,
    `lab_orders`, `lab_order_items`). `down()` reverses each step.
  - `2026_05_22_000020_add_actor_clinic_id_to_activity_log.php` —
    adds `actor_clinic_id UUID NULL REFERENCES clinics(id)` plus an
    index on `(actor_clinic_id, created_at)`. The column cascades to
    every partition child (existing + future) per the Phase 7
    precedent.
  - `2026_05_22_000030_create_field_changes_table.php` — new table
    capturing one row per changed attribute (`entity_type`,
    `entity_id`, `field_name`, `old_value`, `new_value`,
    `changed_by_user_id`, `changed_by_clinic_id`, `origin_clinic_id`,
    `changed_at`). RLS is intentionally **not** enabled — the new
    global-access model needs cross-clinic provenance visible to all
    parties.
- **`App\Models\FieldChange`** + `FieldChangeFactory`. Static helper
  `recentForEntity(entityType, entityId, limit)` is the only query
  caller (used by the deferred Inertia `provenance` prop). `ActivityLog`
  gets `actor_clinic_id` in `$fillable` and an `actorClinic()` BelongsTo.
- **`AuditObserver` extended:** writes per-field rows on `created`,
  `updated`, `deleted`, `restored` for `Patient`, `Appointment`,
  `MedicalRecord`, `Prescription`, `LabOrder` (the
  `FIELD_AUDITED_MODELS` constant). The existing `$hidden`
  sanitization is reused so encrypted SOAP fields never leak into
  `field_changes`. `activity_log.actor_clinic_id` populated from
  `Auth::user()?->clinic_id`.
- **Five clinical policies stripped of clinic-membership checks:**
  `PatientPolicy`, `MedicalRecordPolicy`, `PrescriptionPolicy`,
  `LabOrderPolicy`, `AppointmentPolicy`. Role gates and
  author-within-window guards (MedicalRecord 24h, Prescription
  author-only edit) remain unchanged. Patient `export` / `erase` keep
  the origin-clinic-admin carve-out for Loi 09-08 / GDPR compliance.
- **Six FormRequests dropped clinic-scoped `patient_id` checks:**
  `Store/UpdateAppointmentRequest`, `StoreMedicalRecordRequest`,
  `StorePrescriptionRequest`, `StoreLabOrderRequest`,
  `StoreInvoiceRequest`. `doctor_id` / `secretary_id` / `branch_id` /
  `medication_id` stay clinic-scoped (those are the actor's clinic's
  resources). `appointment_id` is also unscoped now that appointments
  are globally visible.
- **Controllers:** `PatientController::index` and
  `AppointmentController::index` no longer auto-filter by
  `actor->clinic_id`; both gain an `origin_clinic` query-param filter
  and eager-load `clinic:id,name`. Five show methods (Patient,
  Appointment, MedicalRecord, Prescription, LabOrder) add a deferred
  `provenance` prop returning `FieldChange::recentForEntity(...)`
  with `changedByUser` and `changedByClinic` eager-loaded.
- **`resources/js/components/provenance-panel.tsx`** — shared React
  component the five show pages mount. Renders the deferred field
  history with the editor's name + clinic next to each entry.
- **Localization:** `lang/{fr,ar,en}/provenance.php` (new) and two
  new keys in `patients.php` (`from_clinic`, `all_clinics`).
- **Tests adapted to the inverted model:**
  `CrossClinicIsolationTest` (Patients), `MedicalRecordCrossClinicTest`,
  `VitalSignsTest`, `AppointmentCrudTest`, `PrescriptionCrudTest`,
  `LabOrderCrudTest`, `RlsIsolationTest`. Each now asserts that
  cross-clinic patient / clinical access **succeeds**, with sanity
  checks confirming billing / inventory / documents / users remain
  clinic-isolated.
- **New tests:**
  - `tests/Feature/GlobalAccess/CrossClinicPatientAccessTest`
    (4 cases) — clinic B reads + updates clinic A's patient, origin
    clinic appears in the payload, billing isolation sanity.
  - `CrossClinicClinicalWriteTest` (3 cases) — doctor B can write a
    medical record / prescription / lab order for clinic A's patient;
    the new record's `clinic_id` becomes clinic B (origin attribution).
  - `PatientErasureRestrictedTest` (1 case) — the IG-mandated
    origin-clinic carve-out on `export` / `erase` survives the pivot.
  - `tests/Feature/Provenance/PerFieldAuditTest` (2 cases) — one
    `field_changes` row per changed attribute, with the right
    origin / actor clinic stamps.
  - `ProvenancePropTest` (2 cases) — the `recentForEntity` scope
    returns the right rows with eager-loaded relations; the show
    page renders successfully with the deferred prop declared.
  - `EncryptedFieldsExcludedFromProvenanceTest` (1 case) — encrypted
    MedicalRecord SOAP fields (`assessment`, `plan`, `content`,
    `subjective`, `objective`) never appear in `field_changes`,
    matching the existing AuditObserver sanitization.
  - `ActivityLogActorClinicTest` (1 case) — generic per-record
    `activity_log` row carries `actor_clinic_id` from the editor's
    clinic alongside the record's origin `clinic_id`.

### What did NOT ship (originally planned, dropped under Option A)

- ❌ `PatientShareRequest` model / controller / FormRequest / events /
  listener / job / scheduled command. The `patient_share_requests`
  schema table stays (open question #14 covers cleanup).
- ❌ `WhatsAppGateway::sendShareRequestConsent` extension and the
  `share_request_consent` MessageTemplate seed.
- ❌ `share_approved` / `share_rejected` / `share_expired`
  `activity_log` action CHECK additions. The existing 26-value
  CHECK is unchanged.
- ❌ Cross-clinic-share-aware additions to `PatientPolicy::view` &
  siblings — instead, the clinic-membership branch was removed
  entirely.

### Verification run summary (2026-05-22)

- Phase 8 focused slice
  (`CrossClinicIsolation|MedicalRecordCrossClinic|VitalSigns|
  AppointmentCrud|PrescriptionCrud|LabOrderCrud|GlobalAccess|Provenance`):
  **65 / 65 passed, 0 failed, 0 skipped** (218 assertions in ~578 s
  against Aiven Postgres 17).
- Full suite (`php artisan test --compact`): **355 / 357 passed, 2
  skipped, 0 failed** (898 assertions in ~34.6 min). The two skipped
  tests are the longstanding `RegistrationTest` cases that auto-skip
  because `Features::registration()` is disabled (Phase 0 precedent).
  Initial run surfaced two transient failures (cross-clinic invoice
  test and the new RLS-disabled patients test) — both root-caused to
  the migration ordering of `2026_05_22_000010_disable_rls_on_clinical_tables`
  running BEFORE `9999_99_99_999999_enable_row_level_security` under
  `migrate:fresh`. Resolution: amended the `9999` migration to skip
  the nine clinical tables (with a Phase 8 docblock) so the disable
  is durable under both incremental upgrade and fresh-install paths.
  Cross-clinic invoice test was also flipped to assert the new
  behavior (clinic B can invoice clinic A's patient; the invoice's
  `clinic_id` is the issuer's).
- Pint (`vendor/bin/pint --dirty --format agent`): clean.
- Wayfinder (`php artisan wayfinder:generate --with-form --no-interaction`):
  regenerated `resources/js/actions/` and `resources/js/routes/`.
- `npm run build`: succeeded (Vite manifest rebuilt — 551 KB main
  bundle, includes the new `provenance-panel` module).

### Open items raised by Phase 8

- **#13 (new):** RLS disabled on nine clinical tables in deliberate
  contradiction to the IG "Do not bypass RLS" hard rule. The IG
  `=== mission rules ===` is amended with a scoped carve-out so
  future agents don't re-enable.
- **#14 (new):** `patient_share_requests` table is now schema dead
  weight. Decide: drop it (destructive migration), keep it (graceful
  no-op), or repurpose for some future consented-sharing feature.
- **#15 (new):** Loi 09-08 / GDPR compliance posture changes — every
  clinic can now read every patient's clinical data. Confirm that
  consent for cross-clinic access is captured elsewhere (patient
  intake forms, T&Cs, etc.) before production deployment.
- **#16 (new):** `field_changes` storage grows unbounded. Phase 9
  should define a retention / rotation policy (recommendation: drop
  rows older than 7 years to match `activity_log`).

### Carry-over for Phase 9

- IMPLEMENTATION_GUIDE.md needs the scoped RLS carve-out documented
  in §mission rules.
- A `field_changes:rotate` scheduled command (paralleling Phase 7's
  `app:expire-patient-share-requests` that never shipped) is the
  obvious Phase 9 cleanup task.
- Carbon panel migration is still pending across every module
  including the new ProvenancePanel mount points.

## Phase 9 — Localization parity + hardening

**Status:** complete. All exit-gate tests green.
**Date:** 2026-05-22.

### Shipped

- **String-coverage exit-gate test**
  (`tests/Feature/Localization/StringCoverageTest.php`) flattens every
  `lang/{locale}/*.php` file into a dot-notation keyset and asserts
  three-way parity across fr / ar / en. `validation.php` is partially
  exempted: only the `attributes` and `custom` sub-trees are compared,
  so the ~200 Laravel-default message keys can stay English-only until
  we actually customize one of them. Surfaces every gap as a single
  human-readable diff in the failure message.
- **Six new translation files** to bring fr/ar into parity with en:
  `lang/{fr,ar}/auth.php`, `lang/{fr,ar}/pagination.php`,
  `lang/{fr,ar}/passwords.php`. All five Laravel-default keys per
  file are translated.
- **Validation attribute parity:** the 22 patient-domain attributes
  (`address`, `allergies`, `chronic_diseases`, `emergency_contact_*`,
  `family_history`, `insurance_*`, `passport_number`, `postal_code`,
  `recorded_at`, `respiratory_rate`, `smoking_status`,
  `surgical_history`, etc.) added to `lang/en/validation.php` so all
  three locales agree.
- **Rate limiters** registered in `FortifyServiceProvider::configureRateLimiting()`:
  - `login` — 5/min by `email|ip` (already present from Phase 1; left
    unchanged).
  - `two-factor` — bumped from 5 → 6/min per the IG §security rules
    threshold.
  - `patient-confirmation` — 10/min by IP. Applied via
    `->middleware('throttle:patient-confirmation')` on
    `GET appointments/confirm/{token}`.
  - `staff-creation` — 20/hour by `Auth::id()`. Applied to the
    `/admin/staff/*` route group.
- **Three rate-limit tests**
  (`tests/Feature/RateLimiting/{Auth,SignedRoute,StaffCreation}ThrottleTest.php`)
  each asserting 429 at the documented threshold. `RateLimiter::clear()`
  in `beforeEach` so the buckets don't leak across tests.
- **`app:rotate-field-changes` command** (Phase 8 carryover #16) —
  drops `field_changes` rows older than 7 years (default; `--years=N`
  overrides). `--dry-run` reports counts without deleting. Uses
  `chunkById` to avoid table-level locks during a large purge. Sets
  `app.is_super_admin` to true so a future RLS revival on the table
  doesn't block the cross-clinic delete. Registered in
  `bootstrap/app.php` via `withSchedule()` — runs weekly on Mondays
  at 03:00 UTC, `withoutOverlapping` + `runInBackground`. Two tests
  in `tests/Feature/Provenance/FieldChangesRotationTest`.
- **Sentry integration point scaffolded.** `.env.example` documents
  the enable runbook (`composer require sentry/sentry-laravel`,
  `php artisan sentry:publish`, set `SENTRY_LARAVEL_DSN`). The
  `bootstrap/app.php` `withExceptions` block carries a Phase 9
  comment explaining that Sentry's package autodiscovery handles the
  registration once installed — we intentionally do NOT vendor the
  package per CLAUDE.md's "no new dependencies without approval"
  rule.
- **`laravel/pail` confirmed dev-only** in `composer.json`
  (`require-dev`). `composer install --no-dev` in production
  automatically excludes it; no further config change needed.

### Verification run summary (2026-05-22)

- Phase 9 focused slice
  (`StringCoverage|RateLimiting|FieldChangesRotation`): **6 / 6
  passed, 0 failed, 0 skipped** (28 assertions in ~200 s against
  Aiven Postgres 17).
- Full suite (`php artisan test --compact`): **361 / 363 passed, 2
  skipped, 0 failed** (923 assertions in ~30 min). The two skipped
  are the longstanding `RegistrationTest` cases that auto-skip
  because `Features::registration()` is disabled (Phase 0
  precedent).
- The first full-suite attempt hit 4 transient Aiven RLS-DDL
  deadlocks plus 4 cascading off-by-N count mismatches in
  downstream tests — exactly the Phase 5 / Phase 6 documented
  Aiven flake on `ALTER TABLE … ENABLE ROW LEVEL SECURITY` under
  concurrent migration. A `migrate:fresh` + re-run cleared all of
  them, consistent with the Phase 5 open-items note. The relevant
  tests pass deterministically in isolation; the issue is
  exclusively the Aiven test-DB instability flagged in Phase 5
  open item.
- Pint (`vendor/bin/pint --dirty --format agent`): clean.
- Wayfinder (`php artisan wayfinder:generate --with-form --no-interaction`):
  regenerated `resources/js/actions/` and `resources/js/routes/`.
- `npm run build`: succeeded.

### What did NOT ship (deferred / out of scope)

- ❌ **Backup restore drill.** The IG §devops calls for a quarterly
  `pg_dump` restore drill against an isolated container running a
  Pest smoke test. This is an operational task that requires a
  production-equivalent environment and ops credentials — flagged
  for the deploy runbook rather than this codebase task.
- ❌ **Carbon panel migration.** Still pending across every module
  including the Phase 8 ProvenancePanel mount points. Tracked
  separately from Phase 9 because Carbon integration is a discrete
  effort that touches every Inertia page.
- ❌ **RTL CSS check.** Tied to the Carbon panel migration — the
  IG says "RTL CSS check in the existing Carbon panels (Tailwind
  `dir-rtl` aware)". With Carbon not yet integrated, there are no
  Carbon panels to audit. The placeholder pages this codebase
  ships are LTR-only Tailwind utilities.
- ❌ **Reminder jobs (24h / 2h pre-appointment).** Templates seeded
  in Phase 3 but no scheduled dispatcher. Would parallel the
  `app:rotate-field-changes` schedule registration; flagged for a
  future Phase 9.x or Phase 10 chore.
- ❌ **Real Meta Graph API gateway impl.** Phase 3 ships
  `NullWhatsAppGateway`; production deploy still needs a
  `MetaWhatsAppGateway` that calls `https://graph.facebook.com`
  with the decrypted per-clinic access token. Gated on having
  approved Meta Business credentials for the production tenant.

### Open items raised by Phase 9

- **#17 (new):** The reminder-job dispatcher pattern (Schedule +
  job → message template lookup → WhatsAppGateway) is the next
  obvious building block. Land it before the production Meta gateway
  swap so the cron contract is exercised end-to-end against
  `NullWhatsAppGateway` first.
- **#18 (new):** Carbon panel migration is unscheduled. Recommend
  treating it as its own phase (10.x) rather than carrying it as
  open-ended scope.

### Carry-over for production deploy

- Run the Sentry enable runbook (`.env.example` §Sentry block).
- Provision the production app role as `NOSUPERUSER NOBYPASSRLS`
  per open question #6's prod note.
- Schedule `pg_dump` daily + monthly snapshots + quarterly restore
  drill per IG §devops.
- Set up Loki / CloudWatch / Vector log aggregation per IG §devops.
- Enable `pg_stat_statements` and create a weekly slow-query report.
