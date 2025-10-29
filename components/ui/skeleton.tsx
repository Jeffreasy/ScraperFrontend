import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/styles/theme';

// ============================================================================
// SKELETON VARIANTS
// ============================================================================

const skeletonVariants = cva(
  ['animate-pulse rounded-md bg-muted'],
  {
    variants: {
      variant: {
        default: 'bg-muted',
        lighter: 'bg-muted/50',
        darker: 'bg-muted/80',
        shimmer: 'bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-[shimmer_2s_infinite]',
      },
      speed: {
        slow: 'animate-pulse [animation-duration:2s]',
        default: 'animate-pulse',
        fast: 'animate-pulse [animation-duration:0.8s]',
      },
    },
    defaultVariants: {
      variant: 'default',
      speed: 'default',
    },
  }
);

// ============================================================================
// SKELETON COMPONENT
// ============================================================================

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof skeletonVariants> {
  /**
   * Whether to show the pulse animation
   */
  animate?: boolean;
}

function Skeleton({
  className,
  variant,
  speed,
  animate = true,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        skeletonVariants({ variant, speed: animate ? speed : undefined }),
        !animate && 'animate-none',
        className
      )}
      role="status"
      aria-label="Loading..."
      {...props}
    />
  );
}

// ============================================================================
// SKELETON PRESETS
// ============================================================================

/**
 * Circle skeleton (e.g., avatars, icons)
 */
export function SkeletonCircle({
  className,
  size = 'default',
  ...props
}: Omit<SkeletonProps, 'className'> & {
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'xl';
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    default: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <Skeleton
      className={cn('rounded-full', sizeClasses[size], className)}
      {...props}
    />
  );
}

/**
 * Text skeleton (single line)
 */
export function SkeletonText({
  className,
  width = 'full',
  ...props
}: Omit<SkeletonProps, 'className'> & {
  className?: string;
  width?: 'full' | '3/4' | '1/2' | '1/3' | '1/4';
}) {
  const widthClasses = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/3': 'w-1/3',
    '1/4': 'w-1/4',
  };

  return (
    <Skeleton
      className={cn('h-4', widthClasses[width], className)}
      {...props}
    />
  );
}

/**
 * Button skeleton
 */
export function SkeletonButton({
  className,
  size = 'default',
  ...props
}: Omit<SkeletonProps, 'className'> & {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}) {
  const sizeClasses = {
    sm: 'h-9 w-20',
    default: 'h-10 w-24',
    lg: 'h-11 w-28',
  };

  return (
    <Skeleton
      className={cn('rounded-md', sizeClasses[size], className)}
      {...props}
    />
  );
}

/**
 * Image skeleton
 */
export function SkeletonImage({
  className,
  aspectRatio = 'video',
  ...props
}: Omit<SkeletonProps, 'className'> & {
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'wide';
}) {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    wide: 'aspect-[21/9]',
  };

  return (
    <Skeleton
      className={cn('w-full', aspectClasses[aspectRatio], className)}
      {...props}
    />
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export { Skeleton, skeletonVariants };