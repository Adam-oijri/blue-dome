<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Secretary dashboard fed by the `v_appointments_needing_followup` view.
 * Querying the view directly keeps the policy / filter logic in one place
 * (the SQL view definition) — controller just paginates.
 */
class FollowUpController extends Controller
{
    public function index(Request $request): Response
    {
        $clinicId = $request->user()->clinic_id;

        $rows = DB::table('v_appointments_needing_followup')
            ->where('clinic_id', $clinicId)
            ->orderBy('scheduled_start')
            ->paginate(25);

        return Inertia::render('secretary/follow-up', [
            'follow_ups' => $rows,
        ]);
    }
}
