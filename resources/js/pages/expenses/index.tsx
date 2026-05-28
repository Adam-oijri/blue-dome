import { Head } from '@inertiajs/react';

export default function ExpensesIndex(props: Record<string, unknown>) {
    return (
        <>
            <Head title="Expenses" />
            <h1>Expenses</h1>
            <pre>{JSON.stringify(props, null, 2)}</pre>
        </>
    );
}
