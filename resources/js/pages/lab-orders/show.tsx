import { Head } from '@inertiajs/react';

import type { FieldChangeEntry } from '@/components/provenance-panel';
import { ProvenancePanel } from '@/components/provenance-panel';

interface Props {
    lab_order: Record<string, unknown>;
    provenance?: FieldChangeEntry[];
}

export default function LabOrderShow({ lab_order, provenance }: Props) {
    return (
        <>
            <Head title="Lab order" />
            <div className="flex h-full flex-col p-6">
                <h1 className="mb-4 text-2xl font-semibold">Lab order</h1>

                <section className="mb-6 rounded border border-neutral-200 p-4 text-sm">
                    <pre className="overflow-x-auto text-xs">
                        {JSON.stringify(lab_order, null, 2)}
                    </pre>
                </section>

                <div className="mb-6">
                    <ProvenancePanel
                        deferredKey="provenance"
                        entries={provenance}
                    />
                </div>

                <p className="mt-auto text-center text-xs text-neutral-400">
                    Placeholder. Carbon panel will replace this view.
                </p>
            </div>
        </>
    );
}
