import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/styles/theme';

// ============================================================================
// CARD VARIANTS
// ============================================================================

const cardVariants = cva(
  ['rounded-lg border bg-card text-card-foreground', 'transition-all duration-200'],
  {
    variants: {
      variant: {
        default: 'shadow-sm',
        elevated: 'shadow-md',
        flat: 'shadow-none',
        bordered: 'shadow-none border-2',
      },
      hover: {
        none: '',
        lift: 'hover:shadow-lg cursor-pointer',
        scale: 'hover:scale-[1.02] cursor-pointer',
        glow: 'hover:shadow-lg hover:shadow-primary/20 cursor-pointer',
        border: 'hover:border-primary cursor-pointer',
      },
      padding: {
        none: '',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      hover: 'none',
      padding: 'none',
    },
  }
);

const cardHeaderVariants = cva(['flex flex-col'], {
  variants: {
    spacing: {
      none: '',
      sm: 'space-y-1',
      default: 'space-y-1.5',
      lg: 'space-y-2',
    },
    padding: {
      none: '',
      sm: 'p-4',
      default: 'p-6',
      lg: 'p-8',
    },
  },
  defaultVariants: {
    spacing: 'default',
    padding: 'default',
  },
});

const cardTitleVariants = cva(['font-semibold leading-none tracking-tight'], {
  variants: {
    size: {
      sm: 'text-lg',
      default: 'text-2xl',
      lg: 'text-3xl',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

// ============================================================================
// CARD COMPONENT
// ============================================================================

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof cardVariants> {
  /**
   * Makes the card interactive/clickable
   */
  interactive?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hover, padding, interactive, onClick, ...props }, ref) => {
    const effectiveHover = interactive && hover === 'none' ? 'lift' : hover;

    if (interactive || onClick) {
      return (
        <button
          type="button"
          ref={ref as any}
          className={cn(cardVariants({ variant, hover: effectiveHover, padding }), className)}
          onClick={onClick as any}
          {...(props as any)}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, hover: effectiveHover, padding }), className)}
        onClick={onClick}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

// ============================================================================
// CARD HEADER
// ============================================================================

export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof cardHeaderVariants> { }

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, spacing, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardHeaderVariants({ spacing, padding }), className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

// ============================================================================
// CARD TITLE
// ============================================================================

export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
  VariantProps<typeof cardTitleVariants> {
  /**
   * Heading level for semantic HTML
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, size, as: Component = 'h3', children, ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(cardTitleVariants({ size }), className)}
      {...props}
    >
      {children}
    </Component>
  )
);
CardTitle.displayName = 'CardTitle';

// ============================================================================
// CARD DESCRIPTION
// ============================================================================

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

// ============================================================================
// CARD CONTENT
// ============================================================================

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Custom padding (overrides default)
   */
  noPadding?: boolean;
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, noPadding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(!noPadding && 'p-6 pt-0', className)}
      {...props}
    />
  )
);
CardContent.displayName = 'CardContent';

// ============================================================================
// CARD FOOTER
// ============================================================================

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Custom padding (overrides default)
   */
  noPadding?: boolean;
  /**
   * Alignment of footer content
   */
  align?: 'start' | 'center' | 'end' | 'between';
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, noPadding, align = 'start', ...props }, ref) => {
    const alignmentClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          !noPadding && 'p-6 pt-0',
          alignmentClasses[align],
          className
        )}
        {...props}
      />
    );
  }
);
CardFooter.displayName = 'CardFooter';

// ============================================================================
// EXPORTS
// ============================================================================

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
  cardHeaderVariants,
  cardTitleVariants,
};