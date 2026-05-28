import { Head } from '@inertiajs/react';

export default function ExpenseEdit(props: Record<string, unknown>) {
    return (
        <>
            <Head title="Edit expense" />
            <h1>Edit expense</h1>
            <pre>{JSON.stringify(props, null, 2)}</pre>
        </>
    );
}
