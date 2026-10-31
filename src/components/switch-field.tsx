"use client";

import type { ComponentProps } from "react";
import { useCallback } from "react";
import {
  type Control,
  type FieldPath,
  type FieldValues,
  useController,
} from "react-hook-form";
import { Switch } from "@/components/ui/switch";

interface SwitchFieldProps<T extends FieldValues>
  extends Omit<
    ComponentProps<typeof Switch>,
    "checked" | "defaultChecked" | "name" | "onCheckedChange"
  > {
  control: Control<T>;
  name: FieldPath<T>;
}

export function SwitchField<T extends FieldValues>({
  control,
  name,
  ...props
}: SwitchFieldProps<T>) {
  const { field } = useController({ control, name });
  const { onChange } = field;

  const handleCheckedChange = useCallback(
    (checked: boolean) => {
      onChange(checked);
    },
    [onChange]
  );

  return (
    <Switch
      checked={Boolean(field.value)}
      name={field.name}
      onCheckedChange={handleCheckedChange}
      ref={field.ref}
      {...props}
    />
  );
}
