import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/styles/theme';

// ============================================================================
// BADGE VARIANTS
// ============================================================================

const badgeVariants = cva(
    [
        'inline-flex items-center rounded-full border font-semibold',
        'transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    ],
    {
        variants: {
            variant: {
                default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
                secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
                destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
                success: 'border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800',
                warning: 'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800',
                info: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800',
                outline: 'text-foreground border-input hover:bg-accent hover:text-accent-foreground',
                ghost: 'border-transparent hover:bg-accent hover:text-accent-foreground',
            },
            size: {
                sm: 'px-2 py-0.5 text-xs',
                default: 'px-2.5 py-0.5 text-xs',
                lg: 'px-3 py-1 text-sm',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

// ============================================================================
// BADGE COMPONENT
// ============================================================================

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
    /**
     * Optional icon to display before badge text
     */
    icon?: React.ReactNode;
    /**
     * Whether the badge is clickable/interactive
     */
    interactive?: boolean;
    /**
     * Optional close button handler
     */
    onRemove?: () => void;
    /**
     * Optional click handler for interactive badges
     */
    onClick?: (e: React.MouseEvent) => void;
}

function Badge({
    className,
    variant,
    size,
    icon,
    interactive,
    onRemove,
    onClick,
    children,
    ...props
}: BadgeProps) {
    if (interactive) {
        return (
            <button
                type="button"
                className={cn(
                    badgeVariants({ variant, size }),
                    'cursor-pointer active:scale-95',
                    className
                )}
                onClick={onClick}
                {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
            >
                {icon && <span className="mr-1 -ml-0.5">{icon}</span>}
                {children}
                {onRemove && (
                    <span
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                        className="ml-1 -mr-0.5 inline-flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5 transition-colors"
                        role="button"
                        aria-label="Remove"
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 15 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                        >
                            <path
                                d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                                fill="currentColor"
                                fillRule="evenodd"
                                clipRule="evenodd"
                            />
                        </svg>
                    </span>
                )}
            </button>
        );
    }

    return (
        <div
            className={cn(badgeVariants({ variant, size }), className)}
            {...props}
        >
            {icon && <span className="mr-1 -ml-0.5">{icon}</span>}
            {children}
            {onRemove && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="ml-1 -mr-0.5 inline-flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5 transition-colors"
                    aria-label="Remove"
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                    >
                        <path
                            d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
            )}
        </div>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

export { Badge, badgeVariants };