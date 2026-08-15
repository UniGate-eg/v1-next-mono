"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignInSchema, type SignInInput } from "@/schemas/auth.schema";
import { signIn } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LogIn } from "lucide-react";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(SignInSchema),
  });

  const onSubmit = async (data: SignInInput) => {
    setLoading(true);
    try {
      const res = await signIn.email({
        email: data.email,
        password: data.password,
      });

      if (res.error) {
        toast.error(res.error.message || "Failed to sign in. Please check your credentials.");
      } else {
        toast.success("Welcome back!");
        router.push(redirectUrl);
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
          Email Address
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
          Password
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
        <LogIn className="h-4 w-4 mr-2" />
        {loading ? "Signing In..." : "Sign In to UniCompass"}
      </Button>

      <div className="text-center text-xs text-slate-500">
        Don&apos;t have a student account?{" "}
        <Link href="/auth/register" className="font-semibold text-blue-600 hover:underline">
          Create Account
        </Link>
      </div>
    </form>
  );
}
