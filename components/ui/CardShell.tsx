import React from 'react';
import { cn } from '../../lib/utils';

export default function CardShell({
  className,
  children,
  ...props
}: React.PropsWithChildren<{ className?: string }> & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border bg-white/5 backdrop-blur-xl",
        "border-white/10 shadow-[0_10px_40px_rgba(34,197,94,.07)]",
        "hover:shadow-[0_16px_60px_rgba(56,189,248,.18)] transition-shadow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}