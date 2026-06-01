import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export interface BulkAction {
    label: string;
    onClick: () => void;
    destructive?: boolean;
}

export function BulkActionBar({
    count,
    onClear,
    actions,
}: {
    count: number;
    onClear: () => void;
    actions: BulkAction[];
}) {
    const [pending, setPending] = useState<BulkAction | null>(null);

    if (count === 0) {
        return null;
    }

    return (
        <>
            <div className="fixed inset-x-0 bottom-6 z-50 mx-auto flex w-fit items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-lg">
                <span className="px-1 text-[13px] font-semibold">
                    {count} selected
                </span>
                <div className="h-4 w-px bg-border" />
                {actions.map((action) => (
                    <Button
                        key={action.label}
                        variant="ghost"
                        size="sm"
                        className={
                            action.destructive
                                ? 'text-danger hover:text-danger'
                                : undefined
                        }
                        onClick={() =>
                            action.destructive
                                ? setPending(action)
                                : action.onClick()
                        }
                    >
                        {action.label}
                    </Button>
                ))}
                <div className="h-4 w-px bg-border" />
                <Button variant="ghost" size="sm" onClick={onClear}>
                    Clear
                </Button>
            </div>

            <Dialog
                open={pending !== null}
                onOpenChange={(open) => !open && setPending(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm bulk action</DialogTitle>
                        <DialogDescription>
                            Apply &ldquo;{pending?.label}&rdquo; to {count}{' '}
                            selected item(s)? This cannot be undone in bulk.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setPending(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-danger text-white hover:bg-danger/90"
                            onClick={() => {
                                pending?.onClick();
                                setPending(null);
                            }}
                        >
                            {pending?.label}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
