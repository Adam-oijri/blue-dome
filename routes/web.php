<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\Doctor\CalendarController as DoctorCalendarController;
use App\Http\Controllers\Doctor\ConfirmationController as DoctorConfirmationController;
use App\Http\Controllers\Doctor\DashboardController as DoctorDashboardController;
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
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Patient\VitalSignsController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\Secretary\AppointmentsController as SecretaryAppointmentsController;
use App\Http\Controllers\Secretary\BillingController as SecretaryBillingController;
use App\Http\Controllers\Secretary\BranchesController as SecretaryBranchesController;
use App\Http\Controllers\Secretary\ChecklistController as SecretaryChecklistController;
use App\Http\Controllers\Secretary\DashboardController as SecretaryDashboardController;
use App\Http\Controllers\Secretary\DoctorsController as SecretaryDoctorsController;
use App\Http\Controllers\Secretary\FollowUpController;
use App\Http\Controllers\Secretary\PatientsController as SecretaryPatientsController;
use App\Http\Controllers\Secretary\PaymentsController as SecretaryPaymentsController;
use App\Http\Controllers\Secretary\ReportsController as SecretaryReportsController;
use App\Http\Controllers\Secretary\SettingsController as SecretarySettingsController;
use App\Http\Controllers\Secretary\StaffController as SecretaryStaffController;
use App\Http\Controllers\Secretary\WalkInsController as SecretaryWalkInsController;
use App\Http\Controllers\Secretary\WhatsAppController as SecretaryWhatsAppController;
use App\Http\Controllers\SuperAdmin\ActivityLogController as SuperAdminActivityLogController;
use App\Http\Controllers\SuperAdmin\AppointmentController as SuperAdminAppointmentController;
use App\Http\Controllers\SuperAdmin\ClinicAppointmentController as SuperAdminClinicAppointmentController;
use App\Http\Controllers\SuperAdmin\ClinicController as SuperAdminClinicController;
use App\Http\Controllers\SuperAdmin\ClinicEmailController as SuperAdminClinicEmailController;
use App\Http\Controllers\SuperAdmin\ClinicWhatsAppController as SuperAdminClinicWhatsAppController;
use App\Http\Controllers\SuperAdmin\DashboardController as SuperAdminDashboardController;
use App\Http\Controllers\SuperAdmin\DoctorController as SuperAdminDoctorController;
use App\Http\Controllers\SuperAdmin\DoctorProfileController as SuperAdminDoctorProfileController;
use App\Http\Controllers\SuperAdmin\FinanceController as SuperAdminFinanceController;
use App\Http\Controllers\SuperAdmin\InventoryController as SuperAdminInventoryController;
use App\Http\Controllers\SuperAdmin\InvitationController as SuperAdminInvitationController;
use App\Http\Controllers\SuperAdmin\InvoiceController as SuperAdminInvoiceController;
use App\Http\Controllers\SuperAdmin\PatientController as SuperAdminPatientController;
use App\Http\Controllers\SuperAdmin\PaymentController as SuperAdminPaymentController;
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

        // Public landing-page newsletter opt-in (emails a sign-in link).
        Route::post('subscribe', [NewsletterController::class, 'store'])
            ->middleware('throttle:5,1')
            ->name('newsletter.subscribe');

        // Public, token-secured staff invitation acceptance.
        Route::get('invite/{token}', [InvitationController::class, 'show'])
            ->name('invitations.show');
        Route::post('invite/{token}', [InvitationController::class, 'accept'])
            ->name('invitations.accept');

        // Trial-lapsed landing — authenticated + verified but intentionally
        // OUTSIDE the clinic.active gate (else EnsureClinicActive would loop
        // redirecting here). Logout lives on Fortify's own ungated route.
        Route::middleware(['auth', 'verified'])->group(function (): void {
            Route::inertia('trial-expired', 'auth/trial-expired')->name('trial-expired');
        });

        Route::middleware(['auth', 'verified', 'clinic.active'])->group(function (): void {
            Route::middleware('role:super_admin')->prefix('super-admin')->name('super-admin.')->group(function (): void {
                Route::get('/', [SuperAdminDashboardController::class, 'index'])->name('dashboard');

                Route::get('clinics', [SuperAdminClinicController::class, 'index'])->name('clinics.index');
                Route::get('clinics/create', [SuperAdminClinicController::class, 'create'])->name('clinics.create');
                Route::get('clinics/export', [SuperAdminClinicController::class, 'export'])->name('clinics.export');
                Route::post('clinics', [SuperAdminClinicController::class, 'store'])->name('clinics.store');
                Route::post('clinics/bulk', [SuperAdminClinicController::class, 'bulk'])->name('clinics.bulk');
                Route::get('clinics/{clinic}', [SuperAdminClinicController::class, 'show'])->name('clinics.show');
                Route::get('clinics/{clinic}/edit', [SuperAdminClinicController::class, 'edit'])->name('clinics.edit');
                Route::patch('clinics/{clinic}', [SuperAdminClinicController::class, 'update'])->name('clinics.update');
                Route::get('clinics/{clinic}/whatsapp', [SuperAdminClinicWhatsAppController::class, 'edit'])
                    ->name('clinics.whatsapp.edit');
                Route::get('clinics/{clinic}/email', [SuperAdminClinicEmailController::class, 'edit'])
                    ->name('clinics.email.edit');

                /*
                 * Clinic-scoped operational management. The {clinic} binding is
                 * the write target, so super-admin writes land on that clinic,
                 * not the super-admin's own "Platform" clinic.
                 */
                Route::prefix('clinics/{clinic}')->name('clinics.')->group(function (): void {
                    Route::get('patients', [SuperAdminPatientController::class, 'index'])->name('patients.index');
                    Route::get('patients/create', [SuperAdminPatientController::class, 'create'])->name('patients.create');
                    Route::post('patients', [SuperAdminPatientController::class, 'store'])->name('patients.store');
                    Route::get('patients/{patient}/edit', [SuperAdminPatientController::class, 'edit'])->name('patients.edit');
                    Route::patch('patients/{patient}', [SuperAdminPatientController::class, 'update'])->name('patients.update');
                    Route::delete('patients/{patient}', [SuperAdminPatientController::class, 'destroy'])->name('patients.destroy');

                    Route::get('inventory', [SuperAdminInventoryController::class, 'index'])->name('inventory.index');
                    Route::get('inventory/create', [SuperAdminInventoryController::class, 'create'])->name('inventory.create');
                    Route::post('inventory', [SuperAdminInventoryController::class, 'store'])->name('inventory.store');
                    Route::get('inventory/{inventory}/edit', [SuperAdminInventoryController::class, 'edit'])->name('inventory.edit');
                    Route::patch('inventory/{inventory}', [SuperAdminInventoryController::class, 'update'])->name('inventory.update');
                    Route::delete('inventory/{inventory}', [SuperAdminInventoryController::class, 'destroy'])->name('inventory.destroy');
                    Route::post('inventory/{inventory}/transactions', [SuperAdminInventoryController::class, 'storeTransaction'])->name('inventory.transactions.store');

                    Route::get('invoices', [SuperAdminInvoiceController::class, 'index'])->name('invoices.index');
                    Route::get('invoices/create', [SuperAdminInvoiceController::class, 'create'])->name('invoices.create');
                    Route::post('invoices', [SuperAdminInvoiceController::class, 'store'])->name('invoices.store');
                    Route::get('invoices/{invoice}', [SuperAdminInvoiceController::class, 'show'])->name('invoices.show');
                    Route::get('invoices/{invoice}/edit', [SuperAdminInvoiceController::class, 'edit'])->name('invoices.edit');
                    Route::patch('invoices/{invoice}', [SuperAdminInvoiceController::class, 'update'])->name('invoices.update');
                    Route::delete('invoices/{invoice}', [SuperAdminInvoiceController::class, 'destroy'])->name('invoices.destroy');
                    Route::post('payments', [SuperAdminPaymentController::class, 'store'])->name('payments.store');
                    Route::post('payments/{payment}/refund', [SuperAdminPaymentController::class, 'refund'])->name('payments.refund');

                    Route::get('appointments', [SuperAdminClinicAppointmentController::class, 'index'])->name('appointments.index');
                    Route::get('appointments/create', [SuperAdminClinicAppointmentController::class, 'create'])->name('appointments.create');
                    Route::post('appointments', [SuperAdminClinicAppointmentController::class, 'store'])->name('appointments.store');
                    Route::get('appointments/{appointment}/edit', [SuperAdminClinicAppointmentController::class, 'edit'])->name('appointments.edit');
                    Route::patch('appointments/{appointment}', [SuperAdminClinicAppointmentController::class, 'update'])->name('appointments.update');
                    Route::delete('appointments/{appointment}', [SuperAdminClinicAppointmentController::class, 'destroy'])->name('appointments.destroy');
                    Route::post('appointments/{appointment}/cancel', [SuperAdminClinicAppointmentController::class, 'cancel'])->name('appointments.cancel');
                });

                Route::get('activity-log', [SuperAdminActivityLogController::class, 'index'])
                    ->name('activity-log');

                Route::get('users', [SuperAdminUserController::class, 'index'])->name('users');
                Route::get('users/export', [SuperAdminUserController::class, 'export'])->name('users.export');
                Route::post('users/bulk', [SuperAdminUserController::class, 'bulk'])->name('users.bulk');
                Route::get('users/{user}/edit', [SuperAdminUserController::class, 'edit'])->name('users.edit');
                Route::patch('users/{user}', [SuperAdminUserController::class, 'update'])->name('users.update');
                Route::delete('users/{user}', [SuperAdminUserController::class, 'destroy'])->name('users.destroy');
                Route::post('users/{user}/restore', [SuperAdminUserController::class, 'restore'])->name('users.restore');

                Route::get('appointments', [SuperAdminAppointmentController::class, 'index'])->name('appointments');
                Route::get('appointments/export', [SuperAdminAppointmentController::class, 'export'])->name('appointments.export');

                Route::get('doctors', [SuperAdminDoctorController::class, 'index'])->name('doctors');
                Route::get('doctors/export', [SuperAdminDoctorController::class, 'export'])->name('doctors.export');
                Route::get('doctors/{user}/profile/edit', [SuperAdminDoctorProfileController::class, 'edit'])->name('doctors.profile.edit');
                Route::patch('doctors/{user}/profile', [SuperAdminDoctorProfileController::class, 'update'])->name('doctors.profile.update');
                Route::get('finance', [SuperAdminFinanceController::class, 'index'])->name('finance');
                Route::get('finance/export', [SuperAdminFinanceController::class, 'export'])->name('finance.export');
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
                Route::get('/', [DoctorDashboardController::class, 'index'])->name('dashboard');
                Route::get('calendar', [DoctorCalendarController::class, 'index'])->name('calendar');
                Route::get('confirmations', [DoctorConfirmationController::class, 'index'])->name('confirmations');
                Route::get('settings', [DoctorSettingsController::class, 'edit'])->name('settings');
            });

            Route::middleware('role:secretary')->prefix('secretary')->name('secretary.')->group(function (): void {
                Route::get('/', [SecretaryDashboardController::class, 'index'])->name('dashboard');
                Route::post('waiting-room/{appointment}/advance', [SecretaryDashboardController::class, 'advanceWaitingRoom'])
                    ->name('waiting-room.advance');
                Route::post('checklist', [SecretaryChecklistController::class, 'toggle'])->name('checklist.toggle');
                Route::post('checklist/items', [SecretaryChecklistController::class, 'storeItem'])->name('checklist.items.store');
                Route::delete('checklist/items/{item}', [SecretaryChecklistController::class, 'destroyItem'])->name('checklist.items.destroy');
                Route::get('follow-up', [FollowUpController::class, 'index'])->name('follow-up');
                Route::get('appointments', [SecretaryAppointmentsController::class, 'index'])->name('appointments');
                Route::post('appointments/{appointment}/send-confirmation', [SecretaryAppointmentsController::class, 'sendConfirmation'])
                    ->name('appointments.send-confirmation');
                Route::get('patients', [SecretaryPatientsController::class, 'index'])->name('patients');
                Route::get('patients/export', [SecretaryPatientsController::class, 'export'])->name('patients.export');
                Route::get('walk-ins', [SecretaryWalkInsController::class, 'index'])->name('walkins');
                Route::get('whatsapp', [SecretaryWhatsAppController::class, 'index'])->name('whatsapp');
                Route::get('billing', [SecretaryBillingController::class, 'index'])->name('billing');
                Route::get('payments', [SecretaryPaymentsController::class, 'index'])->name('payments');
                Route::get('doctors', [SecretaryDoctorsController::class, 'index'])->name('doctors');
                Route::get('staff', [SecretaryStaffController::class, 'index'])->name('staff');
                Route::post('staff/invitations', [SecretaryStaffController::class, 'storeInvitation'])
                    ->middleware('throttle:staff-creation')
                    ->name('staff.invitations.store');
                Route::delete('staff/invitations/{invitation}', [SecretaryStaffController::class, 'revokeInvitation'])
                    ->name('staff.invitations.revoke');
                Route::delete('staff/{user}', [SecretaryStaffController::class, 'destroy'])
                    ->name('staff.destroy');
                Route::get('branches', [SecretaryBranchesController::class, 'index'])->name('branches');
                Route::get('reports', [SecretaryReportsController::class, 'index'])->name('reports');
                Route::get('reports/export', [SecretaryReportsController::class, 'export'])->name('reports.export');
                Route::get('settings', [SecretarySettingsController::class, 'edit'])->name('settings');
            });

            require __DIR__.'/settings.php';

            // Internal staff chat — clinic channel + 1:1 DMs between a clinic's
            // doctor(s) and secretary(ies), plus cross-clinic DMs with the
            // platform super admin. Near-realtime via the JSON poller.
            Route::middleware('role:super_admin,doctor,secretary')->group(function (): void {
                Route::get('messages', [MessageController::class, 'index'])->name('messages.index');
                Route::get('messages/poll', [MessageController::class, 'poll'])->name('messages.poll');
                Route::post('messages', [MessageController::class, 'store'])->name('messages.store');
                Route::post('messages/start', [MessageController::class, 'start'])->name('messages.start');
                Route::post('messages/{conversation}/read', [MessageController::class, 'read'])->name('messages.read');
            });

            Route::middleware('role:super_admin,doctor,secretary')->group(function (): void {
                // In-app notification feed (bell dropdown + dashboard panel).
                Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
                Route::get('notifications/feed', [NotificationController::class, 'feed'])->name('notifications.feed');
                Route::post('notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
                Route::patch('notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');

                Route::resource('patients', PatientController::class)
                    ->except(['create', 'edit']);

                Route::get('patients/{patient}/vital-signs', [VitalSignsController::class, 'index'])
                    ->name('patients.vital-signs.index');
                Route::post('patients/{patient}/vital-signs', [VitalSignsController::class, 'store'])
                    ->name('patients.vital-signs.store');

                Route::get('appointments/form-options', [AppointmentController::class, 'formOptions'])
                    ->name('appointments.form-options');

                Route::resource('appointments', AppointmentController::class)
                    ->except(['confirm', 'create', 'edit']);

                Route::post('appointments/{appointment}/cancel', [AppointmentController::class, 'cancel'])
                    ->name('appointments.cancel');
                Route::post('appointments/{appointment}/follow-up-call', [AppointmentController::class, 'recordFollowUp'])
                    ->name('appointments.follow-up-call');

                Route::resource('medications', MedicationController::class)
                    ->except(['create', 'edit']);

                Route::resource('invoices', InvoiceController::class)
                    ->except(['create', 'edit']);
                Route::get('invoices/{invoice}/pdf', [InvoiceController::class, 'pdf'])
                    ->name('invoices.pdf');
                Route::post('payments', [PaymentController::class, 'store'])->name('payments.store');
                Route::post('payments/{payment}/refund', [PaymentController::class, 'refund'])
                    ->name('payments.refund');
                Route::resource('expenses', ExpenseController::class)
                    ->except(['create', 'edit']);
                Route::resource('vendors', VendorController::class)
                    ->except(['create', 'edit']);

                Route::get('inventory/alerts', [InventoryController::class, 'alerts'])
                    ->name('inventory.alerts');
                Route::resource('inventory', InventoryController::class)
                    ->except(['create', 'edit'])
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
                Route::get('documents/{document}/preview', [DocumentController::class, 'preview'])
                    ->name('documents.preview');
            });

            /*
             * Clinical records — the treating doctor's domain (super admin
             * retained for cross-clinic oversight). The secretary/clinic
             * manager is deliberately excluded from medical records,
             * prescriptions and lab orders, enforced here at the route layer
             * and mirrored in the matching policies.
             */
            Route::middleware('role:super_admin,doctor')->group(function (): void {
                Route::resource('prescriptions', PrescriptionController::class)
                    ->except(['create', 'edit']);
                Route::get('prescriptions/{prescription}/pdf', [PrescriptionController::class, 'pdf'])
                    ->name('prescriptions.pdf');
                Route::resource('lab-orders', LabOrderController::class)
                    ->except(['create', 'edit'])
                    ->parameters(['lab-orders' => 'lab_order']);
                Route::post('lab-orders/{lab_order}/results', [LabOrderController::class, 'recordResults'])
                    ->name('lab-orders.results');
                Route::get('lab-orders/{lab_order}/pdf', [LabOrderController::class, 'pdf'])
                    ->name('lab-orders.pdf');
                Route::resource('medical-records', MedicalRecordController::class)
                    ->except(['destroy', 'create', 'edit'])
                    ->parameters(['medical-records' => 'medical_record']);
                Route::post('medical-records/{medical_record}/sign', [MedicalRecordController::class, 'sign'])
                    ->name('medical-records.sign');
                Route::get('medical-records/{medical_record}/pdf', [MedicalRecordController::class, 'pdf'])
                    ->name('medical-records.pdf');
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
