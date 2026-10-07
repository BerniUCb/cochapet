import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[18px] [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-hover active:bg-primary-hover shadow-sm",
        outline: "border border-line bg-surface text-ink hover:bg-surface-alt",
        secondary: "bg-surface-alt text-ink hover:bg-[#E3E8F7]",
        ghost: "text-ink hover:bg-surface-alt",
        success: "bg-success-strong text-white hover:bg-[#065F46]",
        destructive: "bg-error text-white hover:bg-[#8F1414]",
        link: "text-primary underline-offset-4 hover:underline px-0",
      },
      size: {
        default: "h-12 px-5",
        sm: "h-11 px-4 text-sm",
        lg: "h-14 px-6 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  if (asChild) return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>{children}</Comp>;
  return (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading && <Loader2 className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
});
Button.displayName = "Button";
export { Button, buttonVariants };
