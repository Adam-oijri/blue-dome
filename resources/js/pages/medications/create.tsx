import { Head } from '@inertiajs/react';

import { useDoctorLang } from '@/lib/i18n/doctor-context';

export default function MedicationCreate() {
    const { t } = useDoctorLang();

    return (
        <>
            <Head title={t.add_medication_page} />
            <h1>{t.add_medication_page}</h1>
        </>
    );
}
