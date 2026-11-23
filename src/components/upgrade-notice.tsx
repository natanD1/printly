import { Lock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface UpgradeNoticeProps {
  className?: string;
  message: string;
}

export function UpgradeNotice({ className, message }: UpgradeNoticeProps) {
  return (
    <div
      className={cn(
        "inline-flex flex-wrap items-center gap-1.5 rounded-lg border bg-muted/50 px-2.5 py-1.5 text-muted-foreground text-xs",
        className
      )}
      role="status"
    >
      <Lock className="size-3.5 shrink-0" />
      <span>{message}</span>
      <Link
        className="cursor-pointer font-medium text-primary underline-offset-4 hover:underline"
        href="/assinatura"
      >
        Ver planos
      </Link>
    </div>
  );
}
