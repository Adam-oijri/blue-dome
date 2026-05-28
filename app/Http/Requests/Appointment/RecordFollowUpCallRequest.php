<?php

namespace App\Http\Requests\Appointment;

use App\Models\Appointment;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RecordFollowUpCallRequest extends FormRequest
{
    public function authorize(): bool
    {
        $appointment = $this->route('appointment');

        return $appointment instanceof Appointment
            && ($this->user()?->can('followUp', $appointment) ?? false);
    }

    /**
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    public function rules(): array
    {
        return [
            'follow_up_call_status' => ['required', 'in:pending,in_progress,completed,no_answer,wrong_number,rescheduled'],
            'follow_up_call_notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
