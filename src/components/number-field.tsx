"use client";

import { useCallback } from "react";
import {
  type Control,
  type FieldPath,
  type FieldValues,
  useController,
} from "react-hook-form";
import { NumberInput } from "@/components/number-input";

type NumberInputProps = Parameters<typeof NumberInput>[0];

interface NumberFieldProps<T extends FieldValues>
  extends Omit<NumberInputProps, "onValueChange" | "value"> {
  control: Control<T>;
  name: FieldPath<T>;
  /** Campo vazio vira `null` em vez de `0`. */
  nullable?: boolean;
}

export function NumberField<T extends FieldValues>({
  control,
  name,
  nullable = false,
  ...props
}: NumberFieldProps<T>) {
  const { field, fieldState } = useController({ control, name });
  const { onChange } = field;

  const handleValueChange = useCallback(
    (value: number | null) => {
      onChange(nullable ? value : (value ?? 0));
    },
    [nullable, onChange]
  );

  return (
    <NumberInput
      aria-invalid={fieldState.invalid}
      name={field.name}
      onBlur={field.onBlur}
      onValueChange={handleValueChange}
      ref={field.ref}
      value={field.value as number | null}
      {...props}
    />
  );
}
