import { Head } from '@inertiajs/react';

export default function PrescriptionsIndex(props: Record<string, unknown>) {
    return (
        <>
            <Head title="Prescriptions" />
            <h1>Prescriptions</h1>
            <pre>{JSON.stringify(props, null, 2)}</pre>
        </>
    );
}
