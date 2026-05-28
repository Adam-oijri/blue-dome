import { Head } from '@inertiajs/react';

export default function InvoiceEdit(props: Record<string, unknown>) {
    return (
        <>
            <Head title="Edit invoice" />
            <h1>Edit invoice</h1>
            <pre>{JSON.stringify(props, null, 2)}</pre>
        </>
    );
}
