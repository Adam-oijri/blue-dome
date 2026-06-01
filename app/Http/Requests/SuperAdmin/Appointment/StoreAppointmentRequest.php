<?php

namespace App\Http\Requests\SuperAdmin\Appointment;

use App\Models\Appointment;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * Super-admin appointment scheduling, scoped to the {clinic} route binding:
 * the doctor / secretary / branch must belong to that clinic.
 */
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
        $clinicId = $this->route('clinic')->id;

        return [
            'patient_id' => [
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
     * Pre-flight doctor-overlap check (the GiST exclusion constraint enforces
     * it at the DB level; this returns a friendly 422 instead of a 500).
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
