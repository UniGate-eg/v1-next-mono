import React from "react";

interface AuthDividerProps {
  label?: string;
}

export function AuthDivider({ label = "or continue with" }: AuthDividerProps) {
  return (
    <div className="relative my-6" aria-hidden="true">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-800" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-[#131534] px-3 text-slate-400 font-medium tracking-wide">
          {label}
        </span>
      </div>
    </div>
  );
}
