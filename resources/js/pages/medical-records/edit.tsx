import { Head } from '@inertiajs/react';

export default function MedicalRecordEdit(props: Record<string, unknown>) {
    return (
        <>
            <Head title="Edit medical record" />
            <h1>Edit medical record</h1>
            <pre>{JSON.stringify(props, null, 2)}</pre>
        </>
    );
}
