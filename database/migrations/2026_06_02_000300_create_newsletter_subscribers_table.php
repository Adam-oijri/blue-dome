<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Public marketing newsletter list. Intentionally NOT clinic-scoped and NOT
 * under RLS — signups come from the public landing page (guest requests with
 * no tenant context) and the list spans all visitors, not a single clinic.
 * `email` is CITEXT so addresses are unique case-insensitively, matching how
 * clinic/user emails are stored.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement(<<<'SQL'
            CREATE TABLE newsletter_subscribers (
                id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email            CITEXT NOT NULL UNIQUE,
                locale           VARCHAR(10),
                status           VARCHAR(20) NOT NULL DEFAULT 'subscribed'
                                 CHECK (status IN ('subscribed', 'unsubscribed')),
                subscribed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                unsubscribed_at  TIMESTAMPTZ,
                created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        SQL);
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS newsletter_subscribers');
    }
};
