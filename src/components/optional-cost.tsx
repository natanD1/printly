"use client";

import type { ReactNode } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { SwitchField } from "@/components/switch-field";

interface OptionalCostProps<T extends FieldValues> {
  children: ReactNode;
  control: Control<T>;
  description: string;
  disabled?: boolean;
  title: string;
  toggle: FieldPath<T>;
}

/** Bloco de custo opcional com liga/desliga (depreciação, manutenção, falha). */
export function OptionalCost<T extends FieldValues>({
  children,
  control,
  description,
  disabled,
  title,
  toggle,
}: OptionalCostProps<T>) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-sm">{title}</span>
          <span className="text-muted-foreground text-xs">{description}</span>
        </div>
        <SwitchField
          aria-label={title}
          control={control}
          disabled={disabled}
          name={toggle}
        />
      </div>
      {children}
    </div>
  );
}
