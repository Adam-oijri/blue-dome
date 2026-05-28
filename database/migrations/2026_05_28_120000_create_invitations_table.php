<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tokenized staff invitations. A super-admin creates an invitation (name +
 * clinic + role) and shares the generated link; the invitee opens it and sets
 * their own email + password to activate the account.
 *
 * No RLS policy is attached: access is via the super-admin (cross-tenant by
 * design) and a public, token-secured acceptance endpoint — the secret token
 * is the access control, not row-level tenant isolation.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invitations', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('clinic_id')->constrained('clinics')->cascadeOnDelete();
            $table->string('role')->default('doctor');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('token', 64)->unique();
            $table->foreignUuid('invited_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('expires_at');
            $table->timestamp('accepted_at')->nullable();
            $table->foreignUuid('accepted_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invitations');
    }
};
