"use client";

import React, { useState, forwardRef, KeyboardEvent } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className = "", error, id, disabled, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [capsLockActive, setCapsLockActive] = useState(false);
    const { language } = useLanguage();
    const isAr = language === "ar";

    const handleKeyEvent = (e: KeyboardEvent<HTMLInputElement>) => {
      setCapsLockActive(e.getModifierState("CapsLock"));
    };

    return (
      <div className="relative space-y-1.5">
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={showPassword ? "text" : "password"}
            disabled={disabled}
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            onKeyDown={handleKeyEvent}
            onKeyUp={handleKeyEvent}
            aria-invalid={error ? "true" : "false"}
            className={`w-full h-12 px-4 ${isAr ? "pl-12" : "pr-12"} rounded-xl bg-white/[0.04] border text-slate-100 placeholder:text-slate-500 text-sm transition-all duration-200 outline-none
              ${
                error
                  ? "border-rose-500/60 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15"
                  : "border-white/10 hover:border-white/20 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/15 focus:bg-white/[0.07]"
              }
              disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...props}
          />
          <button
            type="button"
            tabIndex={0}
            disabled={disabled}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={
              showPassword
                ? isAr
                  ? "إخفاء كلمة المرور"
                  : "Hide password"
                : isAr
                ? "إظهار كلمة المرور"
                : "Show password"
            }
            aria-pressed={showPassword}
            className={`absolute ${isAr ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-purple-500/40 outline-none transition-colors cursor-pointer disabled:cursor-not-allowed`}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Eye className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>

        {capsLockActive && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-1.5 text-xs text-amber-400 font-medium px-1 animate-in fade-in duration-150"
          >
            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isAr ? "زر Caps Lock مفعل" : "Caps Lock is on"}</span>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
