<?php

namespace App\Http\Requests\SuperAdmin;

use App\Models\Clinic;

class UpdateClinicRequest extends CreateClinicRequest
{
    public function authorize(): bool
    {
        $clinic = $this->route('clinic');

        return $this->user()?->can('update', $clinic instanceof Clinic ? $clinic : Clinic::class) ?? false;
    }
}
