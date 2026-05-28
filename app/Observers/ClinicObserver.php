<?php

namespace App\Observers;

use App\Models\Clinic;
use Illuminate\Support\Facades\DB;

/**
 * Bootstraps the seven per-clinic numeric sequences (patient_code,
 * appointment_number, prescription_number, lab_order_number,
 * invoice_number, payment_number, expense_number) the moment a Clinic is
 * created. Without this every code-generating call site would crash with
 * "no row for clinic X / seq Y" the first time it ran — or, worse, return
 * a duplicate value.
 *
 * `insertOrIgnore` keeps the call idempotent so re-seeders and Clinic
 * upserts don't error.
 */
class ClinicObserver
{
    /**
     * @var array<string, string>
     */
    private const SEQUENCES = [
        'patient_code' => 'PAT-',
        'appointment_number' => 'APT-',
        'prescription_number' => 'RX-',
        'lab_order_number' => 'LAB-',
        'invoice_number' => 'INV-',
        'payment_number' => 'PAY-',
        'expense_number' => 'EXP-',
    ];

    public function created(Clinic $clinic): void
    {
        $rows = [];

        foreach (self::SEQUENCES as $name => $prefix) {
            $rows[] = [
                'clinic_id' => $clinic->id,
                'sequence_name' => $name,
                'prefix' => $prefix,
                'last_value' => 0,
                'updated_at' => now(),
            ];
        }

        DB::table('clinic_sequences')->insertOrIgnore($rows);
    }
}
