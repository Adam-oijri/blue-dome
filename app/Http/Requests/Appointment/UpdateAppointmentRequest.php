<?php

namespace App\Http\Requests\Appointment;

use App\Models\Appointment;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class UpdateAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $appointment = $this->route('appointment');

        return $appointment instanceof Appointment
            && ($this->user()?->can('update', $appointment) ?? false);
    }

    /**
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    public function rules(): array
    {
        $appointment = $this->route('appointment');
        $clinicId = $appointment instanceof Appointment ? $appointment->clinic_id : $this->user()->clinic_id;

        return [
            'patient_id' => [
                // Phase 8: cross-clinic patient_id allowed.
                'sometimes', 'uuid',
                Rule::exists('patients', 'id')->whereNull('deleted_at'),
            ],
            'doctor_id' => [
                'sometimes', 'uuid',
                Rule::exists('users', 'id')->where('clinic_id', $clinicId)->where('role', 'doctor')->whereNull('deleted_at'),
            ],
            'secretary_id' => [
                'nullable', 'uuid',
                Rule::exists('users', 'id')->where('clinic_id', $clinicId)->where('role', 'secretary')->whereNull('deleted_at'),
            ],
            'branch_id' => [
                'nullable', 'uuid',
                Rule::exists('branches', 'id')->where('clinic_id', $clinicId)->whereNull('deleted_at'),
            ],
            'scheduled_start' => ['sometimes', 'date'],
            'scheduled_end' => ['sometimes', 'date', 'after:scheduled_start'],
            'status' => ['sometimes', 'in:scheduled,confirmed,arrived,in_progress,completed,cancelled,no_show,rescheduled'],
            'type' => ['nullable', 'in:consultation,follow_up,emergency,routine_checkup,vaccination,procedure,lab_test,tele_consultation,home_visit'],
            'priority' => ['nullable', 'in:low,normal,high,emergency'],
            'reason' => ['nullable', 'string'],
            'chief_complaint' => ['nullable', 'string'],
            'consultation_fee' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ];
    }

    /**
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (ValidatorContract $validator): void {
                /** @var Appointment $appointment */
                $appointment = $this->route('appointment');

                $start = $this->input('scheduled_start', $appointment->scheduled_start?->toIso8601String());
                $end = $this->input('scheduled_end', $appointment->scheduled_end?->toIso8601String());
                $doctorId = $this->input('doctor_id', $appointment->doctor_id);

                if (! $start || ! $end || ! $doctorId) {
                    return;
                }

                $overlap = DB::selectOne(
                    "SELECT 1 AS x FROM appointments
                     WHERE doctor_id = ?::uuid
                       AND id <> ?::uuid
                       AND deleted_at IS NULL
                       AND status NOT IN ('cancelled','no_show','rescheduled')
                       AND tstzrange(scheduled_start, scheduled_end, '[)') && tstzrange(?::timestamptz, ?::timestamptz, '[)')
                     LIMIT 1",
                    [$doctorId, $appointment->id, $start, $end]
                );

                if ($overlap !== null) {
                    $validator->errors()->add('scheduled_start', __('appointments.doctor_overlap'));
                }
            },
        ];
    }
}
