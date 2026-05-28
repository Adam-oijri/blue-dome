<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    /**
     * Paginated cross-tenant audit log. The route guard `role:super_admin`
     * combined with `app.is_super_admin='true'` set by SetTenantContext is
     * the access control — no explicit policy call needed here, because RLS
     * would have filtered the rows for a non-super_admin actor anyway.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('panels/super-admin/activity-log', [
            'activity' => ActivityLog::query()
                ->with([
                    'clinic:id,name',
                    'user:id,first_name,last_name,email',
                ])
                ->orderByDesc('created_at')
                ->paginate(50)
                ->withQueryString(),
        ]);
    }
}
