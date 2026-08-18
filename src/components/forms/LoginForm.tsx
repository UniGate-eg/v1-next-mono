"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn, Loader2, ArrowRight, Sparkles, GraduationCap, Shield } from "lucide-react";
import { toast } from "sonner";

import { LoginSchema, type LoginInput } from "@/schemas/auth.schema";
import { getSafeRedirectUrl } from "@/lib/auth/safe-redirect";
import { mapAuthErrorToMessage } from "@/lib/auth/error-mapper";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { OAuthButton } from "@/components/auth/OAuthButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { signIn } from "@/lib/auth-client";
import { useLanguage } from "@/contexts/LanguageContext";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || searchParams.get("callbackUrl");
  const targetUrl = getSafeRedirectUrl(rawRedirect, "/dashboard");

  const { language } = useLanguage();
  const isAr = language === "ar";

  const [formError, setFormError] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  // Cooldown timer for rate-limiting
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          setFormError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const isLoading = isSubmitting || isPending || cooldownSeconds > 0;

  const onSubmit = async (data: LoginInput) => {
    if (cooldownSeconds > 0) return;
    setFormError(null);

    try {
      const response = await signIn.email({
        email: data.email,
        password: data.password,
      });

      if (response.error) {
        if (response.error.status === 429) {
          const waitTime = 30;
          setCooldownSeconds(waitTime);
          setFormError(mapAuthErrorToMessage("RATE_LIMITED", undefined, language));
          return;
        }

        setFormError(mapAuthErrorToMessage("INVALID_CREDENTIALS", undefined, language));
        return;
      }

      toast.success(
        isAr ? "أهلاً بك مجدداً في UniGate!" : "Welcome back! Redirecting to your dashboard..."
      );

      startTransition(() => {
        router.push(targetUrl);
        router.refresh();
      });
    } catch (err: unknown) {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setFormError(mapAuthErrorToMessage("NETWORK_ERROR", undefined, language));
      } else {
        setFormError(mapAuthErrorToMessage("SERVER_ERROR", undefined, language));
      }
    }
  };

  const handleOAuth = (provider: "google" | "apple") => {
    toast.info(
      isAr
        ? `جاري الاتصال بمزود ${provider === "google" ? "Google" : "Apple"}...`
        : `Connecting to ${provider === "google" ? "Google" : "Apple"} OAuth provider...`
    );
  };

  const handleQuickDemo = (role: "student" | "admin") => {
    setFormError(null);
    if (role === "student") {
      setValue("email", "student.demo@unigate.eg", { shouldValidate: true });
      setValue("password", "StudentPass2026!", { shouldValidate: true });
      toast.info(
        isAr
          ? "تم إدخال بيانات حساب الطالب التجريبي."
          : "Pre-filled Student Demo credentials."
      );
    } else {
      setValue("email", "admin.demo@unigate.eg", { shouldValidate: true });
      setValue("password", "AdminPass2026!", { shouldValidate: true });
      toast.info(
        isAr
          ? "تم إدخال بيانات حساب المشرف التجريبي."
          : "Pre-filled Administrator Demo credentials."
      );
    }
  };

  return (
    <div className="w-full">
      {/* ── Card Header ──────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {isAr ? "تسجيل الدخول" : "Welcome back"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
          {isAr
            ? "أدخل بريدك الإلكتروني وكلمة المرور للمتابعة إلى حسابك"
            : "Enter your credentials to access your admissions dashboard"}
        </p>
      </div>

      {/* ── Live Alert ───────────────────────────────────────────────────── */}
      {formError && (
        <div className="mb-5">
          <AuthAlert
            type="error"
            message={
              cooldownSeconds > 0
                ? isAr
                  ? `${formError} (إعادة المحاولة بعد ${cooldownSeconds} ثانية)`
                  : `${formError} (Retry available in ${cooldownSeconds}s)`
                : formError
            }
            onDismiss={() => setFormError(null)}
          />
        </div>
      )}

      {/* ── Authentication Form ──────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4.5" noValidate>
        {/* Email Address */}
        <div className="space-y-1.5">
          <label htmlFor="email-input" className="block text-xs font-semibold text-slate-200">
            {isAr ? "البريد الإلكتروني" : "Email address"}
          </label>
          <input
            id="email-input"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            placeholder={isAr ? "student@example.com" : "name@example.com"}
            disabled={isLoading}
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={`w-full h-12 px-4 rounded-xl bg-white/[0.04] border text-slate-100 placeholder:text-slate-500 text-sm transition-all duration-200 outline-none
              ${
                errors.email
                  ? "border-rose-500/60 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15"
                  : "border-white/10 hover:border-white/20 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/15 focus:bg-white/[0.08]"
              }
              disabled:opacity-50 disabled:cursor-not-allowed`}
            {...register("email")}
          />
          {errors.email && (
            <p id="email-error" role="alert" className="text-xs text-rose-400 font-medium pl-1 animate-in fade-in">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password-input" className="block text-xs font-semibold text-slate-200">
              {isAr ? "كلمة المرور" : "Password"}
            </label>
            <a
              href="#forgot-password"
              onClick={(e) => {
                e.preventDefault();
                toast.info(
                  isAr
                    ? "لإعادة تعيين كلمة المرور، يرجى مراجعة إدارة القبول أو الدعم الفني."
                    : "Password reset instructions have been sent if registered."
                );
              }}
              className="text-xs font-medium text-purple-400 hover:text-purple-300 focus-visible:ring-2 focus-visible:ring-purple-500/40 rounded outline-none transition-colors cursor-pointer"
            >
              {isAr ? "نسيت كلمة المرور؟" : "Forgot password?"}
            </a>
          </div>
          <PasswordInput
            id="password-input"
            disabled={isLoading}
            error={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            placeholder="••••••••"
            {...register("password")}
          />
          {errors.password && (
            <p id="password-error" role="alert" className="text-xs text-rose-400 font-medium pl-1 animate-in fade-in">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <input
              type="checkbox"
              id="remember-me"
              disabled={isLoading}
              className="w-4 h-4 rounded border-white/20 bg-slate-900 text-purple-600 focus:ring-purple-500/30 cursor-pointer disabled:cursor-not-allowed"
              {...register("rememberMe")}
            />
            <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
              {isAr ? "تذكر هذا الجهاز" : "Remember this device"}
            </span>
          </label>
        </div>

        {/* Primary Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          className="w-full h-12 mt-3 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 hover:from-purple-500 hover:to-pink-500 active:scale-[0.99] text-white font-semibold text-sm shadow-xl shadow-purple-600/25 hover:shadow-purple-600/40 flex items-center justify-center gap-2 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" aria-hidden="true" />
              <span>
                {cooldownSeconds > 0
                  ? isAr
                    ? `مؤمّن (${cooldownSeconds}ث)`
                    : `Locked (${cooldownSeconds}s)`
                  : isAr
                  ? "جاري تسجيل الدخول..."
                  : "Signing in..."}
              </span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" aria-hidden="true" />
              <span>{isAr ? "تسجيل الدخول إلى UniGate" : "Sign In to UniGate"}</span>
              <ArrowRight className="w-4 h-4 opacity-80 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      {/* ── Social / Alternative Login ──────────────────────────────────────── */}
      <AuthDivider label={isAr ? "أو المتابعة باستخدام" : "or continue with"} />
      <div className="grid grid-cols-2 gap-3">
        <OAuthButton
          provider="google"
          disabled={isLoading}
          onClick={() => handleOAuth("google")}
          label="Google"
        />
        <OAuthButton
          provider="apple"
          disabled={isLoading}
          onClick={() => handleOAuth("apple")}
          label="Apple"
        />
      </div>

      {/* ── Quick Demo Helper (Minimal Single Row with Pure SVGs) ───────────── */}
      <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
          {isAr ? "حساب تجريبي سريع:" : "Instant Demo:"}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleQuickDemo("student")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition-colors cursor-pointer disabled:opacity-50"
          >
            <GraduationCap className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{isAr ? "طالب" : "Student"}</span>
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleQuickDemo("admin")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/20 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Shield className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{isAr ? "مشرف" : "Admin"}</span>
          </button>
        </div>
      </div>

      {/* ── Switch to Register CTA ──────────────────────────────────────────── */}
      <div className="text-center text-xs text-slate-400 pt-5">
        {isAr ? "ليس لديك حساب بعد؟ " : "Don't have an account? "}
        <Link
          href="/auth/register"
          className="font-semibold text-purple-400 hover:text-purple-300 underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-purple-500/40 rounded outline-none transition-colors"
        >
          {isAr ? "إنشاء حساب مجاني" : "Create free account"}
        </Link>
      </div>
    </div>
  );
}
