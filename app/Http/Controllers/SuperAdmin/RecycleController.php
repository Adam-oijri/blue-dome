<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Appointment;
use App\Models\Branch;
use App\Models\Clinic;
use App\Models\Document;
use App\Models\Expense;
use App\Models\Inventory;
use App\Models\Invoice;
use App\Models\LabOrder;
use App\Models\Medication;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\Prescription;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Soft-deleted records browser for super admins. The whitelist below caps the
 * types of records that may be restored — never expose arbitrary model lookup
 * via the `type` URL param.
 */
class RecycleController extends Controller
{
    /** @var array<string, array{model: class-string<Model>, label: string, display: array{title: string, subtitle?: string}}> */
    private const TYPES = [
        'clinic' => [
            'model' => Clinic::class,
            'label' => 'Clinics',
            'display' => ['title' => 'name', 'subtitle' => 'slug'],
        ],
        'user' => [
            'model' => User::class,
            'label' => 'Users',
            'display' => ['title' => 'email', 'subtitle' => 'role'],
        ],
        'patient' => [
            'model' => Patient::class,
            'label' => 'Patients',
            'display' => ['title' => 'patient_code', 'subtitle' => 'first_name'],
        ],
        'appointment' => [
            'model' => Appointment::class,
            'label' => 'Appointments',
            'display' => ['title' => 'appointment_number', 'subtitle' => 'status'],
        ],
        'invoice' => [
            'model' => Invoice::class,
            'label' => 'Invoices',
            'display' => ['title' => 'invoice_number', 'subtitle' => 'status'],
        ],
        'payment' => [
            'model' => Payment::class,
            'label' => 'Payments',
            'display' => ['title' => 'payment_number', 'subtitle' => 'payment_method'],
        ],
        'prescription' => [
            'model' => Prescription::class,
            'label' => 'Prescriptions',
            'display' => ['title' => 'prescription_number', 'subtitle' => 'status'],
        ],
        'lab_order' => [
            'model' => LabOrder::class,
            'label' => 'Lab orders',
            'display' => ['title' => 'order_number', 'subtitle' => 'status'],
        ],
        'inventory' => [
            'model' => Inventory::class,
            'label' => 'Inventory',
            'display' => ['title' => 'item_name', 'subtitle' => 'item_code'],
        ],
        'branch' => [
            'model' => Branch::class,
            'label' => 'Branches',
            'display' => ['title' => 'branch_name', 'subtitle' => 'branch_code'],
        ],
        'medication' => [
            'model' => Medication::class,
            'label' => 'Medications',
            'display' => ['title' => 'name', 'subtitle' => 'generic_name'],
        ],
        'vendor' => [
            'model' => Vendor::class,
            'label' => 'Vendors',
            'display' => ['title' => 'name', 'subtitle' => 'contact_email'],
        ],
        'expense' => [
            'model' => Expense::class,
            'label' => 'Expenses',
            'display' => ['title' => 'category', 'subtitle' => 'amount'],
        ],
        'document' => [
            'model' => Document::class,
            'label' => 'Documents',
            'display' => ['title' => 'file_name', 'subtitle' => 'mime_type'],
        ],
    ];

    public function index(Request $request): Response
    {
        $type = $request->string('type', 'clinic')->toString();
        if (! array_key_exists($type, self::TYPES)) {
            $type = 'clinic';
        }

        $typeMeta = self::TYPES[$type];
        /** @var class-string<Model> $modelClass */
        $modelClass = $typeMeta['model'];

        $query = $modelClass::query()->onlyTrashed();

        // Eager-load clinic when the model has the column (i.e. anything tenant-scoped)
        if ((new $modelClass)->getConnection()->getSchemaBuilder()->hasColumn(
            (new $modelClass)->getTable(),
            'clinic_id'
        )) {
            $query->with('clinic:id,name');
        }

        $records = $query->orderByDesc('deleted_at')->paginate(25)->withQueryString();

        // Tab counts
        $counts = [];
        foreach (self::TYPES as $key => $meta) {
            /** @var class-string<Model> $cls */
            $cls = $meta['model'];
            $counts[$key] = $cls::query()->onlyTrashed()->count();
        }

        return Inertia::render('panels/super-admin/recycle', [
            'type' => $type,
            'types' => array_map(
                fn (string $key, array $meta): array => [
                    'value' => $key,
                    'label' => $meta['label'],
                    'count' => (int) ($counts[$key] ?? 0),
                ],
                array_keys(self::TYPES),
                array_values(self::TYPES),
            ),
            'records' => $records,
            'display' => $typeMeta['display'],
        ]);
    }

    public function restore(Request $request, string $locale, string $type, string $id): RedirectResponse
    {
        unset($locale);
        Gate::allowIf(fn ($user): bool => $user->role === 'super_admin');

        if (! array_key_exists($type, self::TYPES)) {
            abort(404);
        }

        /** @var class-string<Model> $modelClass */
        $modelClass = self::TYPES[$type]['model'];

        // All restorable models use UUID keys; a non-UUID id is a 404, not a
        // Postgres "invalid input syntax for type uuid" 500.
        if (! Str::isUuid($id)) {
            abort(404);
        }

        $record = $modelClass::query()->onlyTrashed()->findOrFail($id);

        DB::transaction(function () use ($record, $request, $type): void {
            $record->restore();

            ActivityLog::create([
                'clinic_id' => $record->clinic_id ?? null,
                'user_id' => $request->user()->id,
                'action' => 'restore',
                'entity_type' => class_basename($record),
                'entity_id' => $record->getKey(),
                'description' => "Restored {$type} from recycle bin",
                'old_values' => ['deleted_at' => $record->getOriginal('deleted_at')],
                'new_values' => ['deleted_at' => null],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'session_id' => $request->hasSession() ? $request->session()->getId() : null,
                'created_at' => now(),
            ]);
        });

        return back()->with('toast', [
            'type' => 'success',
            'message' => "Restored {$type}.",
        ]);
    }
}
