import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn, inputStyles, focusEffects, transitions } from '@/lib/styles/theme';

// ============================================================================
// INPUT VARIANTS
// ============================================================================

const inputVariants = cva(
  [
    'flex w-full rounded-md border bg-background',
    'ring-offset-background',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'placeholder:text-muted-foreground',
    focusEffects.ring,
    'disabled:cursor-not-allowed disabled:opacity-50',
    transitions.colors,
  ],
  {
    variants: {
      variant: {
        default: 'border-input',
        error: 'border-destructive focus-visible:ring-destructive',
        success: 'border-green-500 focus-visible:ring-green-500',
        ghost: 'border-transparent bg-transparent',
      },
      size: {
        sm: 'h-9 px-3 py-2 text-xs',
        default: 'h-10 px-3 py-2 text-sm',
        lg: 'h-11 px-4 py-2 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// ============================================================================
// INPUT COMPONENT
// ============================================================================

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
  VariantProps<typeof inputVariants> {
  /**
   * Icon to display on the left side
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon to display on the right side
   */
  rightIcon?: React.ReactNode;
  /**
   * Error message to display below input
   */
  error?: string;
  /**
   * Success message to display below input
   */
  success?: string;
  /**
   * Helper text to display below input
   */
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      variant,
      size,
      leftIcon,
      rightIcon,
      error,
      success,
      helperText,
      ...props
    },
    ref
  ) => {
    const effectiveVariant = error ? 'error' : success ? 'success' : variant;
    const hasIcons = leftIcon || rightIcon;

    if (hasIcons) {
      return (
        <div className="w-full">
          <div className="relative">
            {leftIcon && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                {leftIcon}
              </div>
            )}
            <input
              type={type}
              className={cn(
                inputVariants({ variant: effectiveVariant, size }),
                leftIcon && 'pl-10',
                rightIcon && 'pr-10',
                className
              )}
              ref={ref}
              {...props}
            />
            {rightIcon && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                {rightIcon}
              </div>
            )}
          </div>
          {(error || success || helperText) && (
            <InputHelperText error={error} success={success} helperText={helperText} />
          )}
        </div>
      );
    }

    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(inputVariants({ variant: effectiveVariant, size }), className)}
          ref={ref}
          {...props}
        />
        {(error || success || helperText) && (
          <InputHelperText error={error} success={success} helperText={helperText} />
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ============================================================================
// INPUT HELPER TEXT
// ============================================================================

interface InputHelperTextProps {
  error?: string;
  success?: string;
  helperText?: string;
}

function InputHelperText({ error, success, helperText }: InputHelperTextProps) {
  if (error) {
    return (
      <p className="mt-1.5 text-xs text-destructive" role="alert">
        {error}
      </p>
    );
  }

  if (success) {
    return (
      <p className="mt-1.5 text-xs text-green-600 dark:text-green-400">
        {success}
      </p>
    );
  }

  if (helperText) {
    return (
      <p className="mt-1.5 text-xs text-muted-foreground">
        {helperText}
      </p>
    );
  }

  return null;
}

// ============================================================================
// INPUT GROUP COMPONENT
// ============================================================================

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Label for the input
   */
  label?: string;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Error message
   */
  error?: string;
  /**
   * Helper text
   */
  helperText?: string;
}

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, label, required, error, helperText, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        {children}
        {(error || helperText) && <InputHelperText error={error} helperText={helperText} />}
      </div>
    );
  }
);
InputGroup.displayName = 'InputGroup';

// ============================================================================
// TEXTAREA COMPONENT
// ============================================================================

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  Omit<VariantProps<typeof inputVariants>, 'size'> {
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Resize behavior
   */
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, error, resize = 'vertical', ...props }, ref) => {
    const effectiveVariant = error ? 'error' : variant;
    const resizeClass = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    return (
      <div className="w-full">
        <textarea
          className={cn(
            inputVariants({ variant: effectiveVariant }),
            'min-h-[80px]',
            resizeClass[resize],
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <InputHelperText error={error} />}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// ============================================================================
// EXPORTS
// ============================================================================

export { Input, InputGroup, Textarea, inputVariants };