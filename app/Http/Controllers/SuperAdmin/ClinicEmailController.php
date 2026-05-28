<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClinicSettings\UpdateEmailRequest;
use App\Models\Clinic;
use App\Models\EmailIntegration;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ClinicEmailController extends Controller
{
    public function edit(string $locale, Clinic $clinic): Response
    {
        unset($locale);
        $this->authorize('update', $clinic);

        $integration = $clinic->emailIntegration;

        return Inertia::render('panels/super-admin/clinics/email', [
            'clinic' => [
                'id' => $clinic->id,
                'name' => $clinic->name,
            ],
            'integration' => [
                'from_email' => $integration?->from_email ?? $clinic->email,
                'from_name' => $integration?->from_name ?? $clinic->name,
                'reply_to' => $integration?->reply_to,
            ],
        ]);
    }

    public function update(UpdateEmailRequest $request, string $locale, Clinic $clinic): RedirectResponse
    {
        unset($locale);
        $this->authorize('update', $clinic);

        $validated = $request->validated();
        $integration = EmailIntegration::firstOrNew(['clinic_id' => $clinic->id]);

        if (! $integration->exists) {
            $integration->provider = 'smtp';
            $integration->is_active = true;
        }

        $integration->from_email = $validated['from_email'];
        $integration->from_name = $validated['from_name'] ?? null;
        $integration->reply_to = $validated['reply_to'] ?? null;

        $integration->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Email settings saved.')]);

        return to_route('super-admin.clinics.email.edit', ['clinic' => $clinic->id]);
    }
}
