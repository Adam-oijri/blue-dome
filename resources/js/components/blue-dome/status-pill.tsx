import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type StatusTone =
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'olive'
    | 'navy'
    | 'neutral';

const toneStyles: Record<StatusTone, string> = {
    success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning',
    danger: 'bg-danger-soft text-danger',
    info: 'bg-info-soft text-info',
    olive: 'bg-olive-100 text-olive-700',
    navy: 'bg-navy-100 text-navy-800',
    neutral: 'bg-muted text-muted-foreground',
};

interface StatusPillProps {
    tone?: StatusTone;
    children: ReactNode;
    withDot?: boolean;
    className?: string;
}

export function StatusPill({
    tone = 'neutral',
    children,
    withDot = false,
    className,
}: StatusPillProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-px text-[11px] leading-5 font-medium tracking-tight',
                toneStyles[tone],
                className,
            )}
        >
            {withDot && (
                <span
                    className="size-1.5 rounded-full bg-current"
                    aria-hidden
                />
            )}
            {children}
        </span>
    );
}
