import { Head } from '@inertiajs/react';

export default function MedicalRecordsIndex(props: Record<string, unknown>) {
    return (
        <>
            <Head title="Medical records" />
            <h1>Medical records</h1>
            <pre>{JSON.stringify(props, null, 2)}</pre>
        </>
    );
}
