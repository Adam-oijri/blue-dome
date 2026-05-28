# Schema Changelog — v2

Changes applied to `schema_fixed.sql` (your original upload) to produce `schema.sql` in this bundle.

## 1. Role model — 4 roles only

**Before:** `users.role` accepted `admin, doctor, secretary, nurse, accountant, lab_technician`.

**After:** `users.role` accepts only `super_admin, clinic_admin, doctor, secretary`.

Rationale: matches the business model you described. `nurse`, `accountant`, and `lab_technician` are not part of the panel scope; `admin` was ambiguous between platform-level and clinic-level admin and is now split.

## 2. Exactly one `clinic_admin` per clinic

New partial unique index:

```sql
CREATE UNIQUE INDEX uq_users_one_clinic_admin
    ON users(clinic_id)
    WHERE role = 'clinic_admin' AND deleted_at IS NULL;
```

Soft-deleted rows are excluded, so restoring an admin won't be blocked by a replacement that already filled the seat — but you cannot have two active admins simultaneously.

## 3. Per-clinic account caps enforced in the database

New trigger function `fn_enforce_user_role_caps()` raises `check_violation` if:

- A clinic already has **2 active doctors** and a third is inserted/restored.
- A clinic already has **3 active secretaries** and a fourth is inserted/restored.

Trigger fires on `INSERT` and on `UPDATE` of `role`, `deleted_at`, or `clinic_id`. The application layer (Laravel FormRequest) should still validate first to return a clean HTTP 422 — the trigger is the last-line defense.

## 4. Payment methods — restricted to current scope

**Before:** `payments.payment_method` accepted `cash, credit_card, debit_card, bank_transfer, check, insurance, mobile_payment, other`.

**After:** accepts only `cash, bank_wire`. `cmi` and `stripe` are present as **commented-out** values in the CHECK constraint:

```sql
payment_method  VARCHAR(50) NOT NULL CHECK (payment_method IN
                ('cash','bank_wire'
                 -- ,'cmi'      -- TODO: enable when CmiGateway is implemented
                 -- ,'stripe'   -- TODO: enable when StripeGateway is implemented
                ))
```

When you're ready to ship CMI or Stripe support, uncomment the line and run an `ALTER TABLE ... DROP CONSTRAINT / ADD CONSTRAINT` migration (Laravel migration template included as a comment placeholder in the architecture spec phase 5 deliverable).

## 5. Header comment updated

Top-of-file block now documents the role model, the account caps, and the payment-method scope so a new developer reading the schema understands the business rules without hunting through the file.

---

## What was NOT changed

- All RLS policies remain intact.
- Partitioned tables (`notifications`, `message_log`, `activity_log`, `medical_records`) unchanged — partition rotation strategy is documented in `06-devops.md` of the architecture spec.
- Cross-clinic `patient_share_requests` unchanged.
- WhatsApp / email integration tables unchanged.
- `doctor_profiles` unchanged (still references `users` via `user_id`).
- All sequences, triggers, and helper functions (`fn_set_updated_at`, `fn_current_clinic_id`, `fn_is_super_admin`, etc.) unchanged.
- `invoices.payment_method` and `expenses.payment_method` are free-text informational fields (no CHECK constraint) — left as-is.

## Migration note

If you already have a database running the v1 schema, a `psql` migration is straightforward:

```sql
-- 1. Update existing users (map old roles to new)
UPDATE users SET role = 'clinic_admin' WHERE role = 'admin';
DELETE FROM users WHERE role IN ('nurse','accountant','lab_technician');  -- or migrate as appropriate

-- 2. Replace the CHECK constraint
ALTER TABLE users DROP CONSTRAINT users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role IN ('super_admin','clinic_admin','doctor','secretary'));

-- 3. Add the partial unique index (will fail if you have multiple admins per clinic — clean up first)
CREATE UNIQUE INDEX uq_users_one_clinic_admin
    ON users(clinic_id)
    WHERE role = 'clinic_admin' AND deleted_at IS NULL;

-- 4. Add the cap trigger (function + trigger DDL from schema.sql section 2.4.1)

-- 5. Payment methods: map old values, then replace CHECK
UPDATE payments SET payment_method = 'bank_wire'
    WHERE payment_method IN ('bank_transfer','check');
UPDATE payments SET payment_method = 'cash'
    WHERE payment_method IN ('credit_card','debit_card','insurance','mobile_payment','other');
ALTER TABLE payments DROP CONSTRAINT payments_payment_method_check;
ALTER TABLE payments ADD CONSTRAINT payments_payment_method_check
    CHECK (payment_method IN ('cash','bank_wire'));
```

If this is a fresh deploy, just run `schema.sql` directly — no migration needed.
