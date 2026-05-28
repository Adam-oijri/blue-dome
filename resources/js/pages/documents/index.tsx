import { Head } from '@inertiajs/react';

export default function DocumentsIndex(props: Record<string, unknown>) {
    return (
        <>
            <Head title="Documents" />
            <h1>Documents</h1>
            <pre>{JSON.stringify(props, null, 2)}</pre>
        </>
    );
}
