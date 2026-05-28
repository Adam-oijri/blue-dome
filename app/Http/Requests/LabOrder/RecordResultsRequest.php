<?php

namespace App\Http\Requests\LabOrder;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RecordResultsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('recordResults', $this->route('lab_order')) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => [
                'required', 'uuid',
                Rule::exists('lab_order_items', 'id')
                    ->where('lab_order_id', $this->route('lab_order')->id),
            ],
            'items.*.result' => ['nullable', 'string'],
            'items.*.result_date' => ['nullable', 'date'],
            'items.*.result_status' => ['nullable', 'in:pending,normal,abnormal,critical,inconclusive'],
            'items.*.is_abnormal' => ['nullable', 'boolean'],
            'items.*.is_critical' => ['nullable', 'boolean'],
            'items.*.notes' => ['nullable', 'string'],
        ];
    }
}
