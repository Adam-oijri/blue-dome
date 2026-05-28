import { Head } from '@inertiajs/react';

export default function VendorEdit(props: Record<string, unknown>) {
    return (
        <>
            <Head title="Edit vendor" />
            <h1>Edit vendor</h1>
            <pre>{JSON.stringify(props, null, 2)}</pre>
        </>
    );
}
