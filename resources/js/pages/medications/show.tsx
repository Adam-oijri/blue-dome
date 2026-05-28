import { Head } from '@inertiajs/react';

export default function MedicationShow(props: Record<string, unknown>) {
    return (
        <>
            <Head title="Medication" />
            <h1>Medication</h1>
            <pre>{JSON.stringify(props, null, 2)}</pre>
        </>
    );
}
