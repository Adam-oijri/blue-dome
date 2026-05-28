<?php

namespace App\Observers;

use App\Models\Invoice;
use App\Services\SequenceService;
use Illuminate\Support\Facades\Auth;

class InvoiceObserver
{
    public function __construct(private readonly SequenceService $sequences) {}

    public function creating(Invoice $invoice): void
    {
        if (empty($invoice->invoice_number) && ! empty($invoice->clinic_id)) {
            $invoice->invoice_number = $this->sequences->next(
                $invoice->clinic_id,
                'invoice_number',
            );
        }

        if (empty($invoice->created_by) && Auth::check()) {
            $invoice->created_by = Auth::id();
        }
    }
}
