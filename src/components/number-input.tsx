"use client";

import type { ChangeEvent, ComponentProps, FocusEvent } from "react";
import { useCallback, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  formatNumberInput,
  maskNumberInput,
  parseNumberInput,
} from "@/utils/number-input";

interface NumberInputProps
  extends Omit<
    ComponentProps<typeof InputGroupInput>,
    "onChange" | "prefix" | "type" | "value"
  > {
  /** Casas decimais aceitas (0 = só inteiros). */
  decimals?: number;
  /** Dígitos entram pela direita (R$ 1.234,56). Use pra dinheiro. */
  fixed?: boolean;
  max?: number;
  onValueChange: (value: number | null) => void;
  prefix?: string;
  suffix?: string;
  /** Só define o texto inicial: o campo mantém o próprio texto enquanto o usuário digita. */
  value: number | null;
}

export function NumberInput({
  decimals = 0,
  fixed = false,
  max,
  onValueChange,
  prefix,
  suffix,
  value,
  ...props
}: NumberInputProps) {
  const [text, setText] = useState(() =>
    formatNumberInput(value, decimals, fixed)
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { selectionStart, value: typed } = event.target;
      const insertedChar = (event.nativeEvent as InputEvent).data;
      // "." digitado vira vírgula decimal (o ponto do texto é só separador de milhar, descartá-lo multiplicaria o valor por 10).
      const raw =
        insertedChar === "." && decimals > 0 && !fixed && selectionStart
          ? `${typed.slice(0, selectionStart - 1)},${typed.slice(selectionStart)}`
          : typed;
      const masked = maskNumberInput(raw, decimals, fixed);
      const parsed = parseNumberInput(masked);

      if (parsed !== null && max !== undefined && parsed > max) {
        setText(formatNumberInput(max, decimals, fixed));
        onValueChange(max);
        return;
      }

      setText(masked);
      onValueChange(parsed);
    },
    [decimals, fixed, max, onValueChange]
  );

  const handleFocus = useCallback((event: FocusEvent<HTMLInputElement>) => {
    event.currentTarget.select();
  }, []);

  return (
    <InputGroup>
      {prefix ? (
        <InputGroupAddon>
          <InputGroupText>{prefix}</InputGroupText>
        </InputGroupAddon>
      ) : null}
      <InputGroupInput
        autoComplete="off"
        inputMode={decimals > 0 ? "decimal" : "numeric"}
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder="0"
        type="text"
        value={text}
        {...props}
      />
      {suffix ? (
        <InputGroupAddon align="inline-end">
          <InputGroupText>{suffix}</InputGroupText>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
}
