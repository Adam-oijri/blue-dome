<clinic-saas-implementation-guide>

=== mission rules ===

# Clinic SaaS Implementation Guide

This document is the **single, authoritative implementation guide** for the Clinic Management SaaS. The AI coding agent must read this file end-to-end before writing any code, and must re-consult relevant sections during every phase.

This file does NOT replace `CLAUDE.md` (the Laravel Boost guidelines). It extends it. Where Laravel Boost says how to use Laravel, this file says **what to build, in what order, with what business rules, against what schema**.

## Mandatory pre-work before writing any code

1. Read `CLAUDE.md` (Laravel Boost guidelines) — already in repo root.
2. Read this file (`IMPLEMENTATION_GUIDE.md`) end-to-end.
3. Read `schema.sql` — the database schema is the **single source of truth** for the data model. No table or column may be invented.
4. Activate every relevant skill in `.claude/skills/`:
   - `laravel-best-practices` (always)
   - `fortify-development` (auth phases)
   - `inertia-react-development` (any Inertia work)
   - `wayfinder-development` (every controller — Wayfinder generates TS types the frontend consumes)
   - `pest-testing` (every phase — tests are mandatory exit gates)
   - `tailwindcss-development` (if any styling adjustments are needed for the existing Carbon panels)
5. Use `search-docs` for every Laravel / Inertia / Fortify / Wayfinder / Pest claim before writing it. Do not rely on training memory.
6. Use `database-schema` to verify table structure before creating models or migrations referencing existing tables.

## Hard rules — no exceptions

- **Do not invent schema.** Every table, column, index, trigger, function, view, and RLS policy is defined in `schema.sql`. If you need something not in the schema, add it to `99-open-questions.md` and ask — do not silently add columns.
- **Do not bypass Row-Level Security**, *except* on the nine clinical-patient
  tables disabled by migration `2026_05_22_000010_disable_rls_on_clinical_tables`
  (Phase 8 global-patient-access pivot — see open question #13 and the Phase 8
  entry in `docs/architecture/07-implementation-roadmap.md`). Every other
  clinic-scoped query must run with `app.current_clinic_id` set. No raw SQL
  that uses `SET LOCAL ROLE` or `BYPASSRLS` outside of explicit super-admin
  code paths gated by `fn_is_super_admin()`. The disabled clinical tables
  (`patients`, `patient_communication_preferences`, `vital_signs`,
  `appointments`, `medical_records`, `prescriptions`, `prescription_items`,
  `lab_orders`, `lab_order_items`) are intentionally globally readable +
  writable; provenance is captured per-field in the new `field_changes` table.
  Do NOT re-enable RLS on these tables without explicit product-owner approval.
- **Do not give patients accounts.** Patients confirm via signed tokens over WhatsApp / email. There is no patient login route, ever.
- **Do not implement Stripe or CMI now.** They are commented-out stubs in `schema.sql`. Define the `PaymentGateway` interface and provide `CashGateway` + `BankWireGateway` only.
- **Do not modify the existing React frontend.** The frontend (IBM Carbon Design System, three panels: admin / doctor / secretary) will be placed by the user in a dedicated folder. Your job is to make the Laravel backend serve its data contracts via Inertia + Wayfinder. Document the contract; never edit the frontend code.
- **Do not skip Pest tests between phases.** Each phase has an exit-gate test list. The phase is not done until those tests pass.
- **Do not run `php artisan migrate:fresh` on a database with data.** Always reversible migrations; production has data the moment a clinic signs up.

=== stack rules ===

# Locked stack — do not propose alternatives

| Layer | Choice | Version | Notes |
|---|---|---|---|
| Runtime | PHP | 8.4 | Use readonly props, typed properties, constructor promotion |
| Framework | Laravel | 13 | Follow `laravel-best-practices` skill |
| Inertia bridge | inertiajs/inertia-laravel | v3 | `Inertia::render()`, `Inertia::optional()`, `Inertia::defer()` |
| Frontend | React | 19 | **Existing IBM Carbon code, do not modify** |
| Frontend lang | TypeScript | latest in repo | Wayfinder produces TS types frontend imports |
| Routing types | laravel/wayfinder | v0 | Frontend imports from `@/actions/` and `@/routes/` |
| Auth | laravel/fortify | v1 | SPA mode, session-based; **not Sanctum tokens** |
| Tests | pestphp/pest | v4 | `php artisan make:test --pest {Name}` |
| Formatter | laravel/pint | v1 | `vendor/bin/pint --dirty --format agent` after every PHP edit |
| Log tail | laravel/pail | v1 | `php artisan pail` during dev |
| Dev env | laravel/sail | v1 | Docker-based local dev |
| CLI input | laravel/prompts | v0 | For artisan commands needing input |
| MCP | laravel/boost | v2 | Use `search-docs`, `database-schema`, `list-routes`, `browser-logs` |
| Styling | tailwindcss | v4 | Carbon panels already styled; do not introduce conflicting utilities |
| Lint | eslint | v9 | Don't touch unless asked |
| Format | prettier | v3 | Don't touch unless asked |
| Database | PostgreSQL | 14+ | RLS, partitioning, `pgcrypto`, `btree_gist`, `citext`, `pg_trgm` |
| Cache / queue | Redis | latest | Sessions, queues, cache |
| Deploy | VPS + Docker | — | DigitalOcean / Hetzner; not Laravel Cloud, not Vapor |

=== domain rules ===

# Domain — Clinic Management SaaS

## Roles (4, in strict precedence)

| Role | Who creates them | Schema value | Purpose |
|---|---|---|---|
| `super_admin` | DB seed / artisan command | `users.role='super_admin'` | Platform owner. Cross-tenant access via `fn_is_super_admin()`. Manages subscription plans, support, billing of clinics. |
| `clinic_admin` | Super admin invitation OR self-signup | `users.role='clinic_admin'` | Clinic owner. Exactly 1 per clinic (enforced by `uq_users_one_clinic_admin`). Manages subscription, data, billing, **and creates doctor / secretary accounts**. |
| `doctor` | `clinic_admin` only | `users.role='doctor'` | Clinical work: patients, prescriptions, lab orders, medical records. **Max 2 per clinic** (enforced by trigger). |
| `secretary` | `clinic_admin` only | `users.role='secretary'` | Appointments, follow-up calls, intake, document scanning. **Max 3 per clinic** (enforced by trigger). |

When a `clinic_admin` tries to create a 3rd doctor or 4th secretary:

1. **FormRequest** validates first → HTTP 422 with localized message in fr/ar/en.
2. **DB trigger** is the last-line defense → if it fires, return HTTP 500 (means a bug in the FormRequest); the trigger must never be reached by valid app code.

## Feature areas (all four are in scope)

1. **Patients & medical records** — `patients`, `vital_signs`, `medical_records` (partitioned), `patient_communication_preferences`, `patient_share_requests`.
2. **Appointments & WhatsApp** — `appointments`, confirmation tokens, `whatsapp_integration`, `message_templates`, `message_log` (partitioned), `v_appointments_needing_followup` view drives the secretary dashboard.
3. **Billing** — `invoices`, `invoice_items`, `payments` (cash + bank_wire only), `expenses`, `vendors`, `clinic_sequences`.
4. **Inventory & documents & cross-clinic sharing** — `inventory` + `inventory_transactions` + `v_inventory_alerts`, `document_folders` + `documents`, `patient_share_requests` with token-based consent.

## Localization

- **Primary:** French (`fr`). Default for all panels.
- **Secondary:** Arabic (`ar`), RTL.
- **Tertiary:** English (`en`).
- Every user-facing string must exist in `lang/fr/`, `lang/ar/`, `lang/en/`.
- WhatsApp templates: one per language per message type. Route by `patient_communication_preferences.preferred_language` (column may be on `patients` — verify with `database-schema`), falling back to `clinics.locale`.
- All times stored as `TIMESTAMPTZ` (UTC). Display in `clinics.timezone` (default `Africa/Casablanca`), with branch override if `branches.timezone` is set.

## Payments — current scope only

| Method | Status | How it works |
|---|---|---|
| `cash` | Active | Secretary or clinic_admin enters payment manually in UI; `payment_status='completed'` on save. |
| `bank_wire` | Active | Patient transfers to clinic's bank account; clinic_admin marks invoice paid manually after reconciling. Includes optional `reference_number` field. |
| `cmi` | **Stubbed — not implemented** | `CmiGateway` class skeleton in `app/Services/Payments/`. Methods raise `NotImplementedException`. |
| `stripe` | **Stubbed — not implemented** | Same as CMI. |

The `PaymentGateway` interface lives in `app/Contracts/PaymentGateway.php`. Methods: `charge(Invoice $invoice, array $details): PaymentResult`, `refund(Payment $payment): PaymentResult`, `verifyWebhook(Request $request): bool`.

## Patient confirmation tokens (critical flow)

1. Appointment created → job dispatched to send WhatsApp template.
2. Template includes a signed Laravel URL: `route('appointments.confirm', ['token' => ...])` valid for 48 hours.
3. Patient taps link → Laravel signed-route middleware verifies → updates `appointments.confirmation_status='confirmed'` and `appointments.confirmed_at=NOW()` → emits `AppointmentConfirmed` event.
4. If not confirmed within the window: `v_appointments_needing_followup` surfaces the row in the secretary dashboard for a manual phone follow-up. Secretary clicks "called" → `appointments.follow_up_call_status` and `appointments.follow_up_call_attempts` update.

The link must be the **only** way a patient can interact. No login form. No password. Never.

=== directory rules ===

# Directory layout — additions only, no restructuring

The agent must NOT create new base folders without approval. Use existing Laravel directories. Recommended additions (all under standard Laravel paths):

```
app/
├── Contracts/
│   └── PaymentGateway.php
├── Domain/                          # NEW: per-module namespacing (request approval before creating)
│   ├── Patients/
│   ├── Appointments/
│   ├── Prescriptions/
│   ├── LabOrders/
│   ├── Billing/
│   ├── Inventory/
│   ├── Documents/
│   └── Messaging/
├── Http/
│   ├── Controllers/                 # standard
│   ├── Middleware/
│   │   └── SetTenantContext.php    # sets app.current_clinic_id / app.current_user_id
│   └── Requests/                    # FormRequests per controller action
├── Models/                          # standard Eloquent models
├── Observers/                       # audit logging via observers
├── Policies/                        # one per Eloquent model
├── Services/
│   └── Payments/
│       ├── CashGateway.php
│       ├── BankWireGateway.php
│       ├── CmiGateway.php          # commented stub
│       └── StripeGateway.php       # commented stub
docs/
└── architecture/                    # NEW (this is your output)
    ├── 00-overview.md
    ├── 01-backend-architecture.md
    ├── 02-api-and-inertia-contracts.md
    ├── 03-auth-and-permissions.md
    ├── 04-integrations.md
    ├── 05-security-compliance.md
    ├── 06-devops.md
    ├── 07-implementation-roadmap.md
    └── 99-open-questions.md
lang/
├── fr/
├── ar/
└── en/
resources/js/
├── pages/                           # Inertia React pages (existing Carbon code lives here when user uploads)
├── components/                      # Carbon components (existing)
├── layouts/                         # AdminLayout, DoctorLayout, SecretaryLayout (existing)
└── types/                           # TS types — Wayfinder generates into @/actions, @/routes
```

The `app/Domain/` folder requires approval — if the agent prefers a flatter structure (controllers + models + services without per-module subfolders), it must propose it in `99-open-questions.md` and wait. Default to flat-structure if unsure.

=== tenant-context rules ===

# Tenant context — the most important rule in the system

Every authenticated request must, in order:

1. Resolve the logged-in user via Fortify session.
2. Determine the user's `clinic_id` (from `users.clinic_id`).
3. Set PostgreSQL session variables for RLS:

```php
// app/Http/Middleware/SetTenantContext.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SetTenantContext
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        if ($user !== null) {
            DB::statement('SELECT set_config(?, ?, true)', [
                'app.current_user_id',
                (string) $user->id,
            ]);
            DB::statement('SELECT set_config(?, ?, true)', [
                'app.current_clinic_id',
                (string) $user->clinic_id,
            ]);
            DB::statement('SELECT set_config(?, ?, true)', [
                'app.is_super_admin',
                $user->role === 'super_admin' ? 'true' : 'false',
            ]);
        }

        return $next($request);
    }
}
```

Notes:

- Use `set_config(..., true)` — the third `true` makes it **transaction-local**. Laravel runs each request in a transaction when using `DB::transaction()`. For non-transactional flows, the session-pooled connection will leak context; use `set_config(..., false)` only if you've audited the connection lifecycle (PgBouncer in transaction-pooling mode requires `true`).
- Queue jobs **lose** tenant context. Every job that touches clinic data must accept `$clinicId` and `$userId` in its constructor and call the same `set_config` at the top of `handle()`. Use a `TenantAwareJob` base class.
- Console commands have no user; super-admin commands set `app.is_super_admin='true'` explicitly; tenant-specific commands take `--clinic=` and set `app.current_clinic_id`.

Register the middleware globally in `bootstrap/app.php` after Fortify's auth middleware.

=== auth rules ===

# Authentication — Fortify SPA mode

Use Fortify, not Sanctum tokens, not Passport. Fortify provides:

- `POST /login` (Fortify default route)
- `POST /logout`
- `POST /forgot-password`
- `POST /reset-password`
- `POST /two-factor-challenge` (if 2FA enabled)
- `POST /user/two-factor-authentication` (enrol)

Enabled features in `config/fortify.php`:

```php
'features' => [
    // Features::registration() — DISABLED. Clinic_admin self-signup is a separate
    //   non-Fortify flow with billing/onboarding wizard. Super-admin invites clinic admins.
    Features::resetPasswords(),
    Features::emailVerification(),
    Features::updatePasswords(),
    Features::twoFactorAuthentication(['confirm' => true, 'confirmPassword' => true]),
],
```

## Login flows per role

- **super_admin** → redirected to `/super-admin` panel.
- **clinic_admin** → redirected to `/admin` panel.
- **doctor** → redirected to `/doctor` panel.
- **secretary** → redirected to `/secretary` panel.

Implement `Laravel\Fortify\Contracts\LoginResponse` override that returns `Inertia::location()` to the right route per role.

## Account-creation routes (NOT Fortify — custom)

| Route | Role required | Body | Effect |
|---|---|---|---|
| `POST /admin/staff/doctors` | `clinic_admin` | first_name, last_name, email, phone, license_number, specialty, ... | Creates `users` row with `role='doctor'`; creates `doctor_profiles` row; sends invite email to set password via Fortify reset-password flow. **FormRequest must check current doctor count < 2.** |
| `POST /admin/staff/secretaries` | `clinic_admin` | first_name, last_name, email, phone | Creates `users` row with `role='secretary'`; sends invite email. **FormRequest must check current secretary count < 3.** |
| `DELETE /admin/staff/{user}` | `clinic_admin` | — | Soft-delete the staff row. Restoration is allowed via `POST /admin/staff/{user}/restore` provided cap is not exceeded. |

## Password reset over WhatsApp

The default Fortify reset is email. Override `Fortify::resetUserPasswordsUsing()` or extend the password-broker so that when `users.phone` is set and clinic has WhatsApp integration, the reset link is **also** sent over WhatsApp. Email is the always-present fallback.

=== permission rules ===

# Permission matrix

Symbols: ✅ allowed, ❌ denied, 🔒 conditional (notes in cell).

| Action | super_admin | clinic_admin | doctor | secretary |
|---|---|---|---|---|
| List all clinics | ✅ | ❌ | ❌ | ❌ |
| Create/edit/delete clinic | ✅ | 🔒 own only | ❌ | ❌ |
| View clinic subscription | ✅ | ✅ | ❌ | ❌ |
| Change subscription plan | ✅ | ✅ | ❌ | ❌ |
| Create doctor account | ❌ | ✅ (cap 2) | ❌ | ❌ |
| Create secretary account | ❌ | ✅ (cap 3) | ❌ | ❌ |
| Soft-delete staff | ❌ | ✅ | ❌ | ❌ |
| List patients | ✅ all | ✅ own clinic | ✅ own clinic | ✅ own clinic |
| Create patient | ❌ | ✅ | ✅ | ✅ |
| View patient medical records | ❌ | ❌ | ✅ | ❌ |
| Create medical record | ❌ | ❌ | ✅ | ❌ |
| Edit medical record | ❌ | ❌ | 🔒 author only, within 24h | ❌ |
| Create prescription | ❌ | ❌ | ✅ | ❌ |
| Create lab order | ❌ | ❌ | ✅ | ❌ |
| Schedule appointment | ❌ | ✅ | ✅ | ✅ |
| Reschedule / cancel appointment | ❌ | ✅ | ✅ | ✅ |
| Mark appointment as confirmed/no-show | ❌ | ✅ | ✅ | ✅ |
| Call follow-up list | ❌ | ✅ | ❌ | ✅ |
| Create invoice | ❌ | ✅ | ❌ | ✅ |
| Record payment (cash / bank_wire) | ❌ | ✅ | ❌ | ✅ |
| Refund payment | ❌ | ✅ | ❌ | ❌ |
| Create expense | ❌ | ✅ | ❌ | ❌ |
| Manage inventory | ❌ | ✅ | ❌ | ✅ |
| Manage documents | ❌ | ✅ | ✅ own patients | ✅ |
| Request cross-clinic patient share | ❌ | ✅ | ✅ | ✅ |
| Approve/reject share request | ❌ | ✅ | ❌ | ❌ |
| Edit clinic settings | ❌ | ✅ | ❌ | ❌ |
| Edit message templates | ❌ | ✅ | ❌ | ❌ |
| Configure WhatsApp integration | ❌ | ✅ | ❌ | ❌ |
| Configure email integration | ❌ | ✅ | ❌ | ❌ |
| View activity log | ✅ all | ✅ own clinic | ❌ | ❌ |
| Impersonate clinic_admin (support) | ✅ | ❌ | ❌ | ❌ |

Implementation: one Eloquent Policy per model. Policies return `true`/`false` based on the matrix. Controllers use `$this->authorize('action', $model)` or middleware `can:action,model`. RLS enforces tenant isolation at DB level — policies enforce role/action rules.

=== eloquent rules ===

# Eloquent models — conventions

For each table in `schema.sql`, the agent creates one Eloquent model:

- File: `app/Models/{ModelName}.php` (singular, StudlyCase).
- Primary key: `protected $keyType = 'string'; public $incrementing = false;` (UUIDs).
- Soft deletes: every table with `deleted_at` uses `SoftDeletes` trait.
- Timestamps: every table with `created_at/updated_at` uses default `$timestamps = true`.
- Casts: `created_at`, `updated_at`, `deleted_at` → `datetime`. JSONB columns → `array` or `AsArrayObject::class`. Encrypted columns → `encrypted` cast.
- Relationships: declare every FK relationship in both directions (`belongsTo` and `hasMany`).
- Scopes: every model with `clinic_id` declares `scopeForCurrentClinic()` — but **prefer relying on RLS**; the scope is for cases where you query outside a tenant request (admin tooling).

Example for `Patient`:

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patient extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'clinic_id', 'branch_id', 'patient_code', 'first_name', 'last_name',
        'date_of_birth', 'gender', 'blood_type', 'phone', 'phone_e164',
        'email', 'address', /* ... only columns the app writes ... */
    ];

    protected $casts = [
        'date_of_birth'   => 'date',
        'allergies'       => 'array',
        'chronic_conditions' => 'array',
        'national_id'     => 'encrypted',
        'insurance_number' => 'encrypted',
    ];

    public function clinic(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function branch(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function appointments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /* ... declare every relationship the schema implies ... */
}
```

Verify every column against `schema.sql` with `database-schema` before fillable lists go in.

## Unique validation with soft deletes

Schema unique indexes are partial (`WHERE deleted_at IS NULL`). The Laravel `unique` validation rule must add `->whereNull('deleted_at')`:

```php
Rule::unique('patients', 'patient_code')
    ->where('clinic_id', $this->user()->clinic_id)
    ->whereNull('deleted_at')
```

=== migrations rules ===

# Migrations

- `schema.sql` is the canonical reference. Translate it to Laravel migrations table-by-table.
- One migration per table. Migration filename uses Laravel timestamp + StudlyCase description, e.g. `2026_01_01_000010_create_patients_table.php`.
- Use `Schema::create()` for tables. For PostgreSQL-specific features (RLS, triggers, partial indexes, GENERATED columns, partitioned tables) drop to `DB::statement()` with raw SQL — copy verbatim from `schema.sql`.
- Migrations must be **reversible**. `down()` drops the table; for partitioned tables, drop child partitions first.
- Order of migrations matches `schema.sql` section order: extensions → helper functions → tenants → patients → appointments → prescriptions → lab → billing → inventory → documents → messaging → medical records → settings → integrations → RLS policies → views.
- Enable RLS in a separate migration that runs last (`9999_..._enable_rls.php`). This way you can test without RLS first if needed.
- `pgcrypto`, `btree_gist`, `citext`, `pg_trgm` extensions in the very first migration.

=== api-contracts rules ===

# Inertia + Wayfinder API contracts

Every controller method's signature is consumed by the existing Carbon frontend via Wayfinder. Therefore:

- Controllers MUST have method-level type signatures.
- FormRequest classes define **all** validation rules — never inline `$request->validate()`.
- Controllers return `Inertia::render('Module/Action', [...])` with typed prop arrays.
- After every route or controller signature change, the agent runs `php artisan wayfinder:generate --with-form --no-interaction`.

## Standard CRUD controller pattern

```php
namespace App\Http\Controllers;

use App\Http\Requests\Patient\StorePatientRequest;
use App\Http\Requests\Patient\UpdatePatientRequest;
use App\Models\Patient;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Patient::class);

        return Inertia::render('Patients/Index', [
            'patients' => Patient::query()
                ->select(['id', 'patient_code', 'first_name', 'last_name', 'phone', 'date_of_birth'])
                ->orderBy('last_name')
                ->paginate(25),
        ]);
    }

    public function store(StorePatientRequest $request): \Illuminate\Http\RedirectResponse
    {
        $patient = Patient::create($request->validated());

        return redirect()
            ->route('patients.show', $patient)
            ->with('flash.success', __('patients.created'));
    }

    public function show(Patient $patient): Response
    {
        $this->authorize('view', $patient);

        return Inertia::render('Patients/Show', [
            'patient' => $patient->load([
                'branch',
                'communicationPreferences',
                'recentAppointments' => fn ($q) => $q->latest()->limit(5),
            ]),
            'allergyOptions'  => Inertia::optional(fn () => $this->allergyOptions()),
            'medicalRecords'  => Inertia::defer(fn () => $patient->medicalRecords()->latest()->get()),
        ]);
    }

    /* update, destroy, restore ... */
}
```

## Route names

Resource-based naming. Examples:

| Resource | Route prefix | Names |
|---|---|---|
| Patients | `/patients` | `patients.index`, `patients.show`, `patients.store`, `patients.update`, `patients.destroy` |
| Appointments | `/appointments` | `appointments.index`, `appointments.store`, `appointments.confirm` (signed), `appointments.cancel` |
| Invoices | `/invoices` | `invoices.index`, `invoices.show`, `invoices.store`, `invoices.markPaid` |
| Payments | `/payments` | `payments.store`, `payments.refund` |
| Staff (admin only) | `/admin/staff` | `admin.staff.doctors.store`, `admin.staff.secretaries.store`, `admin.staff.destroy` |
| Share requests | `/share-requests` | `share-requests.index`, `share-requests.store`, `share-requests.approve`, `share-requests.reject` |
| Super-admin | `/super-admin` | `super-admin.clinics.index`, `super-admin.clinics.suspend` |

Wayfinder generates TS functions matching these names. The frontend imports `import { patients } from '@/routes'` and calls `patients.index()`, `patients.store(data)`.

=== whatsapp rules ===

# WhatsApp Cloud API integration

## Configuration

`whatsapp_integration` table stores per-clinic config: `phone_number_id`, `access_token` (encrypted), `webhook_verify_token`, `business_account_id`.

## Service class

```php
namespace App\Services\Messaging;

use App\Models\Clinic;
use App\Models\Patient;
use App\Models\MessageTemplate;
use Illuminate\Support\Facades\Http;

class WhatsAppService
{
    public function __construct(private readonly Clinic $clinic) {}

    public function sendTemplate(
        Patient $patient,
        string $templateName,
        array $parameters,
        ?string $locale = null,
    ): string {
        // Resolve template in patient's locale or clinic default
        $template = MessageTemplate::query()
            ->where('clinic_id', $this->clinic->id)
            ->where('name', $templateName)
            ->where('locale', $locale ?? $this->resolveLocale($patient))
            ->firstOrFail();

        // Call Meta Graph API
        $response = Http::withToken(decrypt($this->clinic->whatsappIntegration->access_token))
            ->post("https://graph.facebook.com/v20.0/{$this->clinic->whatsappIntegration->phone_number_id}/messages", [
                'messaging_product' => 'whatsapp',
                'to'                => $patient->phone_e164,
                'type'              => 'template',
                'template'          => [
                    'name'       => $template->meta_template_name,
                    'language'   => ['code' => $template->locale],
                    'components' => $this->buildComponents($parameters),
                ],
            ]);

        // Log to message_log (partitioned)
        return $this->logMessage($patient, $template, $response);
    }

    public function verifyWebhook(string $mode, string $token, string $challenge): ?string
    {
        return $mode === 'subscribe'
            && $token === $this->clinic->whatsappIntegration->webhook_verify_token
            ? $challenge
            : null;
    }

    public function handleStatusCallback(array $payload): void
    {
        // Update message_log.status for delivery receipts
    }

    private function resolveLocale(Patient $patient): string
    {
        return $patient->communicationPreferences?->preferred_language
            ?? $this->clinic->locale;
    }

    /* ... */
}
```

## Appointment confirmation flow (end-to-end)

```
Secretary creates appointment in UI
  → AppointmentController@store
  → Appointment saved (status='scheduled', confirmation_status='pending')
  → AppointmentCreated event dispatched
  → SendAppointmentConfirmationWhatsApp listener queued
    → job builds signed URL: URL::temporarySignedRoute('appointments.confirm', now()->addHours(48), ['appointment' => $id])
    → WhatsAppService->sendTemplate('appointment_confirmation', [date, time, doctor, signed_url])
    → message_log row inserted

Patient receives WhatsApp message, taps link
  → GET /appointments/{appointment}/confirm?signature=...&expires=...
  → 'signed' middleware verifies
  → AppointmentController@confirm
  → appointments.confirmation_status='confirmed', confirmed_at=NOW()
  → AppointmentConfirmed event dispatched
  → secretary dashboard updates (Reverb / polling)
  → Patient sees a localized "merci" / "شكرا" / "thank you" page

If 48h elapse without confirmation
  → scheduled job marks appointment for follow-up call (sets needs_follow_up_call=true)
  → v_appointments_needing_followup picks it up
  → Secretary calls; records call status in UI
```

The signed URL is the **only** way patients interact with the system. Never a login form.

## Webhook routes

- `GET /webhooks/whatsapp` — verification (hub.challenge handshake)
- `POST /webhooks/whatsapp` — delivery receipts and inbound messages

Both routes are unauthenticated (Fortify excludes them); both verify via `webhook_verify_token` first.

=== messaging-localization rules ===

# Message templates and localization

- `message_templates` table holds one row per (clinic_id, name, locale, channel).
- Channels: `whatsapp`, `email`, `sms` (sms unused for now).
- Templates referenced by the Meta WhatsApp Business platform must be pre-approved by Meta — store `meta_template_name` and `meta_template_status` columns. Verify the schema includes these; if not, flag in `99-open-questions.md`.
- Variable substitution: `{{patient_name}}`, `{{appointment_date}}`, `{{doctor_name}}`, `{{confirmation_url}}`. The `WhatsAppService->buildComponents()` maps these to Meta's positional `body.parameters` array.
- A template seed runs on clinic creation: fr+ar+en versions of `appointment_confirmation`, `appointment_reminder_24h`, `appointment_reminder_2h`, `password_reset`, `share_request_consent`.

=== partition rules ===

# Partitioned tables — rotation

Four tables are RANGE-partitioned by month: `notifications`, `message_log`, `activity_log`, `medical_records`.

The schema seeds partitions for 2026-05, 06, 07 plus a default. Without rotation, after 2026-07 everything spills into `*_default` and indexes degrade.

## Scheduled command

```php
// app/Console/Commands/RotatePartitionsCommand.php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class RotatePartitionsCommand extends Command
{
    protected $signature = 'partitions:rotate {--months=3 : Months ahead to create}';

    public function handle(): int
    {
        $tables = ['notifications', 'message_log', 'activity_log', 'medical_records'];
        $months = (int) $this->option('months');

        foreach ($tables as $table) {
            for ($i = 0; $i <= $months; $i++) {
                $start = Carbon::now()->startOfMonth()->addMonths($i);
                $end   = (clone $start)->addMonth();
                $name  = sprintf('%s_%s', $table, $start->format('Y_m'));

                DB::statement(sprintf(
                    "CREATE TABLE IF NOT EXISTS %s PARTITION OF %s FOR VALUES FROM ('%s') TO ('%s')",
                    $name, $table, $start->toDateString(), $end->toDateString()
                ));
            }
        }

        return self::SUCCESS;
    }
}
```

Register in `routes/console.php`:

```php
Schedule::command('partitions:rotate')->monthlyOn(1, '02:00');
```

Plus a deploy-time `php artisan partitions:rotate` so a fresh deploy never lands without next month's partition.

=== job rules ===

# Queues & jobs

- Default queue: Redis.
- Three named queues: `default`, `whatsapp`, `mail`.
- WhatsApp jobs: `tries = 3`, `backoff = [60, 300, 1800]` (1 min, 5 min, 30 min).
- Email jobs: `tries = 3`, `backoff = [30, 120, 600]`.
- All jobs inherit `TenantAwareJob`:

```php
namespace App\Jobs;

use App\Models\Clinic;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

abstract class TenantAwareJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly string $clinicId,
        public readonly ?string $userId = null,
    ) {}

    public function handle(): void
    {
        DB::statement('SELECT set_config(?, ?, true)', ['app.current_clinic_id', $this->clinicId]);
        if ($this->userId !== null) {
            DB::statement('SELECT set_config(?, ?, true)', ['app.current_user_id', $this->userId]);
        }

        $this->handleWithTenantContext();
    }

    abstract protected function handleWithTenantContext(): void;
}
```

- Horizon (or a Supervisor-managed `queue:work`) runs three workers, one per queue.
- Failed jobs go to `failed_jobs` table; super-admin panel surfaces them.

=== sequence rules ===

# Per-clinic numeric sequences

The schema includes `clinic_sequences` and `fn_next_seq()`. Sequences needed at signup:
`patient_code`, `appointment_number`, `prescription_number`, `lab_order_number`, `invoice_number`, `payment_number`, `expense_number`.

Bootstrap them in the clinic-creation transaction:

```php
DB::transaction(function () use ($clinicId) {
    $clinic = Clinic::create([/* ... */]);
    foreach (['patient_code' => 'PAT-', 'appointment_number' => 'APT-',
              'prescription_number' => 'RX-', 'lab_order_number' => 'LAB-',
              'invoice_number' => 'INV-', 'payment_number' => 'PAY-',
              'expense_number' => 'EXP-'] as $name => $prefix) {
        ClinicSequence::create([
            'clinic_id'     => $clinic->id,
            'sequence_name' => $name,
            'prefix'        => $prefix,
        ]);
    }
});
```

Service wrapper to allocate the next value:

```php
namespace App\Services;

use Illuminate\Support\Facades\DB;

class SequenceService
{
    public function next(string $clinicId, string $sequenceName): string
    {
        return DB::selectOne(
            'SELECT fn_next_seq(?::uuid, ?) AS value',
            [$clinicId, $sequenceName]
        )->value;
    }
}
```

Always call from inside a transaction so the row-level lock holds.

=== audit rules ===

# Audit logging

Every write goes to `activity_log` (partitioned). Implement via model observers:

```php
namespace App\Observers;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class AuditObserver
{
    public function created(Model $model): void { $this->log($model, 'created'); }
    public function updated(Model $model): void { $this->log($model, 'updated', $model->getChanges()); }
    public function deleted(Model $model): void { $this->log($model, 'deleted'); }

    private function log(Model $model, string $action, array $changes = []): void
    {
        ActivityLog::create([
            'clinic_id'    => $model->clinic_id ?? null,
            'user_id'      => DB::selectOne('SELECT fn_current_user_id() AS uid')->uid,
            'entity_type'  => $model::class,
            'entity_id'    => $model->getKey(),
            'action'       => $action,
            'changes'      => $changes,
            'ip_address'   => request()?->ip(),
            'user_agent'   => request()?->userAgent(),
            'occurred_at'  => now(),
        ]);
    }
}
```

Register observers in `AppServiceProvider::boot()`. Apply to: `Patient`, `Appointment`, `Prescription`, `LabOrder`, `Invoice`, `Payment`, `MedicalRecord`, `User` (account creation), `PatientShareRequest`.

Do NOT audit: `MessageLog`, `Notification`, `ActivityLog` itself, partition-rotation, schema/migration runs.

=== security rules ===

# Security & compliance

## Encryption at rest (application-side)

These columns use the Laravel `encrypted` cast. The schema stores them as `TEXT` (ciphertext).

| Table | Column | Reason |
|---|---|---|
| `patients` | `national_id` | PII / national identifier (CIN in Morocco) |
| `patients` | `insurance_number` | financial / insurance identifier |
| `medical_records` | `diagnosis` | sensitive medical content |
| `medical_records` | `notes` | sensitive clinical notes |
| `whatsapp_integration` | `access_token` | API credential |
| `email_integration` | `smtp_password` | SMTP credential |

If any of these columns are NOT in the schema as expected, flag in `99-open-questions.md` — do not silently add them.

## Rate limiting

- Auth endpoints: 5 requests / minute / IP (Fortify default; raise threshold for `/two-factor-challenge` to 6).
- Public webhook endpoints (WhatsApp): no rate limit, but verify `webhook_verify_token` strictly.
- Patient confirmation signed routes: 10 requests / minute / signed-URL (prevents abuse of leaked links).
- Account-creation routes (`/admin/staff/*`): 20 / hour / clinic_admin.

## Data retention

| Table | Retention | Action |
|---|---|---|
| `message_log` (partitioned) | 24 months | Drop partitions older than 24 months via scheduled command |
| `activity_log` (partitioned) | 7 years | Required for medical-record audit traceability (Loi 09-08 + best practice) |
| `medical_records` (partitioned) | Indefinite | Medical records must be preserved per Moroccan health regulations |
| `notifications` (partitioned) | 6 months | Drop partitions older than 6 months |

## Patient data export & erasure (GDPR + Loi 09-08)

- Export: `GET /admin/patients/{patient}/export` — clinic_admin only. Returns a signed JSON download bundling patient + appointments + prescriptions + invoices + medical_records.
- Erasure: `DELETE /admin/patients/{patient}/erase` — clinic_admin only. **Anonymizes** (sets PII to deterministic hashes) rather than hard-deleting, because medical-record retention laws supersede erasure rights in Morocco. The operation is logged to `activity_log` with `action='erased'`.

=== devops rules ===

# DevOps — VPS + Docker

## Containers

```yaml
# docker-compose.yml (production-like)
services:
  app:        # php-fpm 8.4, Laravel app code
  web:        # nginx, serves /public, proxies to app
  db:         # postgres:16 with init script enabling pgcrypto, btree_gist, citext, pg_trgm
  redis:      # redis:7
  queue:      # horizon (or queue:work supervisor)
  scheduler:  # cron container running schedule:run every minute
```

## Migration discipline

- Production: `php artisan migrate --force --no-interaction` only.
- Never `migrate:fresh` in production.
- Partition rotation runs **before** the deploy command swaps containers.

## Backups

- `pg_dump` daily at 03:00 UTC; output encrypted with `age` or `gpg`; uploaded to off-site object storage (S3-compatible).
- Retention: 30 days rolling + 1 monthly snapshot kept for 12 months.
- Quarterly restore drill: spin up an isolated container, restore the latest backup, run a Pest smoke test.

## Monitoring

- Errors: Sentry (free tier viable).
- Uptime: external pinger (e.g. UptimeRobot).
- Logs: `pail` during dev; in prod, Laravel writes JSON to stdout; container log driver ships to a log aggregator (Loki / CloudWatch / Vector → S3).
- PostgreSQL: enable `pg_stat_statements`; monitor slow queries weekly.

## PostgreSQL tuning (for ~4-8 GB VPS)

| Setting | Value | Reason |
|---|---|---|
| `shared_buffers` | 1GB | ~25% of RAM |
| `effective_cache_size` | 3GB | ~75% of RAM |
| `work_mem` | 16MB | conservative; raise for reporting queries |
| `maintenance_work_mem` | 256MB | for VACUUM, REINDEX |
| `random_page_cost` | 1.1 | assumes SSD |
| `effective_io_concurrency` | 200 | SSD |
| `enable_partition_pruning` | on | partitioned tables need this |
| `constraint_exclusion` | partition | partitioned tables |

=== phases rules ===

# Phased implementation plan — exit-gated by tests

Each phase has a deliverables list and an **exit-gate test list**. Do not start phase N+1 until phase N's tests pass with `php artisan test --compact`.

## Phase 0 — Project bootstrap

**Deliverables**

- Sail up; PostgreSQL 16 with required extensions.
- Migrations translated from `schema.sql` (extensions + helper functions + all tables, in schema order).
- RLS enable migration (last).
- `SetTenantContext` middleware + `TenantAwareJob` base class.
- Pint and Pest configured.
- `.env.example` with all needed env vars.

**Exit-gate tests**

- `tests/Feature/SchemaIntegrityTest.php` — every table from `schema.sql` exists with the right columns (use `Schema::hasColumn()` assertions).
- `tests/Feature/RlsIsolationTest.php` — open two transactions with different `app.current_clinic_id`; row inserted in one is not visible in the other.
- `tests/Feature/TenantContextMiddlewareTest.php` — authenticated request sets session vars; unauthenticated request does not.

## Phase 1 — Fortify auth + roles

**Deliverables**

- Fortify configured (features listed earlier).
- `LoginResponse` override redirecting per role.
- All four role types seeded (one super_admin via artisan command, one demo clinic with admin + 2 doctors + 3 secretaries).
- `EnsureRole` middleware (`middleware('role:doctor')`).
- Policies for `User`, `Patient`, `Appointment`, `Invoice`, `MedicalRecord`, `Prescription`.

**Exit-gate tests**

- `tests/Feature/Auth/LoginRedirectsByRoleTest.php`.
- `tests/Feature/Auth/AccountCapsTest.php` — clinic_admin cannot create a 3rd doctor (HTTP 422); cannot create a 4th secretary; cannot demote themselves to doctor.
- `tests/Feature/Auth/PasswordResetTest.php` — works via email; works via WhatsApp when phone present and clinic integration configured.

## Phase 2 — Patients module

**Deliverables**

- `PatientController` (resource), `StorePatientRequest`, `UpdatePatientRequest`.
- `PatientCommunicationPreference` model + observer that creates defaults.
- `VitalSigns` model + endpoints (doctor / secretary).
- Wayfinder regenerated. Localized validation messages in fr/ar/en.

**Exit-gate tests**

- CRUD test per role (matrix from permission table).
- `tests/Feature/Patients/CrossClinicIsolationTest.php` — clinic A cannot list clinic B patients.

## Phase 3 — Appointments + WhatsApp confirmation

**Deliverables**

- `AppointmentController` (index, store, show, update, destroy, confirm, cancel, follow-up).
- `WhatsAppService` + `SendAppointmentConfirmationWhatsApp` job.
- Signed-route for confirmation.
- Webhook routes (verification + status callback).
- `MessageTemplate` seeds (fr/ar/en) for `appointment_confirmation`, `appointment_reminder_24h`, `appointment_reminder_2h`.
- Secretary dashboard endpoint backed by `v_appointments_needing_followup`.

**Exit-gate tests**

- End-to-end confirmation: create appointment → mock WhatsApp → assert message_log row → hit signed URL → assert status updated.
- Expired token rejected (>48h).
- Secretary follow-up flow updates `follow_up_call_status`.

## Phase 4 — Prescriptions, lab orders, medical records (with encryption)

**Deliverables**

- Models, FormRequests, controllers for `Prescription` + `PrescriptionItem`, `LabOrder` + `LabOrderItem`, `MedicalRecord`.
- Encryption applied to medical record `diagnosis` and `notes`.
- Medication search via pg_trgm (existing index).
- Drug-interaction warnings at prescription creation (read from `drug_interactions`).

**Exit-gate tests**

- Doctor creates prescription; secretary cannot (HTTP 403).
- Medical record encrypted at rest (raw DB query returns ciphertext; Eloquent returns plaintext).
- Drug-interaction warning surfaces when conflicting medications co-prescribed.

## Phase 5 — Billing (cash + bank_wire)

**Deliverables**

- `InvoiceController`, `PaymentController`.
- `PaymentGateway` interface + `CashGateway` + `BankWireGateway`.
- `CmiGateway` and `StripeGateway` commented stub files.
- `ExpenseController`, `VendorController`.
- Per-clinic sequence usage for invoice / payment / expense numbers.
- `fn_sync_invoice_paid_amount` trigger relied on; verify behavior in tests.

**Exit-gate tests**

- Recording cash payment marks invoice partially / fully paid via trigger.
- Refund creates a `payment_status='refunded'` row and adjusts `paid_amount`.
- Sequence rollover under concurrent inserts gives no duplicates (stress test with `php artisan test --parallel`).

## Phase 6 — Inventory + documents

**Deliverables**

- `InventoryController`, `InventoryTransactionController`.
- `DocumentFolderController`, `DocumentController` (file uploads to local `storage/app/private/clinics/{clinic_id}/`).
- `v_inventory_alerts` consumed by clinic_admin dashboard.

**Exit-gate tests**

- Inventory transaction in/out updates stock count.
- Document upload tagged with `clinic_id`; cross-clinic read blocked.
- Low-stock and expiring-soon items surface via the view.

## Phase 7 — Super-admin panel + cross-tenant reporting

**Deliverables**

- `/super-admin/*` routes guarded by `role:super_admin`.
- Clinic suspension / restore.
- Cross-tenant metrics (total clinics, MRR, active appointments) via `fn_is_super_admin()=true` queries.
- Impersonation of a clinic_admin (audited).

**Exit-gate tests**

- Non-super_admin gets 403.
- Impersonation logs an `activity_log` row with `action='impersonated'`.

## Phase 8 — Global patient access + per-field provenance audit

> **Pivot (2026-05-22):** the original consented-sharing flow defined here
> was redirected to "every clinic sees every patient with per-field
> provenance attribution" under Option A. See
> `docs/architecture/07-implementation-roadmap.md` Phase 8 entry and open
> questions #13–#16. The original deliverable list is preserved below for
> archival reference but is NOT what Phase 8 implements.

**Shipped deliverables (canonical):**

- RLS disabled on nine clinical tables via deviation migration
  (`2026_05_22_000010_disable_rls_on_clinical_tables`).
- `activity_log.actor_clinic_id` column (`2026_05_22_000020`) so audit rows
  attribute the editor's clinic alongside the record's origin clinic.
- New `field_changes` table (`2026_05_22_000030`) — one row per changed
  attribute, with editor's user/clinic + record's origin clinic.
- `AuditObserver` extended to write per-field rows for Patient, Appointment,
  MedicalRecord, Prescription, LabOrder.
- Five clinical policies stripped of clinic-membership gates (view + update
  + create); Patient `export` / `erase` keep the origin-clinic carve-out for
  Loi 09-08 / GDPR.
- `PatientController` / `AppointmentController` index auto-scope removed;
  `origin_clinic` query-param filter added.
- Deferred `provenance` Inertia prop on Patient / Appointment / MedicalRecord
  / Prescription / LabOrder show pages, fed by `FieldChange::recentForEntity`.
- Shared `provenance-panel.tsx` React component.
- Localization in fr/ar/en (`provenance.php` + `patients.php` keys).

**Exit-gate tests (under the pivoted scope):**

- Cross-clinic patient read + update succeeds for clinic_admin / doctor /
  secretary (`CrossClinicPatientAccessTest`).
- Cross-clinic clinical write (medical record / prescription / lab order)
  succeeds; the record's `clinic_id` is the editor's clinic
  (`CrossClinicClinicalWriteTest`).
- Patient erasure remains restricted to the origin clinic_admin
  (`PatientErasureRestrictedTest`).
- One `field_changes` row per changed attribute, encrypted SOAP fields
  excluded (`PerFieldAuditTest`, `EncryptedFieldsExcludedFromProvenanceTest`).
- `activity_log.actor_clinic_id` populated correctly
  (`ActivityLogActorClinicTest`).

---

### Archival reference: original IG Phase 8 (NOT IMPLEMENTED)

**Deliverables**

- `PatientShareRequestController` (store, approve, reject, expire).
- WhatsApp consent flow: from_clinic requests → patient receives consent message → reply or signed-link approval → to_clinic gains read access.
- Scheduled job expires pending requests after N days.

**Exit-gate tests**

- Approved share grants `to_clinic_id` read access (RLS policy covers both clinics).
- Expired request denies access.
- Rejection is final (cannot be re-approved).

## Phase 9 — Localization parity + hardening

**Deliverables**

- Audit: every user-facing string exists in fr/ar/en.
- RTL CSS check in the existing Carbon panels (Tailwind `dir-rtl` aware).
- Backup restore drill executed.
- Rate limits applied per the security section.
- Sentry wired up; `pail` removed from prod config.

**Exit-gate tests**

- `tests/Feature/Localization/StringCoverageTest.php` — every key in `lang/fr/*` has a counterpart in `lang/ar/*` and `lang/en/*`.
- Rate-limit tests on auth endpoints, signed confirmation routes, staff-creation routes.

=== testing rules ===

# Testing — Pest 4 conventions

- Every feature → at least one feature test.
- Use `RefreshDatabase` trait (Laravel's `Illuminate\Foundation\Testing\RefreshDatabase`).
- Factories for every model; states for common variants (`->doctor()`, `->secretary()`, `->withTwoFactor()`).
- Browser tests via Pest Browser for the confirmation-URL flow (the only public-facing UI patients see).
- Test naming: `php artisan make:test --pest {Domain}/{Action}Test` — e.g. `Appointments/ConfirmTest`, `Auth/AccountCapsTest`.
- Always run `php artisan test --compact` with a `--filter` while iterating.
- Pint runs before every commit (`vendor/bin/pint --dirty --format agent`).

## Required test categories per phase

| Category | What it asserts |
|---|---|
| Permission tests | Each role × each action matches the permission matrix |
| RLS tests | Cross-tenant data invisible without super_admin bypass |
| Soft-delete tests | Unique constraints respect `deleted_at IS NULL` partial indexes |
| Sequence tests | No duplicates under concurrent allocation |
| Encryption tests | Sensitive columns stored as ciphertext |
| Localization tests | fr/ar/en parity |
| Webhook tests | Verification handshake + signed payload validation |

=== verification rules ===

# Self-verification before declaring phase complete

After every phase, the agent must:

1. Run `php artisan test --compact` and confirm green for that phase's tests.
2. Run `vendor/bin/pint --dirty --format agent`.
3. Run `php artisan wayfinder:generate --with-form --no-interaction`.
4. Append a "Phase N complete" entry to `docs/architecture/07-implementation-roadmap.md` with the date and test run summary.
5. Update `99-open-questions.md` if anything came up.
6. Stop and wait for human approval before starting phase N+1.

=== forbidden rules ===

# Forbidden — do not do any of these

- Do not run `php artisan migrate:fresh` outside of test DB.
- Do not install new composer or npm packages without explicit approval.
- Do not modify `schema.sql` (treat as read-only reference).
- Do not modify the existing React frontend code the user uploads separately.
- Do not implement Stripe, CMI, Twilio SMS, push notifications, telemedicine, or any feature outside the four scoped areas.
- Do not introduce Sanctum tokens, Passport, or JWT — Fortify session auth only.
- Do not bypass RLS by issuing `BYPASSRLS` or running queries with `set_config(app.is_super_admin, true)` outside super-admin code paths.
- Do not write controller-inline validation; always use a FormRequest.
- Do not write Eloquent queries that don't go through a request with `SetTenantContext` middleware (which means: no Eloquent in `routes/console.php` without setting context first).
- Do not skip writing tests "because the change is trivial."
- Do not echo passwords, tokens, or WhatsApp access tokens to logs.

</clinic-saas-implementation-guide>
