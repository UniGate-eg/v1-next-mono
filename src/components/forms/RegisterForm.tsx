"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpSchema, type SignUpInput } from "@/schemas/auth.schema";
import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, UserPlus, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const { language } = useLanguage();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(SignUpSchema),
  });

  const passwordVal = watch("password", "");

  // Apple-grade dynamic password strength indicator
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
        language === "ar"
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
          language === "ar"
            ? "تعذر إنشاء الحساب. قد يكون البريد الإلكتروني مسجلاً مسبقاً."
            : res.error.message || "Registration failed. Please try again."
        );
      } else {
        toast.success(
          language === "ar"
            ? "تم إنشاء حساب الطالب بنجاح! مرحباً بك في UniGate."
            : "Account created successfully! Welcome to UniGate."
        );
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      toast.error(
        language === "ar"
          ? "حدث خطأ غير متوقع أثناء إنشاء الحساب."
          : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Full Name */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">
          {language === "ar" ? "الاسم الكامل" : "Full Name"}
        </label>
        <input
          type="text"
          autoComplete="name"
          placeholder={language === "ar" ? "مثال: أحمد محمود" : "e.g. Ahmed Mahmoud"}
          {...register("name")}
          disabled={loading}
          className="w-full h-11 px-3.5 rounded-xl bg-slate-900/80 border border-purple-500/25 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/25 transition-all"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>
        )}
      </div>

      {/* Email Address */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">
          {language === "ar" ? "البريد الإلكتروني" : "Email Address"}
        </label>
        <input
          type="email"
          autoComplete="email"
          placeholder={language === "ar" ? "student@example.com" : "student@example.com"}
          {...register("email")}
          disabled={loading}
          className="w-full h-11 px-3.5 rounded-xl bg-slate-900/80 border border-purple-500/25 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/25 transition-all"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">
          {language === "ar" ? "كلمة المرور (8 أحرف على الأقل)" : "Password (min 8 characters)"}
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            {...register("password")}
            disabled={loading}
            className="w-full h-11 px-3.5 pr-10 rounded-xl bg-slate-900/80 border border-purple-500/25 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/25 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
        )}

        {/* Dynamic Password Strength Bars */}
        {passwordVal.length > 0 && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
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
            <p className="text-[10px] text-slate-400">
              {strength <= 1
                ? (language === "ar" ? "ضعيفة — أضف أرقاماً ورموزاً" : "Weak — add symbols and numbers")
                : strength <= 2
                ? (language === "ar" ? "متوسطة" : "Fair")
                : strength <= 3
                ? (language === "ar" ? "جيدة" : "Good")
                : (language === "ar" ? "قوية جداً" : "Strong")}
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
            className="mt-0.5 w-4 h-4 rounded border-purple-500/40 bg-slate-900/80 text-purple-600 focus:ring-purple-500/30"
          />
          <span className="text-xs text-slate-300 leading-tight">
            {language === "ar" ? (
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
        className="w-full h-11 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>{language === "ar" ? "جاري إنشاء الحساب..." : "Creating Account..."}</span>
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>{language === "ar" ? "إنشاء حساب طالب مجاني" : "Create Free Student Account"}</span>
            <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
          </>
        )}
      </button>

      {/* Switch to Login */}
      <div className="text-center text-xs text-slate-400 pt-2">
        {language === "ar" ? "لديك حساب بالفعل؟ " : "Already have an account? "}
        <Link
          href="/auth/login"
          className="font-semibold text-purple-400 hover:text-purple-300 underline underline-offset-4 transition-colors"
        >
          {language === "ar" ? "تسجيل الدخول" : "Sign In"}
        </Link>
      </div>
    </form>
  );
}
