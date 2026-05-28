<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Settings\PanelAccountSettingsController;

class SettingsController extends PanelAccountSettingsController
{
    protected function view(): string
    {
        return 'panels/doctor/settings';
    }
}
