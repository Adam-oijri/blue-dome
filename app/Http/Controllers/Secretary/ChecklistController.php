<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use App\Models\SecretaryChecklistCustomItem;
use App\Models\SecretaryChecklistItem;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Front-desk checklist for the signed-in secretary: toggling built-in or custom
 * items for the current day, plus managing the secretary's own recurring custom
 * items. Completion lives in secretary_checklist_items (keyed by item_key);
 * custom item definitions live in secretary_checklist_custom_items.
 */
class ChecklistController extends Controller
{
    /**
     * Built-in checklist item keys (frontend cl_* dictionary keys).
     *
     * @var list<string>
     */
    public const ITEM_KEYS = [
        'cl_open_drawer',
        'cl_sync_calendar',
        'cl_review_noshows',
        'cl_print_list',
        'cl_reconcile',
        'cl_send_recap',
        'cl_archive_files',
        'cl_lock_drawer',
    ];

    /**
     * Toggle a checklist item done/undone for today. The key is either a
     * built-in item key or the UUID of one of the secretary's own custom items.
     */
    public function toggle(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'item_key' => [
                'required',
                'string',
                'max:50',
                function (string $attribute, mixed $value, callable $fail) use ($user): void {
                    if (in_array($value, self::ITEM_KEYS, true)) {
                        return;
                    }

                    // Custom item keys are UUIDs; guard the cast so a non-UUID
                    // built-in lookalike fails validation instead of hitting a
                    // Postgres uuid cast error.
                    $ownsCustomItem = Str::isUuid($value)
                        && SecretaryChecklistCustomItem::query()
                            ->whereKey($value)
                            ->where('user_id', $user->id)
                            ->exists();

                    if (! $ownsCustomItem) {
                        $fail(__('validation.in', ['attribute' => $attribute]));
                    }
                },
            ],
        ]);

        $today = CarbonImmutable::today()->toDateString();

        $existing = SecretaryChecklistItem::query()
            ->where('user_id', $user->id)
            ->where('checklist_date', $today)
            ->where('item_key', $validated['item_key'])
            ->first();

        if ($existing !== null) {
            $existing->delete();
        } else {
            SecretaryChecklistItem::create([
                'clinic_id' => $user->clinic_id,
                'user_id' => $user->id,
                'checklist_date' => $today,
                'item_key' => $validated['item_key'],
            ]);
        }

        return back();
    }

    /**
     * Add a recurring custom checklist item for the signed-in secretary.
     */
    public function storeItem(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'label' => ['required', 'string', 'max:120'],
        ]);

        $user = $request->user();

        SecretaryChecklistCustomItem::create([
            'clinic_id' => $user->clinic_id,
            'user_id' => $user->id,
            'label' => $validated['label'],
        ]);

        return back();
    }

    /**
     * Delete one of the secretary's own custom items (and its completions).
     */
    public function destroyItem(Request $request, string $locale, SecretaryChecklistCustomItem $item): RedirectResponse
    {
        unset($locale);

        abort_unless($item->user_id === $request->user()->id, 403);

        SecretaryChecklistItem::query()
            ->where('user_id', $item->user_id)
            ->where('item_key', $item->id)
            ->delete();

        $item->delete();

        return back();
    }
}
