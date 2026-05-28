import { Head } from '@inertiajs/react';

export default function DocumentShow(props: Record<string, unknown>) {
    return (
        <>
            <Head title="Document" />
            <h1>Document</h1>
            <pre>{JSON.stringify(props, null, 2)}</pre>
        </>
    );
}
