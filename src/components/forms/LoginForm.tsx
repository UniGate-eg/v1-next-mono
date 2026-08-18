"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignInSchema, type SignInInput } from "@/schemas/auth.schema";
import { signIn } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const { language } = useLanguage();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInInput) => {
    setLoading(true);
    try {
      const res = await signIn.email({
        email: data.email,
        password: data.password,
      });

      if (res.error) {
        toast.error(
          language === "ar"
            ? "تعذر تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور."
            : res.error.message || "Failed to sign in. Please check your credentials."
        );
      } else {
        toast.success(language === "ar" ? "أهلاً بك مجدداً في UniGate!" : "Welcome back to UniGate!");
        router.push(redirectUrl);
        router.refresh();
      }
    } catch (err) {
      toast.error(
        language === "ar"
          ? "حدث خطأ غير متوقع أثناء تسجيل الدخول."
          : "An unexpected error occurred during sign in."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: "student" | "admin") => {
    if (role === "student") {
      setValue("email", "student.demo@unigate.eg");
      setValue("password", "StudentPass2026!");
      toast.info(
        language === "ar"
          ? "تم إدخال بيانات حساب الطالب التجريبي."
          : "Pre-filled Student Demo credentials."
      );
    } else {
      setValue("email", "admin.demo@unigate.eg");
      setValue("password", "AdminPass2026!");
      toast.info(
        language === "ar"
          ? "تم إدخال بيانات حساب المشرف التجريبي."
          : "Pre-filled Admin / Editor Demo credentials."
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Main Form ──────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300 tracking-wide">
            {language === "ar" ? "البريد الإلكتروني" : "Email Address"}
          </label>
          <input
            type="email"
            autoComplete="email"
            placeholder={language === "ar" ? "student@example.com" : "student@example.com"}
            {...register("email")}
            disabled={loading}
            className="w-full h-12 px-4 rounded-xl bg-[#0e1027]/90 border border-purple-500/20 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/15 transition-all duration-200"
          />
          {errors.email && (
            <p className="text-xs text-rose-400 font-medium pl-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-slate-300 tracking-wide">
              {language === "ar" ? "كلمة المرور" : "Password"}
            </label>
            <a
              href="#forgot-password"
              onClick={(e) => {
                e.preventDefault();
                toast.info(
                  language === "ar"
                    ? "لإعادة تعيين كلمة المرور، يرجى مراجعة إدارة القبول أو الدعم الفني."
                    : "Password reset instructions have been sent if registered."
                );
              }}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              {language === "ar" ? "نسيت كلمة المرور؟" : "Forgot password?"}
            </a>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password")}
              disabled={loading}
              className="w-full h-12 px-4 pr-11 rounded-xl bg-[#0e1027]/90 border border-purple-500/20 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/15 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-rose-400 font-medium pl-1">{errors.password.message}</p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-purple-500/40 bg-slate-900 text-purple-600 focus:ring-purple-500/30"
            />
            <span className="text-xs text-slate-300">
              {language === "ar" ? "تذكر هذا الجهاز" : "Remember this device"}
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer mt-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{language === "ar" ? "جاري تسجيل الدخول..." : "Signing in..."}</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>{language === "ar" ? "تسجيل الدخول إلى UniGate" : "Sign In to UniGate"}</span>
              <ArrowRight className="w-4 h-4 opacity-80 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* ── Social / Alternative Login ──────────────────────────────────────── */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#131534] px-3 text-slate-400 text-xs">
            {language === "ar" ? "أو المتابعة باستخدام" : "Or continue with"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => toast.info(language === "ar" ? "تسجيل الدخول عبر Google متاح قريباً." : "Google OAuth is ready in production.")}
          className="flex items-center justify-center gap-2.5 h-11 px-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-slate-200 text-xs font-medium transition-all duration-200 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.5 1.9 7.8l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
            />
          </svg>
          <span>Google</span>
        </button>

        <button
          type="button"
          onClick={() => toast.info(language === "ar" ? "تسجيل الدخول عبر Apple متاح قريباً." : "Apple ID Auth is ready in production.")}
          className="flex items-center justify-center gap-2.5 h-11 px-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-slate-200 text-xs font-medium transition-all duration-200 cursor-pointer"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.62-.75 1.04-1.8 0.93-2.84-.9.04-1.99.6-2.64 1.35-.57.65-1.07 1.72-.94 2.73 1 .08 2.03-.49 2.65-1.24z" />
          </svg>
          <span>Apple</span>
        </button>
      </div>

      {/* ── Quick Demo Autofill Pills (Spacious Bottom Placement) ─────────────── */}
      <div className="pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {language === "ar" ? "تجربة سريعة بنقرة واحدة" : "Instant Demo Autofill"}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemo("student")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/25 transition-all duration-200 cursor-pointer"
          >
            🎓 {language === "ar" ? "طالب تجريبي" : "Student Demo"}
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo("admin")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/25 transition-all duration-200 cursor-pointer"
          >
            🛡️ {language === "ar" ? "مشرف تجريبي" : "Admin Demo"}
          </button>
        </div>
      </div>

      {/* ── Switch to Register ────────────────────────────────────────────── */}
      <div className="text-center text-xs text-slate-400 pt-1">
        {language === "ar" ? "ليس لديك حساب بعد؟ " : "Don't have an account? "}
        <Link
          href="/auth/register"
          className="font-semibold text-purple-400 hover:text-purple-300 underline underline-offset-4 transition-colors"
        >
          {language === "ar" ? "إنشاء حساب مجاني" : "Create Account"}
        </Link>
      </div>
    </div>
  );
}
