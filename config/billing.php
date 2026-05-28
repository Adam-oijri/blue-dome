<?php

/*
|--------------------------------------------------------------------------
| Billing — per-plan pricing (Phase 7 placeholder)
|--------------------------------------------------------------------------
|
| Phase 7 surfaces an MRR metric on the super-admin dashboard. The schema
| does NOT yet model per-plan pricing (no clinic_subscription_plans table,
| no price column on the clinics row). Until product/finance signs off the
| canonical pricing source, the dashboard reads these placeholder values
| in MAD. Open question #11 in docs/architecture/99-open-questions.md
| tracks the resolution.
|
| When the canonical source lands (e.g. a `subscription_plans` table or a
| Stripe price catalogue), replace `config('billing.plan_prices')` with a
| service that reads it; the SuperAdminMetricsService is the only call
| site that needs updating.
|
*/

return [
    'currency' => 'MAD',

    'plan_prices' => [
        'free' => 0,
        'basic' => 199,
        'professional' => 499,
        'enterprise' => 1499,
    ],
];
