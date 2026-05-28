import { Head } from '@inertiajs/react';

export default function VendorsIndex(props: Record<string, unknown>) {
    return (
        <>
            <Head title="Vendors" />
            <h1>Vendors</h1>
            <pre>{JSON.stringify(props, null, 2)}</pre>
        </>
    );
}
