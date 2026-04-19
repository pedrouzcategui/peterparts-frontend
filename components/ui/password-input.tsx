"use client";

import * as React from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PasswordInputProps
  extends Omit<React.ComponentProps<"input">, "type"> {
  className?: string;
  actionAriaLabel?: string;
  actionLabel?: string;
  onActionClick?: () => void | Promise<void>;
}

function PasswordInput({
  className,
  actionAriaLabel,
  actionLabel,
  onActionClick,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const hasInlineAction = Boolean(actionLabel && onActionClick);

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        data-slot="input"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-shadow outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40",
          hasInlineAction ? "pr-28 sm:pr-32" : "pr-10",
          className,
        )}
        {...props}
      />
      <div className="absolute inset-y-0 right-1 flex items-center gap-1">
        {hasInlineAction ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-7 px-2 text-[11px] font-semibold text-primary hover:bg-primary/10 hover:text-primary"
            onClick={() => {
              if (onActionClick) {
                void onActionClick();
              }
            }}
            aria-label={actionAriaLabel ?? actionLabel}
            disabled={props.disabled}
          >
            {actionLabel}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8 px-0 hover:bg-transparent"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          disabled={props.disabled}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    </div>
  );
}

export { PasswordInput };
