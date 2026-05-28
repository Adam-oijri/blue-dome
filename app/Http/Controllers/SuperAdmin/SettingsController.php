<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Settings\PanelAccountSettingsController;

class SettingsController extends PanelAccountSettingsController
{
    protected function view(): string
    {
        return 'panels/super-admin/settings';
    }
}
