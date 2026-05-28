import type { ReactNode } from 'react';

import SuperAdminLayoutTemplate from '@/layouts/app/super-admin-layout';

export default function SuperAdminLayout({
    children,
}: {
    children: ReactNode;
}) {
    return <SuperAdminLayoutTemplate>{children}</SuperAdminLayoutTemplate>;
}
