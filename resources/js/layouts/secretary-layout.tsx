import type { ReactNode } from 'react';

import SecretaryLayoutTemplate from '@/layouts/app/secretary-layout';

export default function SecretaryLayout({ children }: { children: ReactNode }) {
    return <SecretaryLayoutTemplate>{children}</SecretaryLayoutTemplate>;
}
