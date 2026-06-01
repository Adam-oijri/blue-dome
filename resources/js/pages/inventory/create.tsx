import { Head } from '@inertiajs/react';

import { useDoctorLang } from '@/lib/i18n/doctor-context';

export default function InventoryCreate() {
    const { t } = useDoctorLang();

    return (
        <>
            <Head title={t.add_inventory_item} />
            <h1>{t.add_inventory_item}</h1>
        </>
    );
}
