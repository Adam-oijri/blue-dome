import { Head } from '@inertiajs/react';

export default function VendorShow(props: Record<string, unknown>) {
    return (
        <>
            <Head title="Vendor" />
            <h1>Vendor</h1>
            <pre>{JSON.stringify(props, null, 2)}</pre>
        </>
    );
}
