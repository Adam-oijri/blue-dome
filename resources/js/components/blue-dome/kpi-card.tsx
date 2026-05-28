import { TrendingDown, TrendingUp } from 'lucide-react';
import type { ComponentType } from 'react';

import { cn } from '@/lib/utils';

export type KpiTone = 'navy' | 'olive' | 'warn' | 'success';

const toneStyles: Record<KpiTone, string> = {
    navy: 'bg-navy-50 text-navy-700',
    olive: 'bg-olive-50 text-olive-700',
    warn: 'bg-warning-soft text-warning',
    success: 'bg-success-soft text-success',
};

interface KpiCardProps {
    label: string;
    value: string | number;
    icon?: ComponentType<{ className?: string }>;
    tone?: KpiTone;
    trend?: {
        value: string;
        direction: 'up' | 'down';
    };
    className?: string;
}

export function KpiCard({
    label,
    value,
    icon: Icon,
    tone = 'navy',
    trend,
    className,
}: KpiCardProps) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-xl border border-border bg-card p-5',
                className,
            )}
        >
            {Icon && (
                <span
                    className={cn(
                        'absolute end-4 top-4 grid h-8 w-8 place-items-center rounded-lg',
                        toneStyles[tone],
                    )}
                >
                    <Icon className="size-4" />
                </span>
            )}
            <div className="text-xs font-medium text-muted-foreground">
                {label}
            </div>
            <div className="mt-1.5 text-[28px] font-semibold tracking-tight tabular-nums">
                {value}
            </div>
            {trend && (
                <div
                    className={cn(
                        'mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium',
                        trend.direction === 'up'
                            ? 'text-success'
                            : 'text-danger',
                    )}
                >
                    {trend.direction === 'up' ? (
                        <TrendingUp className="size-3" />
                    ) : (
                        <TrendingDown className="size-3" />
                    )}
                    {trend.value}
                </div>
            )}
        </div>
    );
}
