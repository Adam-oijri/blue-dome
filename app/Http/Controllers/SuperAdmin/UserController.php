<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Concerns\ExportsCsv;
use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdmin\UpdateUserRequest;
use App\Models\Clinic;
use App\Models\User;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Cross-tenant directory of every staff user. The route guard
 * `role:super_admin` + the RLS GUC `app.is_super_admin = 'true'` set by
 * SetTenantContext combine to make the query cross-tenant.
 */
class UserController extends Controller
{
    use ExportsCsv;

    public function index(Request $request): Response
    {
        $users = $this->filteredQuery($request)
            ->orderByRaw('last_login_at DESC NULLS LAST')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('panels/super-admin/users', [
            'users' => $users,
            'clinics' => Clinic::query()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->all(),
            'filters' => [
                'role' => $request->string('role')->toString(),
                'clinic_id' => $request->string('clinic_id')->toString(),
                'status' => $request->string('status', 'all')->toString(),
                'search' => $request->string('search')->toString(),
            ],
            'kpis' => [
                'total' => User::query()->count(),
                'active' => User::query()->where('is_active', true)->count(),
                'doctors' => User::query()->where('role', 'doctor')->count(),
                'secretaries' => User::query()->where('role', 'secretary')->count(),
            ],
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $query = $this->filteredQuery($request)->orderBy('last_name');

        $ids = $request->input('ids');
        if (is_array($ids) && $ids !== []) {
            $query = User::query()->with('clinic:id,name')->whereIn('id', $ids)->orderBy('last_name');
        }

        return $this->streamCsv(
            $query,
            'users-'.now()->format('Y-m-d').'.csv',
            ['Name', 'Email', 'Role', 'Clinic', 'Active', 'Last login'],
            fn (User $u) => [
                trim(($u->first_name ?? '').' '.($u->last_name ?? '')),
                $u->email,
                $u->role,
                $u->clinic?->name ?? '',
                $u->is_active ? 'yes' : 'no',
                $u->last_login_at?->toDateTimeString() ?? '',
            ],
        );
    }

    public function bulk(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'action' => ['required', Rule::in(['activate', 'deactivate', 'delete'])],
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['uuid'],
        ]);

        // Never let a super-admin deactivate or delete their own account in bulk.
        $ids = collect($validated['ids'])->reject(fn ($id) => $id === $request->user()->id);
        $action = $validated['action'];
        $affected = 0;

        DB::transaction(function () use ($ids, $action, $request, &$affected): void {
            $users = User::query()->whereIn('id', $ids)->get();

            foreach ($users as $user) {
                if ($action === 'delete') {
                    if ($request->user()->cannot('delete', $user)) {
                        continue;
                    }
                    $user->delete();
                } else {
                    if ($request->user()->cannot('update', $user)) {
                        continue;
                    }
                    $user->is_active = $action === 'activate';
                    $user->save();
                }

                $affected++;
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => trans_choice(':count user updated|:count users updated', $affected, ['count' => $affected])]);

        return back();
    }

    public function edit(Request $request, string $locale, User $user): Response
    {
        unset($locale);
        $this->authorize('update', $user);

        $user->loadMissing('clinic:id,name');

        return Inertia::render('panels/super-admin/users/edit', [
            'user' => $user->only(['id', 'first_name', 'last_name', 'email', 'phone', 'role', 'is_active']),
            'clinic' => $user->clinic?->only(['id', 'name']),
            'isSelf' => $user->id === $request->user()->id,
        ]);
    }

    public function update(UpdateUserRequest $request, string $locale, User $user): RedirectResponse
    {
        unset($locale);

        $validated = $request->validated();

        $user->fill([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'],
            'is_active' => $request->boolean('is_active'),
        ]);

        if (! empty($validated['password'])) {
            $user->password_hash = $validated['password'];
        }

        $user->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User updated.')]);

        return to_route('super-admin.users');
    }

    public function destroy(Request $request, string $locale, User $user): RedirectResponse
    {
        unset($locale);
        $this->authorize('delete', $user);

        abort_if($user->id === $request->user()->id, 403);

        $user->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User removed.')]);

        return back();
    }

    public function restore(string $locale, string $user): RedirectResponse
    {
        unset($locale);

        // Users use UUID keys; a non-UUID id is a 404, not a Postgres 500.
        if (! Str::isUuid($user)) {
            abort(404);
        }

        $target = User::withTrashed()->findOrFail($user);
        $this->authorize('restore', $target);

        try {
            $target->restore();
        } catch (QueryException $e) {
            if ($e->getCode() === '23514') {
                Inertia::flash('toast', ['type' => 'error', 'message' => __('This clinic is already at the maximum number of :role accounts.', ['role' => $target->role])]);

                return back();
            }

            throw $e;
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User restored.')]);

        return back();
    }

    protected function filteredQuery(Request $request): Builder
    {
        $role = $request->string('role')->toString();
        $clinicId = $request->string('clinic_id')->toString();
        $status = $request->string('status', 'all')->toString();
        $search = $request->string('search')->toString();

        $query = User::query()->with('clinic:id,name');

        if ($status === 'deleted') {
            $query->onlyTrashed();
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        } elseif ($status === 'active') {
            $query->where('is_active', true);
        }

        if ($role !== '' && in_array($role, ['super_admin', 'doctor', 'secretary'], true)) {
            $query->where('role', $role);
        }

        if ($clinicId !== '') {
            $query->where('clinic_id', $clinicId);
        }

        if ($search !== '') {
            $like = '%'.$search.'%';
            $query->where(function ($q) use ($like): void {
                $q->where('first_name', 'ilike', $like)
                    ->orWhere('last_name', 'ilike', $like)
                    ->orWhere('email', 'ilike', $like);
            });
        }

        return $query;
    }
}
