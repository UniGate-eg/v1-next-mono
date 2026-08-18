"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpSchema, type SignUpInput } from "@/schemas/auth.schema";
import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, UserPlus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const { language } = useLanguage();
  const isAr = language === "ar";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(SignUpSchema),
  });

  const passwordVal = watch("password", "");

  const calculateStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const strength = calculateStrength(passwordVal);

  const onSubmit = async (data: SignUpInput) => {
    if (!acceptTerms) {
      toast.error(
        isAr
          ? "يرجى الموافقة على شروط الاستخدام وسياسة الخصوصية للمتابعة."
          : "Please agree to the Terms of Service to continue."
      );
      return;
    }

    setLoading(true);
    try {
      const res = await signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (res.error) {
        toast.error(
          isAr
            ? "تعذر إنشاء الحساب. قد يكون البريد الإلكتروني مسجلاً مسبقاً."
            : res.error.message || "Registration failed. Please try again."
        );
      } else {
        toast.success(
          isAr
            ? "تم إنشاء حساب الطالب بنجاح! مرحباً بك في UniGate."
            : "Account created successfully! Welcome to UniGate."
        );
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      toast.error(
        isAr
          ? "حدث خطأ غير متوقع أثناء إنشاء الحساب."
          : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {isAr ? "إنشاء حساب جديد" : "Create an account"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {isAr
            ? "سجّل الآن لتتبع قبولك الجامعي وحفظ برامجك المفضلة"
            : "Start tracking university admissions and deadlines"}
        </p>
      </div>

      {/* ── Form ──────────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">
            {isAr ? "الاسم الكامل" : "Full name"}
          </label>
          <input
            type="text"
            autoComplete="name"
            placeholder={isAr ? "مثال: أحمد محمود" : "e.g. Ahmed Mahmoud"}
            {...register("name")}
            disabled={loading}
            className="w-full h-11 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/15 focus:bg-white/[0.07] text-white placeholder:text-slate-500 text-sm transition-all duration-200 outline-none disabled:opacity-50"
          />
          {errors.name && (
            <p className="text-xs text-rose-400 font-medium pl-1 animate-in fade-in">{errors.name.message}</p>
          )}
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">
            {isAr ? "البريد الإلكتروني" : "Email address"}
          </label>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={isAr ? "student@example.com" : "student@example.com"}
            {...register("email")}
            disabled={loading}
            className="w-full h-11 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/15 focus:bg-white/[0.07] text-white placeholder:text-slate-500 text-sm transition-all duration-200 outline-none disabled:opacity-50"
          />
          {errors.email && (
            <p className="text-xs text-rose-400 font-medium pl-1 animate-in fade-in">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">
            {isAr ? "كلمة المرور (8 أحرف على الأقل)" : "Password (min 8 characters)"}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              {...register("password")}
              disabled={loading}
              className={`w-full h-11 px-3.5 ${isAr ? "pl-11" : "pr-11"} rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/15 focus:bg-white/[0.07] text-white placeholder:text-slate-500 text-sm transition-all duration-200 outline-none disabled:opacity-50`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className={`absolute ${isAr ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer`}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-rose-400 font-medium pl-1 animate-in fade-in">{errors.password.message}</p>
          )}

          {/* Password Strength Indicator */}
          {passwordVal.length > 0 && (
            <div className="mt-2 space-y-1.5 pt-1">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      strength >= step
                        ? strength <= 1
                          ? "bg-rose-500"
                          : strength <= 2
                          ? "bg-amber-400"
                          : strength <= 3
                          ? "bg-blue-400"
                          : "bg-emerald-400"
                        : "bg-slate-800"
                    }`}
                  />
                ))}
              </div>
              <p className="text-[11px] font-medium text-slate-400">
                {strength <= 1
                  ? (isAr ? "ضعيفة — أضف أرقاماً ورموزاً" : "Weak — add symbols and numbers")
                  : strength <= 2
                  ? (isAr ? "متوسطة" : "Fair")
                  : strength <= 3
                  ? (isAr ? "جيدة" : "Good")
                  : (isAr ? "قوية جداً" : "Strong password")}
              </p>
            </div>
          )}
        </div>

        {/* Terms & Privacy */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-white/20 bg-slate-900 text-purple-600 focus:ring-purple-500/30 cursor-pointer"
            />
            <span className="text-xs text-slate-400 leading-normal">
              {isAr ? (
                <>
                  أوافق على <span className="text-purple-400 hover:underline">شروط الخدمة</span> و{" "}
                  <span className="text-purple-400 hover:underline">سياسة الخصوصية</span>.
                </>
              ) : (
                <>
                  I agree to the <span className="text-purple-400 hover:underline">Terms of Service</span> and{" "}
                  <span className="text-purple-400 hover:underline">Privacy Policy</span>.
                </>
              )}
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer mt-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{isAr ? "جاري إنشاء الحساب..." : "Creating Account..."}</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>{isAr ? "إنشاء حساب مجاني" : "Create Account"}</span>
              <ArrowRight className="w-4 h-4 opacity-80 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>

        {/* Switch to Login */}
        <div className="text-center text-xs text-slate-400 pt-4">
          {isAr ? "لديك حساب بالفعل؟ " : "Already have an account? "}
          <Link
            href="/auth/login"
            className="font-medium text-purple-400 hover:text-purple-300 underline underline-offset-4 transition-colors"
          >
            {isAr ? "تسجيل الدخول" : "Sign in"}
          </Link>
        </div>
      </form>
    </div>
  );
}
