"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { type MouseEvent, useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DateRange } from "@/utils/date-filters";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  time: number;
}

interface DateRangeCalendarProps {
  maxDate: Date;
  minDate: Date | null;
  onSelectRange: (range: DateRange) => void;
  value: DateRange;
}

function normalizeDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function buildMonthGrid(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

  const days: CalendarDay[] = [];
  for (let index = 0; index < totalCells; index += 1) {
    const dayNumber = index - startWeekday + 1;
    const date = new Date(year, month, dayNumber);
    days.push({
      date,
      isCurrentMonth: date.getMonth() === month,
      time: date.getTime(),
    });
  }

  return days;
}

function formatFullDate(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}

function getDayCellClasses({
  isDisabled,
  isEdge,
  isInRange,
  isOutside,
  isRangeEnd,
  isRangeStart,
  isSingleDay,
  isToday,
}: {
  isDisabled: boolean;
  isEdge: boolean;
  isInRange: boolean;
  isOutside: boolean;
  isRangeEnd: boolean;
  isRangeStart: boolean;
  isSingleDay: boolean;
  isToday: boolean;
}): string {
  let shapeClass = "rounded-lg";
  if (isInRange && !isSingleDay) {
    if (isRangeStart) {
      shapeClass = "rounded-l-lg rounded-r-none";
    } else if (isRangeEnd) {
      shapeClass = "rounded-l-none rounded-r-lg";
    } else {
      shapeClass = "rounded-none";
    }
  }

  let colorClass = "text-foreground hover:bg-accent";
  if (isEdge) {
    colorClass =
      "bg-primary font-semibold text-primary-foreground hover:bg-primary/90";
  } else if (isInRange) {
    colorClass = "bg-primary/15 text-foreground hover:bg-primary/25";
  } else if (isOutside) {
    colorClass = "text-muted-foreground/45 hover:bg-accent/60";
  }

  return cn(
    "flex h-8 w-8 cursor-pointer items-center justify-center font-medium text-xs outline-none transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring",
    shapeClass,
    colorClass,
    isToday && !isEdge ? "ring-1 ring-primary/60 ring-inset" : undefined,
    isDisabled ? "pointer-events-none opacity-30" : undefined
  );
}

export function DateRangeCalendar({
  maxDate,
  minDate,
  onSelectRange,
  value,
}: DateRangeCalendarProps) {
  const [viewMonth, setViewMonth] = useState(
    () => new Date(value.to.getFullYear(), value.to.getMonth(), 1)
  );
  const [pendingStart, setPendingStart] = useState<Date | null>(null);
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);

  const normalizedMinTime = minDate ? normalizeDay(minDate).getTime() : null;
  const normalizedMaxTime = normalizeDay(maxDate).getTime();
  const todayTime = normalizedMaxTime;

  const viewYear = viewMonth.getFullYear();
  const viewMonthIndex = viewMonth.getMonth();

  const days = useMemo(
    () => buildMonthGrid(viewYear, viewMonthIndex),
    [viewMonthIndex, viewYear]
  );

  const canGoPrev = useMemo(() => {
    if (normalizedMinTime === null) {
      return true;
    }
    const prevMonthLastDay = new Date(viewYear, viewMonthIndex, 0).getTime();
    return prevMonthLastDay >= normalizedMinTime;
  }, [normalizedMinTime, viewMonthIndex, viewYear]);

  const canGoNext = useMemo(() => {
    const nextMonthFirstDay = new Date(
      viewYear,
      viewMonthIndex + 1,
      1
    ).getTime();
    return nextMonthFirstDay <= normalizedMaxTime;
  }, [normalizedMaxTime, viewMonthIndex, viewYear]);

  const handlePrevMonth = useCallback(() => {
    setViewMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1)
    );
  }, []);

  const handleNextMonth = useCallback(() => {
    setViewMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1)
    );
  }, []);

  const handleDayClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const rawTime = Number(event.currentTarget.dataset.time);
      if (Number.isNaN(rawTime)) {
        return;
      }

      const clicked = new Date(rawTime);

      if (!pendingStart) {
        setPendingStart(clicked);
        setHoveredDay(clicked);
        return;
      }

      const [from, to] =
        clicked.getTime() < pendingStart.getTime()
          ? [clicked, pendingStart]
          : [pendingStart, clicked];

      setPendingStart(null);
      setHoveredDay(null);
      onSelectRange({ from, to });
    },
    [onSelectRange, pendingStart]
  );

  const handleDayMouseEnter = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (!pendingStart) {
        return;
      }

      const rawTime = Number(event.currentTarget.dataset.time);
      if (!Number.isNaN(rawTime)) {
        setHoveredDay(new Date(rawTime));
      }
    },
    [pendingStart]
  );

  let activeFromTime = normalizeDay(value.from).getTime();
  let activeToTime = normalizeDay(value.to).getTime();

  if (pendingStart) {
    const pendingTime = pendingStart.getTime();
    const hoverTime = hoveredDay?.getTime() ?? pendingTime;
    activeFromTime = Math.min(pendingTime, hoverTime);
    activeToTime = Math.max(pendingTime, hoverTime);
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex items-center justify-between gap-2">
        <Button
          aria-label="Mês anterior"
          disabled={!canGoPrev}
          onClick={handlePrevMonth}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <ChevronLeft aria-hidden="true" />
        </Button>

        <span className="font-heading font-semibold text-sm">
          {MONTHS[viewMonthIndex]} {viewYear}
        </span>

        <Button
          aria-label="Próximo mês"
          disabled={!canGoNext}
          onClick={handleNextMonth}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>

      <div className="grid grid-cols-7 text-center">
        {WEEKDAYS.map((weekday) => (
          <span
            className="flex h-7 w-8 items-center justify-center font-medium text-[0.7rem] text-muted-foreground"
            key={weekday}
          >
            {weekday}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day) => {
          const isDisabled =
            (normalizedMinTime !== null && day.time < normalizedMinTime) ||
            day.time > normalizedMaxTime;
          const isRangeStart = day.time === activeFromTime;
          const isRangeEnd = day.time === activeToTime;
          const isSingleDay = activeFromTime === activeToTime;
          const isEdge = isRangeStart || isRangeEnd;
          const isInRange =
            day.time >= activeFromTime && day.time <= activeToTime;
          const isToday = day.time === todayTime;

          return (
            <button
              aria-label={formatFullDate(day.date)}
              aria-pressed={isEdge}
              className={getDayCellClasses({
                isDisabled,
                isEdge,
                isInRange,
                isOutside: !day.isCurrentMonth,
                isRangeEnd,
                isRangeStart,
                isSingleDay,
                isToday,
              })}
              data-time={day.time}
              disabled={isDisabled}
              key={day.time}
              onClick={handleDayClick}
              onMouseEnter={handleDayMouseEnter}
              type="button"
            >
              {day.date.getDate()}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 border-t pt-2.5 text-xs">
        <span className="text-muted-foreground">
          {pendingStart ? (
            <>
              Início:{" "}
              <strong className="font-medium text-foreground">
                {formatFullDate(pendingStart)}
              </strong>{" "}
              · Escolha o fim
            </>
          ) : (
            <>
              <strong className="font-medium text-foreground">
                {formatFullDate(value.from)}
              </strong>{" "}
              até{" "}
              <strong className="font-medium text-foreground">
                {formatFullDate(value.to)}
              </strong>
            </>
          )}
        </span>
      </div>
    </div>
  );
}
