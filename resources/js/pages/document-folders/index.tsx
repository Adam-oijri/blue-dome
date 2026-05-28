import { Head } from '@inertiajs/react';

export default function DocumentFoldersIndex(props: Record<string, unknown>) {
    return (
        <>
            <Head title="Folders" />
            <h1>Folders</h1>
            <pre>{JSON.stringify(props, null, 2)}</pre>
        </>
    );
}
