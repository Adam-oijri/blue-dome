<?php

namespace App\Http\Requests\SuperAdmin\Inventory;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInventoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('inventory')) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $clinicId = $this->route('clinic')->id;
        $id = $this->route('inventory')->id;

        return [
            'item_name' => ['sometimes', 'required', 'string', 'max:255'],
            'category' => ['sometimes', 'in:medication,supplies,equipment,office_supplies'],
            'item_code' => [
                'sometimes', 'nullable', 'string', 'max:100',
                Rule::unique('inventory', 'item_code')
                    ->where('clinic_id', $clinicId)
                    ->whereNull('deleted_at')
                    ->ignore($id),
            ],
            'min_stock_level' => ['sometimes', 'numeric', 'min:0'],
            'expiration_date' => ['sometimes', 'nullable', 'date'],
            'is_active' => ['sometimes', 'boolean'],
            'notes' => ['sometimes', 'nullable', 'string'],
        ];
    }
}
