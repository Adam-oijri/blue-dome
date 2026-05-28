<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Clinic;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Cross-tenant directory of every staff user. The route guard
 * `role:super_admin` + the RLS GUC `app.is_super_admin = 'true'` set by
 * SetTenantContext combine to make the query cross-tenant.
 */
class UserController extends Controller
{
    public function index(Request $request): Response
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

        $users = $query
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
                'role' => $role,
                'clinic_id' => $clinicId,
                'status' => $status,
                'search' => $search,
            ],
            'kpis' => [
                'total' => User::query()->count(),
                'active' => User::query()->where('is_active', true)->count(),
                'doctors' => User::query()->where('role', 'doctor')->count(),
                'secretaries' => User::query()->where('role', 'secretary')->count(),
            ],
        ]);
    }
}
