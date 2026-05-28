import { Head } from '@inertiajs/react';

export default function InventoryShow(props: Record<string, unknown>) {
    return (
        <>
            <Head title="Inventory item" />
            <h1>Inventory item</h1>
            <pre>{JSON.stringify(props, null, 2)}</pre>
        </>
    );
}
