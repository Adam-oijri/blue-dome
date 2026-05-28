import { Head } from '@inertiajs/react';

export default function LabOrderCreate(props: Record<string, unknown>) {
    return (
        <>
            <Head title="New lab order" />
            <h1>New lab order</h1>
            <pre>{JSON.stringify(props, null, 2)}</pre>
        </>
    );
}
