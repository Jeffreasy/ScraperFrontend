/**
 * Centralized Theme Configuration
 * 
 * Dit bestand bevat alle styling configuraties, tokens en utilities
 * die consistent gebruikt worden door de hele applicatie.
 */

// ============================================================================
// COLOR TOKENS
// ============================================================================

/**
 * Nieuwsbron specifieke kleuren
 * Gebruikt voor badges en identificatie
 */
export const sourceColors = {
    'nu.nl': {
        light: 'bg-blue-100 text-blue-800',
        dark: 'dark:bg-blue-900 dark:text-blue-300',
        full: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    },
    'ad.nl': {
        light: 'bg-green-100 text-green-800',
        dark: 'dark:bg-green-900 dark:text-green-300',
        full: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    },
    'nos.nl': {
        light: 'bg-purple-100 text-purple-800',
        dark: 'dark:bg-purple-900 dark:text-purple-300',
        full: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    },
    'telegraaf.nl': {
        light: 'bg-red-100 text-red-800',
        dark: 'dark:bg-red-900 dark:text-red-300',
        full: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    },
    'volkskrant.nl': {
        light: 'bg-yellow-100 text-yellow-800',
        dark: 'dark:bg-yellow-900 dark:text-yellow-300',
        full: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    },
    default: {
        light: 'bg-gray-100 text-gray-800',
        dark: 'dark:bg-gray-800 dark:text-gray-300',
        full: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    },
} as const;

/**
 * Categorie iconen
 * Emoji iconen voor visuele categorie herkenning
 */
export const categoryIcons = {
    sport: '⚽',
    nieuws: '📰',
    economie: '💼',
    tech: '💻',
    entertainment: '🎬',
    politiek: '🏛️',
    weer: '🌤️',
    cultuur: '🎨',
    gezondheid: '🏥',
    wetenschap: '🔬',
    default: '📄',
} as const;

// ============================================================================
// SPACING TOKENS
// ============================================================================

/**
 * Standaard spacing scale (4px grid system)
 */
export const spacing = {
    xs: 'space-y-2',    // 8px
    sm: 'space-y-3',    // 12px
    md: 'space-y-4',    // 16px
    lg: 'space-y-6',    // 24px
    xl: 'space-y-8',    // 32px
    '2xl': 'space-y-12', // 48px
} as const;

/**
 * Gap utilities voor flex/grid
 */
export const gap = {
    xs: 'gap-2',    // 8px
    sm: 'gap-3',    // 12px
    md: 'gap-4',    // 16px
    lg: 'gap-6',    // 24px
    xl: 'gap-8',    // 32px
} as const;

/**
 * Padding presets
 */
export const padding = {
    sm: 'p-3',      // 12px
    md: 'p-4',      // 16px
    lg: 'p-6',      // 24px
    xl: 'p-8',      // 32px
    card: 'p-6',    // Standard card padding
    section: 'py-8', // Section padding
} as const;

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

/**
 * Heading styles
 */
export const headings = {
    h1: 'text-4xl font-bold',
    h2: 'text-3xl font-bold',
    h3: 'text-2xl font-semibold',
    h4: 'text-xl font-semibold',
    h5: 'text-lg font-medium',
    h6: 'text-base font-medium',
} as const;

/**
 * Body text styles
 */
export const bodyText = {
    large: 'text-lg',
    base: 'text-base',
    small: 'text-sm',
    xs: 'text-xs',
} as const;

// ============================================================================
// COMPONENT STYLES
// ============================================================================

/**
 * Card varianten
 */
export const cardStyles = {
    base: 'rounded-lg border bg-card text-card-foreground shadow-sm',
    hover: 'hover:shadow-lg transition-shadow duration-200',
    interactive: 'hover:shadow-lg transition-shadow duration-200 cursor-pointer',
    elevated: 'shadow-md hover:shadow-xl transition-shadow duration-200',
} as const;

/**
 * Button varianten (base styles, extend met variants)
 */
export const buttonStyles = {
    base: 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
    sizes: {
        sm: 'h-9 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-8',
    },
    variants: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    },
} as const;

/**
 * Badge styles
 */
export const badgeStyles = {
    base: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
    variants: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        outline: 'border border-input',
        destructive: 'bg-destructive text-destructive-foreground',
    },
} as const;

/**
 * Input styles
 */
export const inputStyles = {
    base: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
    focus: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    disabled: 'disabled:cursor-not-allowed disabled:opacity-50',
    placeholder: 'placeholder:text-muted-foreground',
} as const;

// ============================================================================
// LAYOUT PATTERNS
// ============================================================================

/**
 * Container varianten
 */
export const containers = {
    page: 'container mx-auto px-4 py-8',
    section: 'container mx-auto px-4',
    narrow: 'max-w-2xl mx-auto px-4',
    wide: 'max-w-7xl mx-auto px-4',
    full: 'w-full px-4',
} as const;

/**
 * Grid layouts
 */
export const gridLayouts = {
    responsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    auto: 'grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))]',
    sidebar: 'grid grid-cols-1 md:grid-cols-[1fr_300px]',
    twoColumn: 'grid grid-cols-1 md:grid-cols-2',
    threeColumn: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    fourColumn: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
} as const;

/**
 * Flex patterns
 */
export const flexPatterns = {
    between: 'flex items-center justify-between',
    center: 'flex items-center justify-center',
    start: 'flex items-center justify-start',
    end: 'flex items-center justify-end',
    column: 'flex flex-col',
    wrap: 'flex flex-wrap',
} as const;

// ============================================================================
// RESPONSIVE UTILITIES
// ============================================================================

/**
 * Breakpoint helpers
 */
export const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
} as const;

/**
 * Responsive display utilities
 */
export const responsive = {
    mobileOnly: 'block md:hidden',
    tabletUp: 'hidden md:block',
    desktopUp: 'hidden lg:block',
    mobileTablet: 'block lg:hidden',
} as const;

// ============================================================================
// ANIMATION PRESETS
// ============================================================================

/**
 * Transition presets
 */
export const transitions = {
    fast: 'transition-all duration-150',
    base: 'transition-all duration-200',
    slow: 'transition-all duration-300',
    colors: 'transition-colors duration-150',
    transform: 'transition-transform duration-200',
    opacity: 'transition-opacity duration-200',
    shadow: 'transition-shadow duration-200',
} as const;

/**
 * Hover effects
 */
export const hoverEffects = {
    lift: 'hover:scale-105 transition-transform duration-200',
    shadow: 'hover:shadow-lg transition-shadow duration-200',
    brightness: 'hover:brightness-110 transition-all duration-200',
    opacity: 'hover:opacity-80 transition-opacity duration-150',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get source color voor een specifieke bron
 */
export function getSourceColor(source: string): string {
    const normalizedSource = source.toLowerCase();
    return sourceColors[normalizedSource as keyof typeof sourceColors]?.full || sourceColors.default.full;
}

/**
 * Get category icon voor een specifieke categorie
 */
export function getCategoryIcon(category: string): string {
    const normalizedCategory = category.toLowerCase();
    return categoryIcons[normalizedCategory as keyof typeof categoryIcons] || categoryIcons.default;
}

/**
 * Combine class names utility (alias voor cn from utils)
 */
export { cn } from '@/lib/utils';

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type SourceColor = keyof typeof sourceColors;
export type CategoryIcon = keyof typeof categoryIcons;
export type SpacingSize = keyof typeof spacing;
export type ButtonVariant = keyof typeof buttonStyles.variants;
export type ButtonSize = keyof typeof buttonStyles.sizes;
export type BadgeVariant = keyof typeof badgeStyles.variants;