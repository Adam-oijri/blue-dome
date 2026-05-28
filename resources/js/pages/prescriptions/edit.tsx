import { Head } from '@inertiajs/react';

export default function PrescriptionEdit(props: Record<string, unknown>) {
    return (
        <>
            <Head title="Edit prescription" />
            <h1>Edit prescription</h1>
            <pre>{JSON.stringify(props, null, 2)}</pre>
        </>
    );
}
