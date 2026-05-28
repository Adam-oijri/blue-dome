import { Head } from '@inertiajs/react';

export default function MedicationsIndex(props: Record<string, unknown>) {
    return (
        <>
            <Head title="Medications" />
            <h1>Medications</h1>
            <pre>{JSON.stringify(props, null, 2)}</pre>
        </>
    );
}
