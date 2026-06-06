<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $invoice->invoice_number }}</title>
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
        .section { margin-top: 22px; }
        .label { font-size: 10px; text-transform: uppercase; letter-spacing: .5px; color: #6b7280; margin-bottom: 3px; }
        table.items { width: 100%; border-collapse: collapse; margin-top: 8px; }
        table.items th { background: #f3f4f6; text-align: left; padding: 7px 8px; font-size: 10px; text-transform: uppercase; color: #374151; border-bottom: 1px solid #e5e7eb; }
        table.items td { padding: 7px 8px; border-bottom: 1px solid #eef0f2; }
        .right { text-align: right; }
        .totals { width: 46%; margin-left: auto; margin-top: 14px; border-collapse: collapse; }
        .totals td { padding: 5px 8px; }
        .totals .grand { border-top: 2px solid #15294a; font-weight: bold; font-size: 14px; }
        .status { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 10px; font-weight: bold; text-transform: uppercase; background: #e8efd5; color: #5c6e2c; }
        .notes { margin-top: 22px; padding: 10px 12px; background: #f9fafb; border-radius: 6px; }
        .foot { margin-top: 34px; text-align: center; color: #9ca3af; font-size: 10px; }
    </style>
</head>
<body>
<div class="wrap">
    <table class="head">
        <tr>
            <td style="width:60%">
                <div class="clinic-name">{{ $clinic->name ?? 'Clinic' }}</div>
                <div class="muted">
                    {{ $clinic->address ?? '' }}@if($clinic->city), {{ $clinic->city }}@endif<br>
                    @if($clinic->phone){{ $clinic->phone }}@endif
                    @if($clinic->email) · {{ $clinic->email }}@endif
                </div>
            </td>
            <td style="width:40%">
                <div class="doc-title">INVOICE</div>
                <div class="doc-meta">
                    <div><strong>{{ $invoice->invoice_number }}</strong></div>
                    <div class="muted">Issued: {{ \Illuminate\Support\Str::of((string) $invoice->invoice_date)->substr(0, 10) }}</div>
                    @if($invoice->due_date)<div class="muted">Due: {{ \Illuminate\Support\Str::of((string) $invoice->due_date)->substr(0, 10) }}</div>@endif
                    <div style="margin-top:6px"><span class="status">{{ str_replace('_', ' ', $invoice->status) }}</span></div>
                </div>
            </td>
        </tr>
    </table>

    <div class="section">
        <div class="label">Bill to</div>
        <div>
            <strong>{{ trim(($invoice->patient->first_name ?? '').' '.($invoice->patient->last_name ?? '')) ?: '—' }}</strong>
            @if($invoice->patient?->patient_code) <span class="muted">· {{ $invoice->patient->patient_code }}</span>@endif
            @if($invoice->patient?->phone_e164)<br><span class="muted">{{ $invoice->patient->phone_e164 }}</span>@endif
        </div>
    </div>

    <table class="items">
        <thead>
            <tr>
                <th>Description</th>
                <th>Type</th>
                <th class="right">Qty</th>
                <th class="right">Unit price</th>
                <th class="right">Amount</th>
            </tr>
        </thead>
        <tbody>
            @forelse($invoice->items as $item)
                <tr>
                    <td>{{ $item->description }}</td>
                    <td class="muted">{{ str_replace('_', ' ', (string) $item->item_type) }}</td>
                    <td class="right">{{ rtrim(rtrim(number_format((float) $item->quantity, 2), '0'), '.') }}</td>
                    <td class="right">{{ number_format((float) $item->unit_price, 2) }}</td>
                    <td class="right">{{ number_format((float) $item->quantity * (float) $item->unit_price, 2) }}</td>
                </tr>
            @empty
                <tr><td colspan="5" class="muted" style="text-align:center;padding:18px">No line items.</td></tr>
            @endforelse
        </tbody>
    </table>

    <table class="totals">
        <tr><td class="muted">Subtotal</td><td class="right">{{ number_format((float) $invoice->subtotal, 2) }} {{ $invoice->currency }}</td></tr>
        @if((float) $invoice->discount_amount > 0)
            <tr><td class="muted">Discount</td><td class="right">− {{ number_format((float) $invoice->discount_amount, 2) }} {{ $invoice->currency }}</td></tr>
        @endif
        @if((float) $invoice->tax_percentage > 0)
            <tr><td class="muted">Tax ({{ rtrim(rtrim(number_format((float) $invoice->tax_percentage, 2), '0'), '.') }}%)</td><td class="right">{{ $invoice->currency }}</td></tr>
        @endif
        <tr class="grand"><td>Total</td><td class="right">{{ number_format((float) $invoice->total, 2) }} {{ $invoice->currency }}</td></tr>
        <tr><td class="muted">Paid</td><td class="right">{{ number_format((float) $invoice->paid_amount, 2) }} {{ $invoice->currency }}</td></tr>
        <tr><td class="muted">Balance due</td><td class="right"><strong>{{ number_format((float) $invoice->balance_due, 2) }} {{ $invoice->currency }}</strong></td></tr>
    </table>

    @if($invoice->notes)
        <div class="notes"><div class="label">Notes</div>{{ $invoice->notes }}</div>
    @endif

    <div class="foot">{{ $clinic->name ?? '' }} · Generated {{ $generatedAt }}</div>
</div>
</body>
</html>
