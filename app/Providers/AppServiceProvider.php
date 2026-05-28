<?php

namespace App\Providers;

use App\Contracts\WhatsAppGateway;
use App\Events\AppointmentCreated;
use App\Listeners\SendAppointmentConfirmationListener;
use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\Document;
use App\Models\DocumentFolder;
use App\Models\Expense;
use App\Models\Inventory;
use App\Models\InventoryTransaction;
use App\Models\Invoice;
use App\Models\LabOrder;
use App\Models\MedicalRecord;
use App\Models\Medication;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\Prescription;
use App\Models\User;
use App\Models\Vendor;
use App\Observers\AppointmentObserver;
use App\Observers\AuditObserver;
use App\Observers\ClinicObserver;
use App\Observers\ExpenseObserver;
use App\Observers\InventoryTransactionObserver;
use App\Observers\InvoiceObserver;
use App\Observers\LabOrderObserver;
use App\Observers\MedicalRecordObserver;
use App\Observers\PatientObserver;
use App\Observers\PaymentObserver;
use App\Observers\PrescriptionObserver;
use App\Policies\AppointmentPolicy;
use App\Policies\ClinicPolicy;
use App\Policies\DocumentFolderPolicy;
use App\Policies\DocumentPolicy;
use App\Policies\ExpensePolicy;
use App\Policies\InventoryPolicy;
use App\Policies\InvoicePolicy;
use App\Policies\LabOrderPolicy;
use App\Policies\MedicalRecordPolicy;
use App\Policies\MedicationPolicy;
use App\Policies\PatientPolicy;
use App\Policies\PaymentPolicy;
use App\Policies\PrescriptionPolicy;
use App\Policies\UserPolicy;
use App\Policies\VendorPolicy;
use App\Services\Messaging\NullWhatsAppGateway;
use App\Services\Payments\PaymentGatewayManager;
use App\Support\LocaleRegistry;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(WhatsAppGateway::class, NullWhatsAppGateway::class);
        $this->app->singleton(PaymentGatewayManager::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->registerRoutePatterns();
        $this->registerPolicies();
        $this->registerObservers();
        $this->registerEvents();
    }

    /**
     * Constrains the global `{locale}` route parameter so Fortify's
     * auto-registered routes (and any other route using the `{locale}`
     * segment without an explicit `where`) only match supported slugs.
     */
    protected function registerRoutePatterns(): void
    {
        Route::pattern('locale', LocaleRegistry::slugRegex());
    }

    protected function registerPolicies(): void
    {
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Clinic::class, ClinicPolicy::class);
        Gate::policy(Patient::class, PatientPolicy::class);
        Gate::policy(Appointment::class, AppointmentPolicy::class);
        Gate::policy(Invoice::class, InvoicePolicy::class);
        Gate::policy(MedicalRecord::class, MedicalRecordPolicy::class);
        Gate::policy(Medication::class, MedicationPolicy::class);
        Gate::policy(Prescription::class, PrescriptionPolicy::class);
        Gate::policy(LabOrder::class, LabOrderPolicy::class);
        Gate::policy(Payment::class, PaymentPolicy::class);
        Gate::policy(Expense::class, ExpensePolicy::class);
        Gate::policy(Vendor::class, VendorPolicy::class);
        Gate::policy(Inventory::class, InventoryPolicy::class);
        Gate::policy(Document::class, DocumentPolicy::class);
        Gate::policy(DocumentFolder::class, DocumentFolderPolicy::class);
    }

    protected function registerObservers(): void
    {
        Clinic::observe([ClinicObserver::class, AuditObserver::class]);
        Patient::observe([PatientObserver::class, AuditObserver::class]);
        Appointment::observe([AppointmentObserver::class, AuditObserver::class]);
        Prescription::observe([PrescriptionObserver::class, AuditObserver::class]);
        LabOrder::observe([LabOrderObserver::class, AuditObserver::class]);
        MedicalRecord::observe([MedicalRecordObserver::class, AuditObserver::class]);
        Invoice::observe([InvoiceObserver::class, AuditObserver::class]);
        Payment::observe([PaymentObserver::class, AuditObserver::class]);
        Expense::observe([ExpenseObserver::class, AuditObserver::class]);
        InventoryTransaction::observe(InventoryTransactionObserver::class);
        Inventory::observe(AuditObserver::class);
        Document::observe(AuditObserver::class);
        User::observe(AuditObserver::class);
    }

    protected function registerEvents(): void
    {
        Event::listen(AppointmentCreated::class, SendAppointmentConfirmationListener::class);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
