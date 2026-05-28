import { Head } from '@inertiajs/react';

export default function InvoiceShow(props: Record<string, unknown>) {
    return (
        <>
            <Head title="Invoice" />
            <h1>Invoice</h1>
            <pre>{JSON.stringify(props, null, 2)}</pre>
        </>
    );
}
