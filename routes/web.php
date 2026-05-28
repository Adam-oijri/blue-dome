<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\Doctor\SettingsController as DoctorSettingsController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DocumentFolderController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\InventoryTransactionController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\LabOrderController;
use App\Http\Controllers\MedicalRecordController;
use App\Http\Controllers\MedicationController;
use App\Http\Controllers\PanelController;
use App\Http\Controllers\Patient\VitalSignsController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\Secretary\FollowUpController;
use App\Http\Controllers\Secretary\SettingsController as SecretarySettingsController;
use App\Http\Controllers\SuperAdmin\ActivityLogController as SuperAdminActivityLogController;
use App\Http\Controllers\SuperAdmin\AppointmentController as SuperAdminAppointmentController;
use App\Http\Controllers\SuperAdmin\ClinicController as SuperAdminClinicController;
use App\Http\Controllers\SuperAdmin\ClinicEmailController as SuperAdminClinicEmailController;
use App\Http\Controllers\SuperAdmin\ClinicWhatsAppController as SuperAdminClinicWhatsAppController;
use App\Http\Controllers\SuperAdmin\DashboardController as SuperAdminDashboardController;
use App\Http\Controllers\SuperAdmin\DoctorController as SuperAdminDoctorController;
use App\Http\Controllers\SuperAdmin\FinanceController as SuperAdminFinanceController;
use App\Http\Controllers\SuperAdmin\InvitationController as SuperAdminInvitationController;
use App\Http\Controllers\SuperAdmin\RecycleController as SuperAdminRecycleController;
use App\Http\Controllers\SuperAdmin\SettingsController as SuperAdminSettingsController;
use App\Http\Controllers\SuperAdmin\UserController as SuperAdminUserController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\WebhookController;
use App\Support\LocaleRegistry;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

/*
 * Public, unauthenticated routes — kept OUTSIDE the locale group because
 * third-party callers (Meta WhatsApp Cloud, patient confirmation links sent
 * via WhatsApp) don't carry a locale slug.
 */
Route::get('appointments/confirm/{token}', [AppointmentController::class, 'confirm'])
    ->middleware('throttle:patient-confirmation')
    ->name('appointments.confirm');

Route::get('webhooks/whatsapp', [WebhookController::class, 'verifyWhatsApp'])
    ->name('webhooks.whatsapp.verify');
Route::post('webhooks/whatsapp', [WebhookController::class, 'whatsAppStatus'])
    ->name('webhooks.whatsapp.status');

// Root redirects to the default locale's landing.
Route::get('/', fn () => redirect('/'.LocaleRegistry::default().'/'));

Route::prefix('{locale}')
    ->where(['locale' => LocaleRegistry::slugRegex()])
    ->middleware('locale')
    ->group(function (): void {
        Route::inertia('/', 'welcome', [
            'canRegister' => Features::enabled(Features::registration()),
        ])->name('home');

        // Public, token-secured staff invitation acceptance.
        Route::get('invite/{token}', [InvitationController::class, 'show'])
            ->name('invitations.show');
        Route::post('invite/{token}', [InvitationController::class, 'accept'])
            ->name('invitations.accept');

        Route::middleware(['auth', 'verified'])->group(function (): void {
            Route::inertia('dashboard', 'dashboard')->name('dashboard');

            Route::middleware('role:super_admin')->prefix('super-admin')->name('super-admin.')->group(function (): void {
                Route::get('/', [SuperAdminDashboardController::class, 'index'])->name('dashboard');

                Route::get('clinics', [SuperAdminClinicController::class, 'index'])->name('clinics.index');
                Route::get('clinics/{clinic}', [SuperAdminClinicController::class, 'show'])->name('clinics.show');
                Route::get('clinics/{clinic}/whatsapp', [SuperAdminClinicWhatsAppController::class, 'edit'])
                    ->name('clinics.whatsapp.edit');
                Route::get('clinics/{clinic}/email', [SuperAdminClinicEmailController::class, 'edit'])
                    ->name('clinics.email.edit');

                Route::get('activity-log', [SuperAdminActivityLogController::class, 'index'])
                    ->name('activity-log');

                Route::get('users', [SuperAdminUserController::class, 'index'])->name('users');
                Route::get('appointments', [SuperAdminAppointmentController::class, 'index'])->name('appointments');
                Route::get('doctors', [SuperAdminDoctorController::class, 'index'])->name('doctors');
                Route::get('finance', [SuperAdminFinanceController::class, 'index'])->name('finance');
                Route::get('recycle', [SuperAdminRecycleController::class, 'index'])->name('recycle');
                Route::get('settings', [SuperAdminSettingsController::class, 'edit'])
                    ->name('settings');

                Route::post('clinics/{clinic}/suspend', [SuperAdminClinicController::class, 'suspend'])
                    ->name('clinics.suspend');
                Route::post('clinics/{clinic}/restore', [SuperAdminClinicController::class, 'restore'])
                    ->name('clinics.restore');
                Route::patch('clinics/{clinic}/whatsapp', [SuperAdminClinicWhatsAppController::class, 'update'])
                    ->name('clinics.whatsapp.update');
                Route::patch('clinics/{clinic}/email', [SuperAdminClinicEmailController::class, 'update'])
                    ->name('clinics.email.update');
                Route::post('invitations', [SuperAdminInvitationController::class, 'store'])
                    ->middleware('throttle:staff-creation')
                    ->name('invitations.store');
                Route::post('recycle/{type}/{id}/restore', [SuperAdminRecycleController::class, 'restore'])
                    ->name('recycle.restore');
            });

            Route::middleware('role:doctor')->prefix('doctor')->name('doctor.')->group(function (): void {
                Route::get('/', [PanelController::class, 'doctor'])->name('dashboard');
                Route::inertia('calendar', 'panels/doctor/calendar')->name('calendar');
                Route::inertia('follow-up', 'panels/doctor/follow-up')->name('follow-up');
                Route::get('settings', [DoctorSettingsController::class, 'edit'])->name('settings');
            });

            Route::middleware('role:secretary')->prefix('secretary')->name('secretary.')->group(function (): void {
                Route::get('/', [PanelController::class, 'secretary'])->name('dashboard');
                Route::get('follow-up', [FollowUpController::class, 'index'])->name('follow-up');
                Route::inertia('appointments', 'panels/secretary/appointments')->name('appointments');
                Route::inertia('patients', 'panels/secretary/patients')->name('patients');
                Route::inertia('walk-ins', 'panels/secretary/walk-ins')->name('walkins');
                Route::inertia('whatsapp', 'panels/secretary/whatsapp')->name('whatsapp');
                Route::inertia('billing', 'panels/secretary/billing')->name('billing');
                Route::inertia('payments', 'panels/secretary/payments')->name('payments');
                Route::inertia('doctors', 'panels/secretary/doctors')->name('doctors');
                Route::inertia('branches', 'panels/secretary/branches')->name('branches');
                Route::inertia('reports', 'panels/secretary/reports')->name('reports');
                Route::get('settings', [SecretarySettingsController::class, 'edit'])->name('settings');
            });

            require __DIR__.'/settings.php';

            Route::middleware('role:super_admin,doctor,secretary')->group(function (): void {
                Route::resource('patients', PatientController::class);

                Route::get('patients/{patient}/vital-signs', [VitalSignsController::class, 'index'])
                    ->name('patients.vital-signs.index');
                Route::post('patients/{patient}/vital-signs', [VitalSignsController::class, 'store'])
                    ->name('patients.vital-signs.store');

                Route::resource('appointments', AppointmentController::class)
                    ->except(['confirm']);

                Route::post('appointments/{appointment}/cancel', [AppointmentController::class, 'cancel'])
                    ->name('appointments.cancel');
                Route::post('appointments/{appointment}/follow-up-call', [AppointmentController::class, 'recordFollowUp'])
                    ->name('appointments.follow-up-call');

                Route::resource('medications', MedicationController::class);
                Route::resource('prescriptions', PrescriptionController::class);
                Route::resource('lab-orders', LabOrderController::class)->parameters(['lab-orders' => 'lab_order']);
                Route::post('lab-orders/{lab_order}/results', [LabOrderController::class, 'recordResults'])
                    ->name('lab-orders.results');
                Route::resource('medical-records', MedicalRecordController::class)
                    ->except(['destroy'])
                    ->parameters(['medical-records' => 'medical_record']);
                Route::post('medical-records/{medical_record}/sign', [MedicalRecordController::class, 'sign'])
                    ->name('medical-records.sign');

                Route::resource('invoices', InvoiceController::class);
                Route::post('payments', [PaymentController::class, 'store'])->name('payments.store');
                Route::post('payments/{payment}/refund', [PaymentController::class, 'refund'])
                    ->name('payments.refund');
                Route::resource('expenses', ExpenseController::class);
                Route::resource('vendors', VendorController::class);

                Route::get('inventory/alerts', [InventoryController::class, 'alerts'])
                    ->name('inventory.alerts');
                Route::resource('inventory', InventoryController::class)
                    ->parameters(['inventory' => 'inventory']);
                Route::post('inventory/{inventory}/transactions', [InventoryTransactionController::class, 'store'])
                    ->name('inventory.transactions.store');

                Route::resource('document-folders', DocumentFolderController::class)
                    ->only(['index', 'store', 'destroy'])
                    ->parameters(['document-folders' => 'document_folder']);
                Route::resource('documents', DocumentController::class)
                    ->except(['create', 'edit', 'update']);
                Route::get('documents/{document}/download', [DocumentController::class, 'download'])
                    ->name('documents.download');
            });
        });
    });

/*
 * Any URL not matching above and not part of the public allowlist is
 * redirected to the default locale equivalent. e.g. `/doctor` → `/ma-fr/doctor`.
 *
 * If the URL already looks like a locale-prefixed path (xx-xx/...) but the
 * slug isn't in the registry, return 404 instead of looping the fallback.
 */
Route::fallback(function () {
    $path = ltrim(request()->path(), '/');
    $firstSegment = strtok($path, '/');

    if ($firstSegment && preg_match('/^[a-z]{2}-[a-z]{2,3}$/', $firstSegment)) {
        abort(404);
    }

    return redirect('/'.LocaleRegistry::default().'/'.$path);
});
