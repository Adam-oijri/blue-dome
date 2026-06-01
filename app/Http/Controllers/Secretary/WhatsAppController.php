<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use App\Models\MessageLog;
use App\Models\MessageTemplate;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Secretary WhatsApp queue — clinic-scoped recent WhatsApp message log with
 * delivery KPIs for today, plus the clinic's approved/pending WhatsApp
 * templates. Read-only; sending happens through the messaging pipeline.
 */
class WhatsAppController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $clinicId = $user->clinic_id;
        $today = CarbonImmutable::today();

        // ->toBase(): a GROUP BY aggregate hydrated as an Eloquent model drops
        // the real grouping column (status), so pluck() would key on null and
        // every KPI would read 0. Plain stdClass rows keep the status column.
        $statusCounts = MessageLog::query()
            ->where('clinic_id', $clinicId)
            ->where('message_type', 'whatsapp')
            ->whereBetween('created_at', [$today->startOfDay(), $today->endOfDay()])
            ->selectRaw('status, COUNT(*) AS total')
            ->groupBy('status')
            ->toBase()
            ->pluck('total', 'status');

        return Inertia::render('panels/secretary/whatsapp', [
            'messages' => MessageLog::query()
                ->where('clinic_id', $clinicId)
                ->where('message_type', 'whatsapp')
                ->where('created_at', '>=', $today->subDays(90))
                ->orderByDesc('created_at')
                ->limit(50)
                ->get(['id', 'recipient_name', 'status', 'retry_count', 'sent_at', 'created_at'])
                ->map(fn (MessageLog $log): array => [
                    'id' => $log->id,
                    'recipient_name' => $log->recipient_name,
                    'status' => $log->status,
                    'retry_count' => (int) $log->retry_count,
                    'sent_at' => $log->sent_at?->toISOString(),
                    'created_at' => $log->created_at?->toISOString(),
                ])
                ->all(),
            'templates' => MessageTemplate::query()
                ->where('clinic_id', $clinicId)
                ->where('template_type', 'whatsapp')
                ->orderBy('template_name')
                ->get(['id', 'template_name', 'template_category', 'whatsapp_template_status'])
                ->map(fn (MessageTemplate $template): array => [
                    'id' => $template->id,
                    'template_name' => $template->template_name,
                    'template_category' => $template->template_category,
                    'whatsapp_template_status' => $template->whatsapp_template_status,
                ])
                ->all(),
            'kpis' => [
                'sent' => (int) ($statusCounts['sent'] ?? 0),
                'delivered' => (int) ($statusCounts['delivered'] ?? 0),
                'seen' => (int) ($statusCounts['seen'] ?? 0),
                'failed' => (int) ($statusCounts['failed'] ?? 0),
            ],
        ]);
    }
}
