import { useCallback, useMemo, useState } from 'react';

/**
 * Page-scoped multi-row selection for data tables. The selection is cleared by
 * the caller whenever filters change, since IDs that scrolled out of the
 * filtered set must not stay selected.
 */
export function useRowSelection(pageIds: string[]) {
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const toggle = useCallback((id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });
    }, []);

    const clear = useCallback(() => setSelected(new Set()), []);

    const allSelected =
        pageIds.length > 0 && pageIds.every((id) => selected.has(id));
    const someSelected = pageIds.some((id) => selected.has(id)) && !allSelected;

    const toggleAll = useCallback(() => {
        setSelected((prev) => {
            const next = new Set(prev);
            const everyOnPage =
                pageIds.length > 0 && pageIds.every((id) => next.has(id));

            if (everyOnPage) {
                pageIds.forEach((id) => next.delete(id));
            } else {
                pageIds.forEach((id) => next.add(id));
            }

            return next;
        });
    }, [pageIds]);

    const ids = useMemo(() => Array.from(selected), [selected]);

    return {
        ids,
        count: selected.size,
        has: (id: string) => selected.has(id),
        toggle,
        toggleAll,
        clear,
        allSelected,
        someSelected,
    };
}
