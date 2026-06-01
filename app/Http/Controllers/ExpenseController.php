<?php

namespace App\Http\Controllers;

use App\Http\Requests\Expense\StoreExpenseRequest;
use App\Http\Requests\Expense\UpdateExpenseRequest;
use App\Models\Expense;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Expense::class);

        $query = Expense::query()
            ->select(['id', 'clinic_id', 'expense_number', 'expense_date', 'category', 'amount', 'currency', 'payment_status', 'vendor_id'])
            ->with(['vendor:id,vendor_name'])
            ->latest('expense_date');

        if ($request->user()->role !== 'super_admin') {
            $query->where('clinic_id', $request->user()->clinic_id);
        }

        if ($category = $request->string('category')->trim()->toString()) {
            $query->where('category', $category);
        }

        return Inertia::render('expenses/index', [
            'expenses' => $query->paginate(25)->withQueryString(),
            'filters' => ['category' => $category ?: null],
            'vendors' => Vendor::where('clinic_id', $request->user()->clinic_id)
                ->where('is_active', true)
                ->orderBy('vendor_name')
                ->get(['id', 'vendor_name']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Expense::class);

        return Inertia::render('expenses/create');
    }

    public function store(StoreExpenseRequest $request): RedirectResponse
    {
        Expense::create($request->validated() + [
            'clinic_id' => $request->user()->clinic_id,
            'currency' => $request->input('currency', 'MAD'),
        ]);

        return back()
            ->with('toast', ['type' => 'success', 'message' => __('expenses.created')]);
    }

    public function show(string $locale, Expense $expense): Response
    {
        unset($locale);
        $this->authorize('view', $expense);

        $expense->load(['vendor:id,vendor_name', 'createdBy:id,first_name,last_name']);

        return Inertia::render('expenses/show', [
            'expense' => $expense,
        ]);
    }

    public function edit(string $locale, Expense $expense): Response
    {
        unset($locale);
        $this->authorize('update', $expense);

        return Inertia::render('expenses/edit', [
            'expense' => $expense,
        ]);
    }

    public function update(UpdateExpenseRequest $request, string $locale, Expense $expense): RedirectResponse
    {
        unset($locale);
        $expense->update($request->validated());

        return redirect()
            ->route('expenses.show', $expense)
            ->with('toast', ['type' => 'success', 'message' => __('expenses.updated')]);
    }

    public function destroy(string $locale, Expense $expense): RedirectResponse
    {
        unset($locale);
        $this->authorize('delete', $expense);

        $expense->delete();

        return redirect()
            ->route('expenses.index')
            ->with('toast', ['type' => 'success', 'message' => __('expenses.deleted')]);
    }
}
