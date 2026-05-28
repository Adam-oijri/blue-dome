import AppearanceToggleTab from '@/components/appearance-tabs';
import Heading from '@/components/heading';

interface AppearanceCardProps {
    title?: string;
    description?: string;
}

/**
 * Drop-in appearance switcher for any role's settings dashboard. Persistence
 * is global — flipping here flips the theme everywhere, since the underlying
 * toggle reads/writes the same cookie + localStorage via useAppearance().
 */
export function AppearanceCard({
    title = 'Appearance',
    description = 'Choose how the interface looks. Applies everywhere.',
}: AppearanceCardProps) {
    return (
        <div className="space-y-4">
            <Heading variant="small" title={title} description={description} />
            <AppearanceToggleTab />
        </div>
    );
}
