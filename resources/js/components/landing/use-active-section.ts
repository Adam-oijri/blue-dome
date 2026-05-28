import { useEffect, useState } from 'react';

export function useActiveSection(ids: string[]): string | null {
    const [active, setActive] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const elements = ids
            .map((id) => document.getElementById(id))
            .filter((el): el is HTMLElement => el !== null);

        if (elements.length === 0) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                if (visible[0]) {
                    setActive(visible[0].target.id);
                }
            },
            { rootMargin: '-30% 0px -50% 0px', threshold: [0.1, 0.3, 0.6] },
        );

        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [ids]);

    return active;
}
