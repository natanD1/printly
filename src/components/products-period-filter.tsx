"use client";

import { Calendar, Check } from "lucide-react";
import { useCallback, useState } from "react";
import { DateRangeCalendar } from "@/components/date-range-calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  currentMonthRange,
  type DateRange,
  formatRangeLabel,
  homeFullRange,
  homeMinDate,
  isSameRange,
  previousMonthRange,
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
      className="justify-between"
      disabled={disabled}
      onClick={handleClick}
      size="sm"
      type="button"
      variant={isActive ? "secondary" : "ghost"}
    >
      <span>{label}</span>
      {isActive ? (
        <Check aria-hidden="true" className="size-3.5 text-primary" />
      ) : null}
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

  const handleSelectRange = useCallback(
    (range: DateRange) => {
      onChange(range);
      setIsOpen(false);
    },
    [onChange]
  );

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger render={<Button size="lg" variant="outline" />}>
        <Calendar />
        {formatRangeLabel(value)}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto gap-0 overflow-hidden p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-col justify-between gap-3 border-b p-3 sm:w-44 sm:border-r sm:border-b-0">
            <div className="flex flex-col gap-1">
              <span className="px-2 pb-1 font-medium text-muted-foreground text-xs">
                Atalhos
              </span>
              {PRESETS.map((preset) => {
                const range = preset.getRange(monthsBack);
                return (
                  <PresetButton
                    disabled={minDate !== null && range.from < minDate}
                    isActive={isSameRange(range, value)}
                    key={preset.label}
                    label={preset.label}
                    onSelect={handleSelectRange}
                    range={range}
                  />
                );
              })}
            </div>

            {minDate ? (
              <p className="px-2 text-[0.7rem] text-muted-foreground leading-snug">
                Disponível a partir de {minDate.toLocaleDateString("pt-BR")}
              </p>
            ) : null}
          </div>

          <DateRangeCalendar
            key={
              isOpen
                ? `${value.from.getTime()}-${value.to.getTime()}`
                : "closed"
            }
            maxDate={maxDate}
            minDate={minDate}
            onSelectRange={handleSelectRange}
            value={value}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
