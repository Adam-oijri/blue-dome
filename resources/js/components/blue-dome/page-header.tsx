import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface PageHeaderProps {
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    className?: string;
}

export function PageHeader({
    title,
    description,
    actions,
    className,
}: PageHeaderProps) {
    return (
        <div
            className={cn(
                'mb-6 flex flex-wrap items-end justify-between gap-4',
                className,
            )}
        >
            <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight">
                    {title}
                </h1>
                {description && (
                    <p className="mt-1 text-[13px] text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-3">{actions}</div>
            )}
        </div>
    );
}
