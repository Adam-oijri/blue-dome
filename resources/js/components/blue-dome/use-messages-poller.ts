import { router } from '@inertiajs/react';
import { useEffect } from 'react';

/**
 * Keeps the sidebar unread-messages badge fresh without navigation by doing a
 * lightweight partial reload of the shared `messages` prop on a slow interval.
 * Mounted from the doctor/secretary sidebars (persistent layout components), so
 * it runs panel-wide on every page. The open chat thread polls far more
 * aggressively on its own; this is just the ambient badge tick.
 */
export function useMessagesPoller(intervalMs = 20000): void {
    useEffect(() => {
        const id = window.setInterval(() => {
            router.reload({ only: ['messages'] });
        }, intervalMs);

        return () => window.clearInterval(id);
    }, [intervalMs]);
}
