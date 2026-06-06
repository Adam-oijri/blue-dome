<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Prescription {{ $prescription->prescription_number }}</title>
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
        .rx { font-size: 28px; font-weight: bold; color: #1e3a5f; margin-top: 24px; }
        table.items { width: 100%; border-collapse: collapse; margin-top: 8px; }
        table.items th { background: #f3f4f6; text-align: left; padding: 7px 8px; font-size: 10px; text-transform: uppercase; color: #374151; border-bottom: 1px solid #e5e7eb; }
        table.items td { padding: 8px; border-bottom: 1px solid #eef0f2; vertical-align: top; }
        .med-name { font-weight: bold; }
        .notes { margin-top: 22px; padding: 10px 12px; background: #f9fafb; border-radius: 6px; }
        .sign { margin-top: 56px; width: 100%; }
        .sign td { width: 50%; vertical-align: bottom; }
        .sign-line { border-top: 1px solid #9ca3af; padding-top: 4px; width: 220px; }
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
                <div class="doc-title">PRESCRIPTION</div>
                <div class="doc-meta">
                    <div><strong>{{ $prescription->prescription_number }}</strong></div>
                    <div class="muted">Date: {{ \Illuminate\Support\Str::of((string) $prescription->prescription_date)->substr(0, 10) }}</div>
                    @if($prescription->expiry_date)<div class="muted">Expires: {{ \Illuminate\Support\Str::of((string) $prescription->expiry_date)->substr(0, 10) }}</div>@endif
                </div>
            </td>
        </tr>
    </table>

    <table class="grid">
        <tr>
            <td>
                <div class="label">Patient</div>
                <strong>{{ trim(($prescription->patient->first_name ?? '').' '.($prescription->patient->last_name ?? '')) ?: '—' }}</strong>
                @if($prescription->patient?->patient_code)<br><span class="muted">{{ $prescription->patient->patient_code }}</span>@endif
                @if($prescription->patient?->date_of_birth)<br><span class="muted">DOB: {{ \Illuminate\Support\Str::of((string) $prescription->patient->date_of_birth)->substr(0, 10) }}</span>@endif
            </td>
            <td>
                <div class="label">Prescriber</div>
                <strong>Dr. {{ trim(($prescription->doctor->first_name ?? '').' '.($prescription->doctor->last_name ?? '')) ?: '—' }}</strong>
                @if($prescription->diagnosis_related)<br><span class="muted">Dx: {{ $prescription->diagnosis_related }}</span>@endif
            </td>
        </tr>
    </table>

    <div class="rx">℞</div>

    <table class="items">
        <thead>
            <tr>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th>Qty</th>
            </tr>
        </thead>
        <tbody>
            @forelse($prescription->items as $item)
                <tr>
                    <td>
                        <span class="med-name">{{ $item->medication?->trade_name ?? $item->medication_name ?? '—' }}</span>
                        @if($item->medication?->strength)<br><span class="muted">{{ $item->medication->strength }}@if($item->medication?->form) · {{ $item->medication->form }}@endif</span>@endif
                        @if($item->instructions)<br><span class="muted">{{ $item->instructions }}</span>@endif
                    </td>
                    <td>{{ $item->dosage ?? '—' }}</td>
                    <td>{{ $item->frequency_text ?? ($item->frequency_per_day ? $item->frequency_per_day.'×/day' : '—') }}</td>
                    <td>{{ $item->duration_days ? $item->duration_days.' days' : '—' }}</td>
                    <td>{{ $item->quantity ? rtrim(rtrim(number_format((float) $item->quantity, 2), '0'), '.').' '.($item->unit ?? '') : '—' }}</td>
                </tr>
            @empty
                <tr><td colspan="5" class="muted" style="text-align:center;padding:18px">No medications.</td></tr>
            @endforelse
        </tbody>
    </table>

    @if($prescription->notes)
        <div class="notes"><div class="label">Notes</div>{{ $prescription->notes }}</div>
    @endif

    <table class="sign">
        <tr>
            <td></td>
            <td class="right" style="text-align:right">
                <div class="sign-line" style="margin-left:auto">Signature — Dr. {{ trim(($prescription->doctor->first_name ?? '').' '.($prescription->doctor->last_name ?? '')) }}</div>
            </td>
        </tr>
    </table>

    <div class="foot">{{ $clinic->name ?? '' }} · Generated {{ $generatedAt }}</div>
</div>
</body>
</html>
