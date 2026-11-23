"use client";

import { Upload } from "lucide-react";
import type { ChangeEvent } from "react";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FileInputProps {
  accept?: string;
  buttonLabel?: string;
  className?: string;
  disabled?: boolean;
  fileName?: string | null;
  id?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export function FileInput({
  accept,
  buttonLabel = "Escolher imagem",
  className,
  disabled,
  fileName,
  id,
  onChange,
  placeholder = "Nenhuma imagem selecionada",
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const displayName = fileName === undefined ? selectedName : fileName;

  const handleTrigger = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      setSelectedName(file?.name ?? null);
      onChange?.(event);
    },
    [onChange]
  );

  return (
    <div className={cn("relative flex min-w-0", className)}>
      <input
        accept={accept}
        className="sr-only"
        disabled={disabled}
        id={id}
        onChange={handleChange}
        ref={inputRef}
        tabIndex={-1}
        type="file"
      />
      <button
        className="flex h-8 w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg border border-input bg-transparent px-1.5 text-left text-sm outline-none transition-colors hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30 dark:disabled:bg-input/80"
        disabled={disabled}
        onClick={handleTrigger}
        type="button"
      >
        <span className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-md bg-secondary px-2 font-medium text-secondary-foreground text-xs">
          <Upload aria-hidden="true" className="size-3" />
          {buttonLabel}
        </span>
        <span
          className={cn(
            "min-w-0 truncate text-sm",
            displayName ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {displayName ?? placeholder}
        </span>
      </button>
    </div>
  );
}
