import { cn } from '@/lib/utils';

interface BrandIconMarkProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeStyles = {
    sm: 'size-7 rounded-md',
    md: 'size-8 rounded-lg',
    lg: 'size-10 rounded-lg',
};

export function BrandIconMark({ size = 'md', className }: BrandIconMarkProps) {
    return (
        <span
            className={cn(
                'grid place-items-center bg-gradient-to-br from-olive-500 to-olive-700 text-white',
                sizeStyles[size],
                className,
            )}
            aria-hidden
        >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={
                    size === 'sm'
                        ? 'size-4'
                        : size === 'md'
                          ? 'size-[18px]'
                          : 'size-5'
                }
            >
                <path d="M3 14a9 9 0 0 1 18 0" />
                <path d="M3 14h18" />
                <path d="M12 5v9" />
                <path d="M7 9.5a5 5 0 0 1 10 0" />
            </svg>
        </span>
    );
}
