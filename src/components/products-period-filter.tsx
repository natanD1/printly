"use client";

import { Calendar } from "lucide-react";
import { type ChangeEvent, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  currentMonthRange,
  type DateRange,
  formatRangeLabel,
  fromDateInputValue,
  homeFullRange,
  homeMinDate,
  isSameRange,
  previousMonthRange,
  toDateInputValue,
  today,
} from "@/utils/date-filters";

interface ProductsPeriodFilterProps {
  /** Meses anteriores ao atual que o plano deixa consultar (`null` = sem limite). */
  monthsBack: number | null;
  onChange: (range: DateRange) => void;
  value: DateRange;
}

const PRESETS = [
  { getRange: () => currentMonthRange(), label: "Este mês" },
  { getRange: () => previousMonthRange(), label: "Mês passado" },
  { getRange: homeFullRange, label: "Todo o período" },
] as const satisfies readonly {
  getRange: (monthsBack: number | null) => DateRange;
  label: string;
}[];

function PresetButton({
  disabled,
  isActive,
  label,
  onSelect,
  range,
}: {
  disabled: boolean;
  isActive: boolean;
  label: string;
  onSelect: (range: DateRange) => void;
  range: DateRange;
}) {
  const handleClick = useCallback(() => onSelect(range), [onSelect, range]);

  return (
    <Button
      className="justify-start"
      disabled={disabled}
      onClick={handleClick}
      variant={isActive ? "secondary" : "ghost"}
    >
      {label}
    </Button>
  );
}

export function ProductsPeriodFilter({
  monthsBack,
  onChange,
  value,
}: ProductsPeriodFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const minDate = homeMinDate(monthsBack);
  const maxDate = today();

  const handlePreset = useCallback(
    (range: DateRange) => {
      onChange(range);
      setIsOpen(false);
    },
    [onChange]
  );

  const handleFromChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const from = fromDateInputValue(event.target.value);

      if (from && (!minDate || from >= minDate) && from <= value.to) {
        onChange({ from, to: value.to });
      }
    },
    [minDate, onChange, value.to]
  );

  const handleToChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const to = fromDateInputValue(event.target.value);

      if (to && to >= value.from && to <= today()) {
        onChange({ from: value.from, to });
      }
    },
    [onChange, value.from]
  );

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger render={<Button size="lg" variant="outline" />}>
        <Calendar />
        {formatRangeLabel(value)}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <div className="flex flex-col gap-1">
          {PRESETS.map((preset) => {
            const range = preset.getRange(monthsBack);
            return (
              <PresetButton
                disabled={minDate !== null && range.from < minDate}
                isActive={isSameRange(range, value)}
                key={preset.label}
                label={preset.label}
                onSelect={handlePreset}
                range={range}
              />
            );
          })}
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="period-from">De</Label>
            <Input
              id="period-from"
              max={toDateInputValue(value.to)}
              min={minDate ? toDateInputValue(minDate) : undefined}
              onChange={handleFromChange}
              type="date"
              value={toDateInputValue(value.from)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="period-to">Até</Label>
            <Input
              id="period-to"
              max={toDateInputValue(maxDate)}
              min={toDateInputValue(value.from)}
              onChange={handleToChange}
              type="date"
              value={toDateInputValue(value.to)}
            />
          </div>
          {minDate ? (
            <p className="text-muted-foreground text-xs">
              Disponível a partir de {minDate.toLocaleDateString("pt-BR")}
            </p>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
