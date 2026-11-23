"use client";

import { Eye, EyeOff } from "lucide-react";
import { type ComponentProps, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function PasswordInput({
  className,
  disabled,
  ref,
  type: _type,
  ...props
}: ComponentProps<typeof Input>) {
  const [visible, setVisible] = useState(false);

  const handleToggle = useCallback(() => {
    setVisible((prev) => !prev);
  }, []);

  return (
    <div className="relative">
      <Input
        {...props}
        className={cn("pr-10", className)}
        disabled={disabled}
        ref={ref}
        type={visible ? "text" : "password"}
      />
      <Button
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={visible}
        className="absolute top-1/2 right-1 -translate-y-1/2 cursor-pointer text-muted-foreground hover:bg-transparent hover:text-foreground dark:hover:bg-transparent"
        disabled={disabled}
        onClick={handleToggle}
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        {visible ? (
          <EyeOff aria-hidden="true" className="size-4" />
        ) : (
          <Eye aria-hidden="true" className="size-4" />
        )}
      </Button>
    </div>
  );
}
