<?php

namespace App\Http\Requests\DocumentFolder;

use App\Models\DocumentFolder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDocumentFolderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', DocumentFolder::class) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $clinicId = $this->user()->clinic_id;

        return [
            'folder_name' => [
                'required', 'string', 'max:255',
                Rule::unique('document_folders', 'folder_name')
                    ->where('clinic_id', $clinicId)
                    ->whereNull('deleted_at'),
            ],
            'parent_folder_id' => [
                'nullable', 'uuid',
                Rule::exists('document_folders', 'id')
                    ->where('clinic_id', $clinicId)
                    ->whereNull('deleted_at'),
            ],
            'entity_type' => ['nullable', 'string', 'max:50'],
            'entity_id' => ['nullable', 'uuid'],
        ];
    }
}
