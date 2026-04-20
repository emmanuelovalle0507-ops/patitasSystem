"use client";

import * as React from "react";
import { Eye, EyeOff, Lock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  showCapsLockHint?: boolean;
};

export const PasswordInput = React.forwardRef<HTMLInputElement, Props>(
  ({ className, showCapsLockHint = true, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    const [capsOn, setCapsOn] = React.useState(false);

    return (
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          onKeyUp={(e) => {
            if (showCapsLockHint && typeof e.getModifierState === "function") {
              setCapsOn(e.getModifierState("CapsLock"));
            }
            props.onKeyUp?.(e);
          }}
          onBlur={(e) => {
            setCapsOn(false);
            props.onBlur?.(e);
          }}
          className={cn(
            "flex h-11 w-full rounded-lg border border-input bg-background pl-9 pr-11 py-2 text-sm ring-offset-background",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-brand-400",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
        {showCapsLockHint && capsOn && (
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-3 w-3" />
            Mayúsculas activadas
          </div>
        )}
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
