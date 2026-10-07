import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold leading-none whitespace-nowrap", {
  variants: {
    variant: {
      perdida: "bg-primary text-white",
      encontrada: "bg-success-soft text-[#065F46]",
      resuelta: "bg-[#E5E7EB] text-[#374151]",
      destacada: "bg-[#111C2D] text-white",
      neutral: "bg-surface-alt text-ink-muted",
      pendiente: "bg-[#FEF3C7] text-[#92400E]",
      pagada: "bg-[#DBEAFE] text-[#1E40AF]",
      en_curso: "bg-success-soft text-[#065F46]",
      finalizada: "bg-[#E5E7EB] text-[#374151]",
    },
  },
  defaultVariants: { variant: "neutral" },
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
