<?php

namespace App\Http\Requests\SuperAdmin\Inventory;

use App\Models\Inventory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Super-admin inventory create, scoped to the {clinic} route binding rather
 * than the acting user's clinic.
 */
class StoreInventoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Inventory::class) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $clinicId = $this->route('clinic')->id;

        return [
            'item_name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'in:medication,supplies,equipment,office_supplies'],
            'item_code' => [
                'nullable', 'string', 'max:100',
                Rule::unique('inventory', 'item_code')
                    ->where('clinic_id', $clinicId)
                    ->whereNull('deleted_at'),
            ],
            'medication_id' => [
                'nullable', 'uuid',
                Rule::exists('medications', 'id')
                    ->where('clinic_id', $clinicId)
                    ->whereNull('deleted_at'),
            ],
            'supplier_id' => [
                'nullable', 'uuid',
                Rule::exists('vendors', 'id')
                    ->where('clinic_id', $clinicId)
                    ->whereNull('deleted_at'),
            ],
            'batch_number' => ['nullable', 'string', 'max:100'],
            'serial_number' => ['nullable', 'string', 'max:100'],
            'expiration_date' => ['nullable', 'date'],
            'quantity_in_stock' => ['nullable', 'numeric', 'min:0'],
            'min_stock_level' => ['nullable', 'numeric', 'min:0'],
            'max_stock_level' => ['nullable', 'numeric', 'min:0'],
            'reorder_point' => ['nullable', 'numeric', 'min:0'],
            'unit' => ['nullable', 'string', 'max:50'],
            'purchase_price' => ['nullable', 'numeric', 'min:0'],
            'selling_price' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'location_in_clinic' => ['nullable', 'string', 'max:255'],
            'requires_refrigeration' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
