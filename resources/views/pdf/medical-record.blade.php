<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Consultation {{ $record->id }}</title>
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
        .confidential { display: inline-block; padding: 2px 8px; border-radius: 10px; background: #fee2e2; font-size: 10px; color: #b91c1c; }
        .soap { margin-top: 22px; }
        .soap-section { margin-top: 16px; }
        .soap-title { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #1e3a5f; letter-spacing: .5px; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; margin-bottom: 6px; }
        .soap-body { line-height: 1.5; }
        .codes { margin-top: 16px; }
        .codes span { display: inline-block; padding: 2px 8px; margin: 2px 4px 2px 0; border-radius: 6px; background: #f3f4f6; font-size: 11px; }
        .empty { margin-top: 22px; padding: 18px; text-align: center; color: #9ca3af; background: #f9fafb; border-radius: 6px; }
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
                <div class="doc-title">CONSULTATION</div>
                <div class="doc-meta">
                    @if($record->title)<div><strong>{{ $record->title }}</strong></div>@endif
                    <div class="muted">Date: {{ \Illuminate\Support\Str::of((string) $record->record_date)->substr(0, 10) }}</div>
                    <div class="muted">Type: {{ str_replace('_', ' ', (string) $record->record_type) }}</div>
                    <div style="margin-top:4px">
                        <span class="status">{{ $record->is_signed ? 'Signed' : 'Unsigned' }}</span>
                        @if($record->is_confidential)<span class="confidential">Confidential</span>@endif
                    </div>
                </div>
            </td>
        </tr>
    </table>

    <table class="grid">
        <tr>
            <td>
                <div class="label">Patient</div>
                <strong>{{ trim(($record->patient->first_name ?? '').' '.($record->patient->last_name ?? '')) ?: '—' }}</strong>
                @if($record->patient?->patient_code)<br><span class="muted">{{ $record->patient->patient_code }}</span>@endif
                @if($record->patient?->date_of_birth)<br><span class="muted">DOB: {{ \Illuminate\Support\Str::of((string) $record->patient->date_of_birth)->substr(0, 10) }}</span>@endif
            </td>
            <td>
                <div class="label">Author</div>
                <strong>Dr. {{ trim(($record->author->first_name ?? '').' '.($record->author->last_name ?? '')) ?: '—' }}</strong>
                @if($record->is_signed && $record->signer)<br><span class="muted">Signed by Dr. {{ trim(($record->signer->first_name ?? '').' '.($record->signer->last_name ?? '')) }}@if($record->signed_at) · {{ \Illuminate\Support\Str::of((string) $record->signed_at)->substr(0, 10) }}@endif</span>@endif
            </td>
        </tr>
    </table>

    @php($hasClinical = $clinical['subjective'] || $clinical['objective'] || $clinical['assessment'] || $clinical['plan'] || $clinical['content'])

    @if($hasClinical)
        <div class="soap">
            @if($clinical['subjective'])
                <div class="soap-section"><div class="soap-title">Subjective</div><div class="soap-body">{!! nl2br(e($clinical['subjective'])) !!}</div></div>
            @endif
            @if($clinical['objective'])
                <div class="soap-section"><div class="soap-title">Objective</div><div class="soap-body">{!! nl2br(e($clinical['objective'])) !!}</div></div>
            @endif
            @if($clinical['assessment'])
                <div class="soap-section"><div class="soap-title">Assessment</div><div class="soap-body">{!! nl2br(e($clinical['assessment'])) !!}</div></div>
            @endif
            @if($clinical['plan'])
                <div class="soap-section"><div class="soap-title">Plan</div><div class="soap-body">{!! nl2br(e($clinical['plan'])) !!}</div></div>
            @endif
            @if($clinical['content'])
                <div class="soap-section"><div class="soap-title">Notes</div><div class="soap-body">{!! nl2br(e($clinical['content'])) !!}</div></div>
            @endif
        </div>
    @else
        <div class="empty">No clinical detail recorded.</div>
    @endif

    @if(! empty($record->diagnosis_codes) || ! empty($record->procedure_codes))
        <div class="codes">
            @if(! empty($record->diagnosis_codes))
                <div class="label">Diagnosis Codes</div>
                @foreach($record->diagnosis_codes as $code)<span>{{ $code }}</span>@endforeach
            @endif
            @if(! empty($record->procedure_codes))
                <div class="label" style="margin-top:8px">Procedure Codes</div>
                @foreach($record->procedure_codes as $code)<span>{{ $code }}</span>@endforeach
            @endif
        </div>
    @endif

    <table class="sign">
        <tr>
            <td></td>
            <td style="text-align:right">
                <div class="sign-line" style="margin-left:auto">Signature — Dr. {{ trim((($record->signer->first_name ?? $record->author->first_name) ?? '').' '.(($record->signer->last_name ?? $record->author->last_name) ?? '')) }}</div>
            </td>
        </tr>
    </table>

    <div class="foot">{{ $clinic->name ?? '' }} · Generated {{ $generatedAt }}</div>
</div>
</body>
</html>
