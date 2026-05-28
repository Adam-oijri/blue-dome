<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class StoreInventoryTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('recordTransaction', $this->route('inventory')) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'transaction_type' => ['required', 'in:purchase,sale,consumption,adjustment,expired,return,transfer,damaged,reversal'],
            'quantity' => ['required', 'numeric'],
            'unit_price' => ['nullable', 'numeric', 'min:0'],
            'transaction_date' => ['nullable', 'date'],
            'reference_type' => ['nullable', 'string', 'max:50'],
            'reference_id' => ['nullable', 'uuid'],
            'reverses_id' => ['nullable', 'uuid'],
            'batch_number' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
