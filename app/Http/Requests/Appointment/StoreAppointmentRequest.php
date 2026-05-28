<?php

namespace App\Http\Requests\Appointment;

use App\Models\Appointment;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class StoreAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Appointment::class) ?? false;
    }

    /**
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    public function rules(): array
    {
        $clinicId = $this->user()->clinic_id;

        return [
            'patient_id' => [
                // Phase 8 (global-patient-access): no clinic filter — a clinic
                // may schedule appointments for any patient regardless of origin.
                'required', 'uuid',
                Rule::exists('patients', 'id')->whereNull('deleted_at'),
            ],
            'doctor_id' => [
                'required', 'uuid',
                Rule::exists('users', 'id')
                    ->where('clinic_id', $clinicId)
                    ->where('role', 'doctor')
                    ->whereNull('deleted_at'),
            ],
            'secretary_id' => [
                'nullable', 'uuid',
                Rule::exists('users', 'id')
                    ->where('clinic_id', $clinicId)
                    ->where('role', 'secretary')
                    ->whereNull('deleted_at'),
            ],
            'branch_id' => [
                'nullable', 'uuid',
                Rule::exists('branches', 'id')->where('clinic_id', $clinicId)->whereNull('deleted_at'),
            ],
            'scheduled_start' => ['required', 'date'],
            'scheduled_end' => ['required', 'date', 'after:scheduled_start'],
            'type' => ['nullable', 'in:consultation,follow_up,emergency,routine_checkup,vaccination,procedure,lab_test,tele_consultation,home_visit'],
            'priority' => ['nullable', 'in:low,normal,high,emergency'],
            'reason' => ['nullable', 'string'],
            'chief_complaint' => ['nullable', 'string'],
            'consultation_fee' => ['nullable', 'numeric', 'min:0'],
            'is_free' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string'],
        ];
    }

    /**
     * Pre-flight overlap check — the `excl_doctor_no_overlap` GiST exclusion
     * constraint catches this at the DB level, but its error surfaces as a
     * 500. Returning a 422 with a friendly message is the UX-correct path.
     *
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (ValidatorContract $validator): void {
                $start = $this->input('scheduled_start');
                $end = $this->input('scheduled_end');
                $doctorId = $this->input('doctor_id');

                if (! $start || ! $end || ! $doctorId) {
                    return;
                }

                $overlap = DB::selectOne(
                    "SELECT 1 AS x FROM appointments
                     WHERE doctor_id = ?::uuid
                       AND deleted_at IS NULL
                       AND status NOT IN ('cancelled','no_show','rescheduled')
                       AND tstzrange(scheduled_start, scheduled_end, '[)') && tstzrange(?::timestamptz, ?::timestamptz, '[)')
                     LIMIT 1",
                    [$doctorId, $start, $end]
                );

                if ($overlap !== null) {
                    $validator->errors()->add('scheduled_start', __('appointments.doctor_overlap'));
                }
            },
        ];
    }
}
