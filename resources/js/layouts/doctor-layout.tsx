import type { ReactNode } from 'react';

import DoctorLayoutTemplate from '@/layouts/app/doctor-layout';

export default function DoctorLayout({ children }: { children: ReactNode }) {
    return <DoctorLayoutTemplate>{children}</DoctorLayoutTemplate>;
}
