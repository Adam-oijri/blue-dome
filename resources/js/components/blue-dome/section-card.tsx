import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface SectionCardProps {
    title?: ReactNode;
    titleIcon?: ReactNode;
    actions?: ReactNode;
    children: ReactNode;
    className?: string;
    bodyClassName?: string;
}

export function SectionCard({
    title,
    titleIcon,
    actions,
    children,
    className,
    bodyClassName,
}: SectionCardProps) {
    return (
        <div
            className={cn(
                'overflow-hidden rounded-xl border border-border bg-card shadow-xs',
                className,
            )}
        >
            {(title || actions) && (
                <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                    {title && (
                        <h2 className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
                            {titleIcon}
                            {title}
                        </h2>
                    )}
                    {actions && (
                        <div className="flex items-center gap-3">{actions}</div>
                    )}
                </div>
            )}
            <div className={cn('px-5 py-4', bodyClassName)}>{children}</div>
        </div>
    );
}
