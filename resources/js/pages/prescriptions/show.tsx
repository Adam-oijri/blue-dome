import { Head } from '@inertiajs/react';

import type { FieldChangeEntry } from '@/components/provenance-panel';
import { ProvenancePanel } from '@/components/provenance-panel';

interface Props {
    prescription: Record<string, unknown>;
    provenance?: FieldChangeEntry[];
}

export default function PrescriptionShow({ prescription, provenance }: Props) {
    return (
        <>
            <Head title="Prescription" />
            <div className="flex h-full flex-col p-6">
                <h1 className="mb-4 text-2xl font-semibold">Prescription</h1>

                <section className="mb-6 rounded border border-neutral-200 p-4 text-sm">
                    <pre className="overflow-x-auto text-xs">
                        {JSON.stringify(prescription, null, 2)}
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
