import { Head } from '@inertiajs/react';

export default function ExpenseShow(props: Record<string, unknown>) {
    return (
        <>
            <Head title="Expense" />
            <h1>Expense</h1>
            <pre>{JSON.stringify(props, null, 2)}</pre>
        </>
    );
}
