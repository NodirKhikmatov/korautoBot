import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  action,
  className,
  headingLevel = 1,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  /** Use `2` for section titles when the page already has an `h1`. */
  headingLevel?: 1 | 2;
}) {
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <header className={cn("flex items-start justify-between gap-4", className)}>
      <div className="space-y-1">
        <Heading className="text-2xl font-bold tracking-tight">{title}</Heading>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action}
    </header>
  );
}
