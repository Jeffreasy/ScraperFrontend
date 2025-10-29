'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Users, Building, MapPin } from 'lucide-react';
import {
    cn,
    flexPatterns,
    transitions,
    bodyText,
    gap,
    focusEffects,
} from '@/lib/styles/theme';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface EntityChipProps {
    name: string;
    type: 'persons' | 'organizations' | 'locations';
    onClick?: () => void;
    count?: number;
}

type EntityType = 'persons' | 'organizations' | 'locations';

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const entityChipVariants = cva(
    [
        'inline-flex items-center gap-1 rounded-md px-2 py-1',
        bodyText.xs,
        'font-medium border',
        transitions.base,
    ],
    {
        variants: {
            type: {
                persons: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900/50',
                organizations: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-300 dark:border-purple-700 hover:bg-purple-200 dark:hover:bg-purple-900/50',
                locations: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900/50',
            },
            interactive: {
                true: 'cursor-pointer hover:scale-105 hover:shadow-md active:scale-95',
                false: '',
            },
        },
        defaultVariants: {
            interactive: false,
        },
    }
);

// ============================================================================
// CONFIGURATION
// ============================================================================

const entityConfig = {
    persons: {
        icon: Users,
        emoji: '👤',
        label: 'Person',
    },
    organizations: {
        icon: Building,
        emoji: '🏢',
        label: 'Organization',
    },
    locations: {
        icon: MapPin,
        emoji: '📍',
        label: 'Location',
    },
} as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EntityChip({ name, type, onClick, count }: EntityChipProps) {
    const config = entityConfig[type];
    const Icon = config.icon;
    const Component = onClick ? 'button' : 'span';

    return (
        <Component
            className={cn(
                entityChipVariants({ type, interactive: !!onClick }),
                onClick && focusEffects.ring
            )}
            onClick={onClick}
            onKeyPress={onClick ? (e: any) => e.key === 'Enter' && onClick() : undefined}
            tabIndex={onClick ? 0 : undefined}
            aria-label={`${config.label}: ${name}${count ? ` (${count} articles)` : ''}`}
            title={count ? `${count} articles over ${name}` : undefined}
            {...(onClick && { type: 'button' })}
        >
            <span role="img" aria-hidden="true" className="text-sm">
                {config.emoji}
            </span>
            <span>{name}</span>
            {count && count > 1 && (
                <span className="ml-0.5 opacity-75 text-[10px] font-semibold">({count})</span>
            )}
        </Component>
    );
}

// ============================================================================
// ICON VARIANT
// ============================================================================

/**
 * Icon-only variant for compact displays
 */
export function EntityIcon({ type, size = 'default' }: { type: EntityType; size?: 'sm' | 'default' | 'lg' }) {
    const Icon = entityConfig[type].icon;
    const sizeClasses = {
        sm: 'h-3 w-3',
        default: 'h-4 w-4',
        lg: 'h-5 w-5',
    };

    return <Icon className={cn(sizeClasses[size], 'text-muted-foreground')} />;
}

// ============================================================================
// EXPORTS
// ============================================================================

export { entityChipVariants, entityConfig };
export type { EntityChipProps, EntityType };