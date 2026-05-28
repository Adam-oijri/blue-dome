import { Head } from '@inertiajs/react';

export default function InventoryAlerts(props: Record<string, unknown>) {
    return (
        <>
            <Head title="Inventory alerts" />
            <h1>Inventory alerts</h1>
            <pre>{JSON.stringify(props, null, 2)}</pre>
        </>
    );
}
