"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpSchema, type SignUpInput } from "@/schemas/auth.schema";
import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import Link from "next/link";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(SignUpSchema),
  });

  const onSubmit = async (data: SignUpInput) => {
    setLoading(true);
    try {
      const res = await signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (res.error) {
        toast.error(res.error.message || "Registration failed. Please try again.");
      } else {
        toast.success("Account created successfully!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Full Name (الاسم الكامل)
        </label>
        <Input
          type="text"
          placeholder="e.g. Ahmed Mahmoud"
          {...register("name")}
          disabled={loading}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Email Address (البريد الإلكتروني)
        </label>
        <Input
          type="email"
          placeholder="student@example.com"
          {...register("email")}
          disabled={loading}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Password (كلمة المرور - 8 أحرف على الأقل)
        </label>
        <Input
          type="password"
          placeholder="••••••••"
          {...register("password")}
          disabled={loading}
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" disabled={loading} className="w-full h-10">
        <UserPlus className="h-4 w-4 mr-2" />
        {loading ? "Creating Account..." : "Create Free Student Account"}
      </Button>

      <div className="text-center text-xs text-slate-500">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-blue-600 hover:underline">
          Sign In
        </Link>
      </div>
    </form>
  );
}
