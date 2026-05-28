import { Head } from '@inertiajs/react';

export default function InventoryEdit(props: Record<string, unknown>) {
    return (
        <>
            <Head title="Edit inventory item" />
            <h1>Edit inventory item</h1>
            <pre>{JSON.stringify(props, null, 2)}</pre>
        </>
    );
}
