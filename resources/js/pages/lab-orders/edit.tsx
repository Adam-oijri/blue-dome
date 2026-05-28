import { Head } from '@inertiajs/react';

export default function LabOrderEdit(props: Record<string, unknown>) {
    return (
        <>
            <Head title="Edit lab order" />
            <h1>Edit lab order</h1>
            <pre>{JSON.stringify(props, null, 2)}</pre>
        </>
    );
}
