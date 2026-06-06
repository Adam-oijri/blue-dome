import { home } from '@/routes';
import doctor from '@/routes/doctor';
import secretary from '@/routes/secretary';
import superAdmin from '@/routes/super-admin';

/**
 * URL of the panel a user lands on — each role has its own dashboard; anything
 * else falls back to the public home (landing) page. Frontend counterpart of
 * `User::homeRouteName()`.
 */
export function roleHomeUrl(
    role: string | null | undefined,
    locale: string,
): string {
    switch (role) {
        case 'doctor':
            return doctor.dashboard.url({ locale });
        case 'secretary':
            return secretary.dashboard.url({ locale });
        case 'super_admin':
            return superAdmin.dashboard.url({ locale });
        default:
            return home.url({ locale });
    }
}
