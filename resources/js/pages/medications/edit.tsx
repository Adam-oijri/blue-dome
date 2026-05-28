import { Head } from '@inertiajs/react';

export default function MedicationEdit(props: Record<string, unknown>) {
    return (
        <>
            <Head title="Edit medication" />
            <h1>Edit medication</h1>
            <pre>{JSON.stringify(props, null, 2)}</pre>
        </>
    );
}
