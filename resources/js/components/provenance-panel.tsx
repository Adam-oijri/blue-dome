import { Deferred } from '@inertiajs/react';

export interface FieldChangeEntry {
    id: string;
    entity_type: string;
    entity_id: string;
    field_name: string;
    old_value: string | null;
    new_value: string | null;
    changed_at: string;
    changed_by_user?: {
        id: string;
        first_name: string;
        last_name: string;
    } | null;
    changed_by_clinic?: {
        id: string;
        name: string;
    } | null;
}

interface Props {
    /**
     * The Inertia deferred-prop key on the parent page (e.g. `'provenance'`).
     * The parent controller exposes the list via Inertia::defer(...) so this
     * panel hydrates after the initial paint.
     */
    deferredKey: string;
    /** The history array delivered by the deferred prop. */
    entries?: FieldChangeEntry[];
    /** Optional override for the panel heading. Defaults to the lang string. */
    title?: string;
}

/**
 * Per-field provenance history for a clinical record. Hydrated lazily so the
 * primary page paint isn't blocked. Replaced by the Carbon panel once the
 * `.claude/frontend/` migration lands; for now this is a minimal placeholder
 * that proves the contract the eventual Carbon UI consumes.
 */
export function ProvenancePanel({
    deferredKey,
    entries,
    title = 'Change history',
}: Props) {
    return (
        <section className="rounded border border-neutral-200 p-4 text-sm">
            <h2 className="mb-3 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                {title}
            </h2>
            <Deferred
                data={deferredKey}
                fallback={
                    <p className="text-xs text-neutral-400">Loading history…</p>
                }
            >
                <>
                    {entries && entries.length === 0 && (
                        <p className="text-xs text-neutral-400">
                            No changes have been recorded for this record yet.
                        </p>
                    )}
                    {entries && entries.length > 0 && (
                        <ul className="space-y-2 text-xs">
                            {entries.map((entry) => (
                                <li
                                    key={entry.id}
                                    className="border-b border-neutral-100 pb-2 last:border-b-0"
                                >
                                    <div className="flex flex-wrap items-baseline gap-x-2">
                                        <span className="font-mono text-neutral-500">
                                            {entry.changed_at}
                                        </span>
                                        <span className="font-medium">
                                            {entry.changed_by_user
                                                ? `${entry.changed_by_user.first_name} ${entry.changed_by_user.last_name}`
                                                : 'Unknown user'}
                                        </span>
                                        <span className="text-neutral-500">
                                            (
                                            {entry.changed_by_clinic?.name ??
                                                'Unknown clinic'}
                                            )
                                        </span>
                                    </div>
                                    <div className="text-neutral-700">
                                        <code className="font-mono">
                                            {entry.field_name}
                                        </code>
                                        :{' '}
                                        <span className="text-neutral-400 line-through">
                                            {entry.old_value ?? '∅'}
                                        </span>{' '}
                                        →{' '}
                                        <span className="text-neutral-900">
                                            {entry.new_value ?? '∅'}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            </Deferred>
        </section>
    );
}
