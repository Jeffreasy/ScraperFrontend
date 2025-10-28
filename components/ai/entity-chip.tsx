'use client';

interface EntityChipProps {
    name: string;
    type: 'persons' | 'organizations' | 'locations';
    onClick?: () => void;
    count?: number; // Optional: number of articles with this entity
}

export function EntityChip({ name, type, onClick, count }: EntityChipProps) {
    const icons = {
        persons: '👤',
        organizations: '🏢',
        locations: '📍'
    };

    const colors = {
        persons: 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 border-blue-300 dark:border-blue-700',
        organizations: 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50 border-purple-300 dark:border-purple-700',
        locations: 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50 border-amber-300 dark:border-amber-700'
    };

    const ariaLabels = {
        persons: 'Person',
        organizations: 'Organization',
        locations: 'Location'
    };

    const Component = onClick ? 'button' : 'span';

    return (
        <Component
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all border ${colors[type]} ${onClick ? 'cursor-pointer hover:scale-105 hover:shadow-md active:scale-95' : ''
                }`}
            onClick={onClick}
            onKeyPress={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
            tabIndex={onClick ? 0 : undefined}
            aria-label={`${ariaLabels[type]}: ${name}${count ? ` (${count} articles)` : ''}`}
            title={count ? `${count} articles over ${name}` : undefined}
        >
            <span role="img" aria-hidden="true">{icons[type]}</span>
            <span>{name}</span>
            {count && count > 1 && (
                <span className="ml-0.5 opacity-75 text-[10px] font-semibold">
                    ({count})
                </span>
            )}
        </Component>
    );
}