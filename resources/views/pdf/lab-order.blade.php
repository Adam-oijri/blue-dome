<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Analyses {{ $labOrder->lab_order_number ?? $labOrder->id }}</title>
    <style>
        * { font-family: DejaVu Sans, sans-serif; }
        body { margin: 0; color: #15294a; font-size: 12px; }
        .wrap { padding: 36px 40px; }
        .head { width: 100%; border-bottom: 2px solid #6f8536; padding-bottom: 14px; }
        .head td { vertical-align: top; }
        .clinic-name { font-size: 20px; font-weight: bold; color: #1e3a5f; }
        .muted { color: #6b7280; }
        .doc-title { font-size: 22px; font-weight: bold; color: #6f8536; text-align: right; }
        .doc-meta { text-align: right; margin-top: 4px; }
        .grid { width: 100%; margin-top: 22px; }
        .grid td { width: 50%; vertical-align: top; }
        .label { font-size: 10px; text-transform: uppercase; letter-spacing: .5px; color: #6b7280; margin-bottom: 3px; }
        .status { display: inline-block; padding: 2px 8px; border-radius: 10px; background: #eef2f6; font-size: 10px; text-transform: capitalize; color: #374151; }
        table.items { width: 100%; border-collapse: collapse; margin-top: 16px; }
        table.items th { background: #f3f4f6; text-align: left; padding: 7px 8px; font-size: 10px; text-transform: uppercase; color: #374151; border-bottom: 1px solid #e5e7eb; }
        table.items td { padding: 8px; border-bottom: 1px solid #eef0f2; vertical-align: top; }
        .test-name { font-weight: bold; }
        .flag-critical { color: #b91c1c; font-weight: bold; }
        .flag-abnormal { color: #c2410c; font-weight: bold; }
        .flag-normal { color: #15803d; }
        .notes { margin-top: 22px; padding: 10px 12px; background: #f9fafb; border-radius: 6px; }
        .sign { margin-top: 56px; width: 100%; }
        .sign td { width: 50%; vertical-align: bottom; }
        .sign-line { border-top: 1px solid #9ca3af; padding-top: 4px; width: 240px; }
        .foot { margin-top: 28px; text-align: center; color: #9ca3af; font-size: 10px; }
    </style>
</head>
<body>
<div class="wrap">
    <table class="head">
        <tr>
            <td style="width:60%">
                <div class="clinic-name">{{ $clinic->name ?? 'Clinic' }}</div>
                <div class="muted">
                    {{ $clinic->address ?? '' }}@if($clinic->city ?? null), {{ $clinic->city }}@endif<br>
                    @if($clinic->phone ?? null){{ $clinic->phone }}@endif
                    @if($clinic->email ?? null) · {{ $clinic->email }}@endif
                </div>
            </td>
            <td style="width:40%">
                <div class="doc-title">LABORATORY ANALYSES</div>
                <div class="doc-meta">
                    <div><strong>{{ $labOrder->lab_order_number ?? $labOrder->id }}</strong></div>
                    <div class="muted">Ordered: {{ \Illuminate\Support\Str::of((string) $labOrder->order_date)->substr(0, 10) }}</div>
                    @if($labOrder->completed_at)<div class="muted">Completed: {{ \Illuminate\Support\Str::of((string) $labOrder->completed_at)->substr(0, 10) }}</div>@endif
                    <div style="margin-top:4px"><span class="status">{{ str_replace('_', ' ', (string) $labOrder->status) }}</span></div>
                    @if($labOrder->urgency && $labOrder->urgency !== 'routine')<div style="margin-top:4px"><span class="status">{{ str_replace('_', ' ', (string) $labOrder->urgency) }}</span></div>@endif
                </div>
            </td>
        </tr>
    </table>

    <table class="grid">
        <tr>
            <td>
                <div class="label">Patient</div>
                <strong>{{ trim(($labOrder->patient->first_name ?? '').' '.($labOrder->patient->last_name ?? '')) ?: '—' }}</strong>
                @if($labOrder->patient?->patient_code)<br><span class="muted">{{ $labOrder->patient->patient_code }}</span>@endif
                @if($labOrder->patient?->date_of_birth)<br><span class="muted">DOB: {{ \Illuminate\Support\Str::of((string) $labOrder->patient->date_of_birth)->substr(0, 10) }}</span>@endif
            </td>
            <td>
                <div class="label">Ordering Doctor</div>
                <strong>Dr. {{ trim(($labOrder->doctor->first_name ?? '').' '.($labOrder->doctor->last_name ?? '')) ?: '—' }}</strong>
                @if($labOrder->fasting_required)<br><span class="muted">Fasting required</span>@endif
                @if($labOrder->externalLab)<br><span class="muted">Lab: {{ $labOrder->externalLab->lab_name }}@if($labOrder->externalLab->phone) · {{ $labOrder->externalLab->phone }}@endif</span>@endif
            </td>
        </tr>
    </table>

    @if($labOrder->clinical_diagnosis)
        <div class="notes"><div class="label">Clinical Diagnosis</div>{{ $labOrder->clinical_diagnosis }}</div>
    @endif

    <table class="items">
        <thead>
            <tr>
                <th>Test</th>
                <th>Specimen</th>
                <th>Result</th>
                <th>Reference Range</th>
                <th>Flag</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
            @forelse($labOrder->items as $item)
                <tr>
                    <td>
                        <span class="test-name">{{ $item->test_name ?? '—' }}</span>
                        @if($item->test_code)<br><span class="muted">{{ $item->test_code }}@if($item->test_category) · {{ $item->test_category }}@endif</span>@endif
                        @if($item->methodology)<br><span class="muted">{{ $item->methodology }}</span>@endif
                    </td>
                    <td>{{ $item->specimen_type ?? '—' }}</td>
                    <td>{{ $item->result !== null && $item->result !== '' ? trim($item->result.' '.($item->unit ?? '')) : '—' }}</td>
                    <td>{{ $item->normal_range ?? '—' }}</td>
                    <td>
                        @if($item->is_critical || $item->result_status === 'critical')
                            <span class="flag-critical">Critical</span>
                        @elseif($item->is_abnormal || $item->result_status === 'abnormal')
                            <span class="flag-abnormal">Abnormal</span>
                        @elseif($item->result_status === 'normal')
                            <span class="flag-normal">Normal</span>
                        @else
                            <span class="muted">{{ str_replace('_', ' ', (string) ($item->result_status ?? 'pending')) }}</span>
                        @endif
                    </td>
                    <td>{{ $item->result_date ? \Illuminate\Support\Str::of((string) $item->result_date)->substr(0, 10) : '—' }}</td>
                </tr>
            @empty
                <tr><td colspan="6" class="muted" style="text-align:center;padding:18px">No tests recorded.</td></tr>
            @endforelse
        </tbody>
    </table>

    @if($labOrder->notes)
        <div class="notes"><div class="label">Notes</div>{{ $labOrder->notes }}</div>
    @endif

    <table class="sign">
        <tr>
            <td>
                @if($labOrder->reviewed_at)
                    <div class="muted">Reviewed by Dr. {{ trim(($labOrder->reviewedBy->first_name ?? '').' '.($labOrder->reviewedBy->last_name ?? '')) }}<br>{{ \Illuminate\Support\Str::of((string) $labOrder->reviewed_at)->substr(0, 10) }}</div>
                @endif
            </td>
            <td style="text-align:right">
                <div class="sign-line" style="margin-left:auto">Signature — Dr. {{ trim(($labOrder->doctor->first_name ?? '').' '.($labOrder->doctor->last_name ?? '')) }}</div>
            </td>
        </tr>
    </table>

    <div class="foot">{{ $clinic->name ?? '' }} · Generated {{ $generatedAt }}</div>
</div>
</body>
</html>
