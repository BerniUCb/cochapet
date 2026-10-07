import * as React from "react";
import { cn } from "@/lib/utils";

export const fieldBase =
  "flex w-full rounded-xl border border-line bg-surface px-4 text-[15px] text-ink placeholder:text-ink-subtle transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 disabled:opacity-50 aria-[invalid=true]:border-error aria-[invalid=true]:ring-error/20";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(fieldBase, "h-12", className)} {...props} />
));
Input.displayName = "Input";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(fieldBase, "min-h-[112px] py-3 leading-relaxed resize-none", className)} {...props} />
));
Textarea.displayName = "Textarea";

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select ref={ref} className={cn(fieldBase, "h-12 appearance-none pr-10", className)} {...props}>
      {children}
    </select>
    <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-subtle" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden><path d="m6 9 6 6 6-6" /></svg>
  </div>
));
Select.displayName = "Select";

function Label({ className, children, optional, ...props }: React.LabelHTMLAttributes<HTMLLabelElement> & { optional?: boolean }) {
  return (
    <label className={cn("text-sm font-semibold text-ink", className)} {...props}>
      {children}
      {optional && <span className="ml-1 font-normal text-ink-subtle">(opcional)</span>}
    </label>
  );
}

function FieldError({ id, children }: { id?: string; children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="text-[13px] font-medium text-error">
      {children}
    </p>
  );
}

export { Input, Textarea, Select, Label, FieldError };
