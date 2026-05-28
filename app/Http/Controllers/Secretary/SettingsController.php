<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Settings\PanelAccountSettingsController;

class SettingsController extends PanelAccountSettingsController
{
    protected function view(): string
    {
        return 'panels/secretary/settings';
    }
}
