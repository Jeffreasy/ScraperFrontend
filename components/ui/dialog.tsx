'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn, transitions, focusEffects, bodyText, spacing } from '@/lib/styles/theme';

// ============================================================================
// DIALOG VARIANTS
// ============================================================================

const dialogOverlayVariants = cva(
    [
        'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    ],
    {
        variants: {
            blur: {
                none: 'backdrop-blur-none',
                sm: 'backdrop-blur-sm',
                md: 'backdrop-blur-md',
                lg: 'backdrop-blur-lg',
            },
        },
        defaultVariants: {
            blur: 'sm',
        },
    }
);

const dialogContentVariants = cva(
    [
        'fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%]',
        'border bg-background shadow-lg duration-200',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
        'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
        'sm:rounded-lg',
    ],
    {
        variants: {
            size: {
                sm: 'max-w-sm',
                default: 'max-w-lg',
                lg: 'max-w-2xl',
                xl: 'max-w-4xl',
                '2xl': 'max-w-6xl',
                full: 'max-w-[95vw]',
            },
            padding: {
                none: '',
                sm: 'p-4',
                default: 'p-6',
                lg: 'p-8',
            },
        },
        defaultVariants: {
            size: 'default',
            padding: 'default',
        },
    }
);

const dialogHeaderVariants = cva(
    ['flex flex-col'],
    {
        variants: {
            align: {
                left: 'text-left',
                center: 'text-center sm:text-left',
                right: 'text-right',
            },
            spacing: {
                sm: 'space-y-1',
                default: 'space-y-1.5',
                lg: 'space-y-2',
            },
        },
        defaultVariants: {
            align: 'center',
            spacing: 'default',
        },
    }
);

const dialogFooterVariants = cva(
    ['flex'],
    {
        variants: {
            direction: {
                row: 'flex-row gap-2',
                column: 'flex-col-reverse gap-2',
                responsive: 'flex-col-reverse sm:flex-row sm:gap-2',
            },
            align: {
                start: 'justify-start',
                center: 'justify-center',
                end: 'justify-end sm:justify-end',
                between: 'justify-between',
            },
        },
        defaultVariants: {
            direction: 'responsive',
            align: 'end',
        },
    }
);

// ============================================================================
// DIALOG PRIMITIVES
// ============================================================================

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

// ============================================================================
// DIALOG OVERLAY
// ============================================================================

const DialogOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> &
    VariantProps<typeof dialogOverlayVariants>
>(({ className, blur, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(dialogOverlayVariants({ blur }), className)}
        {...props}
    />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// ============================================================================
// DIALOG CONTENT
// ============================================================================

export interface DialogContentProps
    extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogContentVariants> {
    /**
     * Whether to show the close button
     */
    showClose?: boolean;
    /**
     * Custom overlay blur level
     */
    overlayBlur?: VariantProps<typeof dialogOverlayVariants>['blur'];
}

const DialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    DialogContentProps
>(({ className, size, padding, showClose = true, overlayBlur, children, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay blur={overlayBlur} />
        <DialogPrimitive.Content
            ref={ref}
            className={cn(dialogContentVariants({ size, padding }), className)}
            {...props}
        >
            {children}
            {showClose && (
                <DialogPrimitive.Close
                    className={cn(
                        'absolute right-4 top-4 rounded-sm p-1',
                        'opacity-70 ring-offset-background',
                        transitions.opacity,
                        'hover:opacity-100',
                        focusEffects.ring,
                        'disabled:pointer-events-none',
                        'data-[state=open]:bg-accent data-[state=open]:text-muted-foreground'
                    )}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Sluiten</span>
                </DialogPrimitive.Close>
            )}
        </DialogPrimitive.Content>
    </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

// ============================================================================
// DIALOG HEADER
// ============================================================================

export interface DialogHeaderProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dialogHeaderVariants> { }

const DialogHeader = ({ className, align, spacing, ...props }: DialogHeaderProps) => (
    <div className={cn(dialogHeaderVariants({ align, spacing }), className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

// ============================================================================
// DIALOG FOOTER
// ============================================================================

export interface DialogFooterProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dialogFooterVariants> { }

const DialogFooter = ({ className, direction, align, ...props }: DialogFooterProps) => (
    <div className={cn(dialogFooterVariants({ direction, align }), className)} {...props} />
);
DialogFooter.displayName = 'DialogFooter';

// ============================================================================
// DIALOG TITLE
// ============================================================================

const DialogTitle = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn('text-lg font-semibold leading-none tracking-tight', className)}
        {...props}
    />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

// ============================================================================
// DIALOG DESCRIPTION
// ============================================================================

const DialogDescription = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={cn(bodyText.small, 'text-muted-foreground', className)}
        {...props}
    />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// ============================================================================
// EXPORTS
// ============================================================================

export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogClose,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
    dialogOverlayVariants,
    dialogContentVariants,
    dialogHeaderVariants,
    dialogFooterVariants,
};