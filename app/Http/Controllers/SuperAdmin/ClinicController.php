<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdmin\RestoreClinicRequest;
use App\Http\Requests\SuperAdmin\SuspendClinicRequest;
use App\Models\ActivityLog;
use App\Models\Clinic;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ClinicController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Clinic::class);

        $search = $request->string('search')->toString();
        $status = $request->string('status')->toString();

        $query = Clinic::query()->withCount(['users', 'patients']);

        if ($search !== '') {
            $like = '%'.$search.'%';
            $query->where(function ($q) use ($like): void {
                $q->where('name', 'ilike', $like)
                    ->orWhere('slug', 'ilike', $like)
                    ->orWhere('email', 'ilike', $like);
            });
        }

        if ($status !== '' && in_array($status, ['active', 'trial', 'suspended', 'cancelled', 'expired'], true)) {
            $query->where('subscription_status', $status);
        }

        return Inertia::render('panels/super-admin/clinics/index', [
            'clinics' => $query
                ->orderBy('name')
                ->paginate(25)
                ->withQueryString(),
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function show(string $locale, Clinic $clinic): Response
    {
        unset($locale);
        $this->authorize('view', $clinic);

        $clinic->loadCount(['users', 'patients']);

        $manager = User::query()
            ->where('clinic_id', $clinic->id)
            ->where('role', 'secretary')
            ->orderBy('created_at')
            ->first(['id', 'first_name', 'last_name', 'email']);

        return Inertia::render('panels/super-admin/clinics/show', [
            'clinic' => $clinic,
            'manager' => $manager,
        ]);
    }

    public function suspend(SuspendClinicRequest $request, string $locale, Clinic $clinic): RedirectResponse
    {
        unset($locale);
        $old = [
            'subscription_status' => $clinic->subscription_status,
            'is_active' => $clinic->is_active,
        ];

        DB::transaction(function () use ($clinic, $request, $old): void {
            $clinic->forceFill([
                'subscription_status' => 'suspended',
                'is_active' => false,
            ])->save();

            ActivityLog::create([
                'clinic_id' => $clinic->id,
                'user_id' => $request->user()->id,
                'action' => 'subscription_changed',
                'entity_type' => 'Clinic',
                'entity_id' => $clinic->id,
                'description' => $request->string('reason')->toString(),
                'old_values' => $old,
                'new_values' => [
                    'subscription_status' => 'suspended',
                    'is_active' => false,
                ],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'session_id' => $request->hasSession() ? $request->session()->getId() : null,
                'created_at' => now(),
            ]);
        });

        return back()->with('toast', [
            'type' => 'success',
            'message' => __('super_admin.clinic_suspended', ['name' => $clinic->name]),
        ]);
    }

    public function restore(RestoreClinicRequest $request, string $locale, Clinic $clinic): RedirectResponse
    {
        unset($locale);
        $old = [
            'subscription_status' => $clinic->subscription_status,
            'is_active' => $clinic->is_active,
        ];

        $newStatus = $clinic->subscription_expiry !== null
            && Carbon::parse($clinic->subscription_expiry)->isFuture()
                ? 'active'
                : 'trial';

        DB::transaction(function () use ($clinic, $request, $old, $newStatus): void {
            $clinic->forceFill([
                'subscription_status' => $newStatus,
                'is_active' => true,
            ])->save();

            ActivityLog::create([
                'clinic_id' => $clinic->id,
                'user_id' => $request->user()->id,
                'action' => 'subscription_changed',
                'entity_type' => 'Clinic',
                'entity_id' => $clinic->id,
                'description' => $request->string('reason')->toString() ?: null,
                'old_values' => $old,
                'new_values' => [
                    'subscription_status' => $newStatus,
                    'is_active' => true,
                ],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'session_id' => $request->hasSession() ? $request->session()->getId() : null,
                'created_at' => now(),
            ]);
        });

        return back()->with('toast', [
            'type' => 'success',
            'message' => __('super_admin.clinic_restored', ['name' => $clinic->name]),
        ]);
    }
}
