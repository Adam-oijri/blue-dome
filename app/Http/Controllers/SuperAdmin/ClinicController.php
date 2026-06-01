<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Concerns\ExportsCsv;
use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdmin\CreateClinicRequest;
use App\Http\Requests\SuperAdmin\RestoreClinicRequest;
use App\Http\Requests\SuperAdmin\SuspendClinicRequest;
use App\Http\Requests\SuperAdmin\UpdateClinicRequest;
use App\Models\ActivityLog;
use App\Models\Clinic;
use App\Models\User;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ClinicController extends Controller
{
    use ExportsCsv;

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Clinic::class);

        return Inertia::render('panels/super-admin/clinics/index', [
            'clinics' => $this->filteredQuery($request)
                ->orderBy('name')
                ->paginate(25)
                ->withQueryString(),
            'filters' => [
                'search' => $request->string('search')->toString(),
                'status' => $request->string('status')->toString(),
            ],
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $this->authorize('viewAny', Clinic::class);

        $query = $this->filteredQuery($request)->orderBy('name');

        $ids = $request->input('ids');
        if (is_array($ids) && $ids !== []) {
            $query = Clinic::query()->withCount(['users', 'patients'])->whereIn('id', $ids)->orderBy('name');
        }

        return $this->streamCsv(
            $query,
            'clinics-'.now()->format('Y-m-d').'.csv',
            ['Name', 'Slug', 'Country', 'Plan', 'Status', 'Active', 'Users', 'Patients', 'Created'],
            fn (Clinic $c) => [
                $c->name,
                $c->slug,
                $c->country,
                $c->subscription_plan,
                $c->subscription_status,
                $c->is_active ? 'yes' : 'no',
                $c->users_count,
                $c->patients_count,
                $c->created_at?->toDateString() ?? '',
            ],
        );
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

    public function create(string $locale): Response
    {
        unset($locale);
        $this->authorize('create', Clinic::class);

        return Inertia::render('panels/super-admin/clinics/create');
    }

    public function store(CreateClinicRequest $request, string $locale): RedirectResponse
    {
        unset($locale);

        $validated = $request->validated();

        $clinic = Clinic::create([
            ...$validated,
            'slug' => $this->uniqueSlug($validated['name']),
            'is_active' => $validated['is_active'] ?? true,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Clinic :name created.', ['name' => $clinic->name])]);

        return back();
    }

    public function edit(string $locale, Clinic $clinic): Response
    {
        unset($locale);
        $this->authorize('update', $clinic);

        return Inertia::render('panels/super-admin/clinics/edit', [
            'clinic' => $clinic->only([
                'id', 'name', 'email', 'phone', 'address', 'city', 'country', 'postal_code',
                'currency', 'timezone', 'locale', 'date_format', 'subscription_plan',
                'subscription_status', 'subscription_expiry', 'max_users', 'max_branches',
                'max_storage_mb', 'is_active',
            ]),
        ]);
    }

    public function update(UpdateClinicRequest $request, string $locale, Clinic $clinic): RedirectResponse
    {
        unset($locale);

        $clinic->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Clinic :name updated.', ['name' => $clinic->name])]);

        return to_route('super-admin.clinics.show', ['clinic' => $clinic->id]);
    }

    public function suspend(SuspendClinicRequest $request, string $locale, Clinic $clinic): RedirectResponse
    {
        unset($locale);

        DB::transaction(fn () => $this->applySuspension($clinic, $request, $request->string('reason')->toString()));

        return back()->with('toast', [
            'type' => 'success',
            'message' => __('super_admin.clinic_suspended', ['name' => $clinic->name]),
        ]);
    }

    public function restore(RestoreClinicRequest $request, string $locale, Clinic $clinic): RedirectResponse
    {
        unset($locale);

        DB::transaction(fn () => $this->applyRestoration($clinic, $request, $request->string('reason')->toString() ?: null));

        return back()->with('toast', [
            'type' => 'success',
            'message' => __('super_admin.clinic_restored', ['name' => $clinic->name]),
        ]);
    }

    public function bulk(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'action' => ['required', Rule::in(['suspend', 'restore'])],
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['uuid'],
        ]);

        $action = $validated['action'];
        $affected = 0;

        DB::transaction(function () use ($validated, $action, $request, &$affected): void {
            $clinics = Clinic::query()->whereIn('id', $validated['ids'])->get();

            foreach ($clinics as $clinic) {
                if ($action === 'suspend') {
                    if ($request->user()->cannot('suspend', $clinic)) {
                        continue;
                    }
                    $this->applySuspension($clinic, $request, __('Bulk suspend'));
                } else {
                    if ($request->user()->cannot('restore', $clinic)) {
                        continue;
                    }
                    $this->applyRestoration($clinic, $request, null);
                }

                $affected++;
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => trans_choice(':count clinic updated|:count clinics updated', $affected, ['count' => $affected])]);

        return back();
    }

    protected function filteredQuery(Request $request): Builder
    {
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

        return $query;
    }

    /**
     * Generate a globally-unique clinic slug (the column is UNIQUE and the
     * uniqueness must hold against soft-deleted rows too).
     */
    private function uniqueSlug(string $name): string
    {
        do {
            $slug = Str::slug($name).'-'.Str::lower(Str::random(6));
        } while (Clinic::withTrashed()->where('slug', $slug)->exists());

        return $slug;
    }

    private function applySuspension(Clinic $clinic, Request $request, ?string $reason): void
    {
        $old = [
            'subscription_status' => $clinic->subscription_status,
            'is_active' => $clinic->is_active,
        ];

        $clinic->forceFill([
            'subscription_status' => 'suspended',
            'is_active' => false,
        ])->save();

        $this->logSubscriptionChange($clinic, $request, $reason, $old, [
            'subscription_status' => 'suspended',
            'is_active' => false,
        ]);
    }

    private function applyRestoration(Clinic $clinic, Request $request, ?string $reason): void
    {
        $old = [
            'subscription_status' => $clinic->subscription_status,
            'is_active' => $clinic->is_active,
        ];

        $newStatus = $clinic->subscription_expiry !== null
            && Carbon::parse($clinic->subscription_expiry)->isFuture()
                ? 'active'
                : 'trial';

        $clinic->forceFill([
            'subscription_status' => $newStatus,
            'is_active' => true,
        ])->save();

        $this->logSubscriptionChange($clinic, $request, $reason, $old, [
            'subscription_status' => $newStatus,
            'is_active' => true,
        ]);
    }

    /**
     * @param  array<string, mixed>  $old
     * @param  array<string, mixed>  $new
     */
    private function logSubscriptionChange(Clinic $clinic, Request $request, ?string $reason, array $old, array $new): void
    {
        ActivityLog::create([
            'clinic_id' => $clinic->id,
            'user_id' => $request->user()->id,
            'action' => 'subscription_changed',
            'entity_type' => 'Clinic',
            'entity_id' => $clinic->id,
            'description' => $reason,
            'old_values' => $old,
            'new_values' => $new,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'session_id' => $request->hasSession() ? $request->session()->getId() : null,
            'created_at' => now(),
        ]);
    }
}
