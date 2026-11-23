import { Check, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  getPasswordScore,
  getPasswordStrength,
  PASSWORD_RULES,
  type PasswordStrength as PasswordStrengthLevel,
} from "@/utils/password-rules";

const STRENGTH_STYLES: Record<
  PasswordStrengthLevel,
  {
    indicatorClassName: string;
    label: string;
    textClassName: string;
  }
> = {
  medium: {
    indicatorClassName: "bg-amber-500 dark:bg-amber-400",
    label: "Senha média",
    textClassName: "text-amber-600 dark:text-amber-400",
  },
  strong: {
    indicatorClassName: "bg-emerald-500 dark:bg-emerald-400",
    label: "Senha forte",
    textClassName: "text-emerald-600 dark:text-emerald-400",
  },
  weak: {
    indicatorClassName: "bg-destructive",
    label: "Senha fraca",
    textClassName: "text-destructive",
  },
};

export function PasswordStrength({ password }: { password: string }) {
  if (password === "") {
    return null;
  }

  const score = getPasswordScore(password);
  const strength = getPasswordStrength(password);
  const { indicatorClassName, label, textClassName } =
    STRENGTH_STYLES[strength];
  const progressValue = (score / PASSWORD_RULES.length) * 100;

  return (
    <div className="space-y-2 pt-1">
      <div className="space-y-1">
        <Progress
          indicatorClassName={indicatorClassName}
          value={progressValue}
        />
        <p
          aria-live="polite"
          className={cn("font-medium text-xs", textClassName)}
        >
          {label}
        </p>
      </div>

      <ul className="space-y-1 text-xs">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(password);

          return (
            <li
              className={cn(
                "flex items-center gap-1.5",
                met ? "text-foreground" : "text-muted-foreground"
              )}
              key={rule.id}
            >
              {met ? (
                <Check
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                />
              ) : (
                <X
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-muted-foreground"
                />
              )}
              <span>{rule.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
