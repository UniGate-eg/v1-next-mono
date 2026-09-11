"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { signIn, signUp } from "@/lib/auth-client";
import posthog from "posthog-js";
import { getSafeRedirectUrl } from "@/lib/auth/safe-redirect";
import { useLanguage } from "@/contexts/LanguageContext";

interface ModernLoginSignUpProps {
  defaultMode?: "login" | "signup";
}

export default function ModernLoginSignUp({ defaultMode }: ModernLoginSignUpProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || searchParams.get("callbackUrl");
  const targetUrl = getSafeRedirectUrl(rawRedirect, "/dashboard");

  const { language } = useLanguage();
  const isAr = language === "ar";

  // Determine mode based on prop or current URL path
  const isRegisterPath = pathname === "/auth/register" || pathname?.endsWith("/register");
  const initialMode = defaultMode ? defaultMode === "login" : !isRegisterPath;
  const [isLogin, setIsLogin] = useState<boolean>(initialMode);
  const [loading, setLoading] = useState<boolean>(false);

  // Sync state whenever pathname changes
  useEffect(() => {
    if (defaultMode) {
      setIsLogin(defaultMode === "login");
    } else {
      setIsLogin(!isRegisterPath);
    }
  }, [pathname, defaultMode, isRegisterPath]);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    let active = true;
    let renderer: any;
    let geometry: any;
    let material: any;
    let scene: any;
    let camera: any;
    let animationId: number;

    const initThree = (THREE: any) => {
      if (!canvasRef.current || !active) return;
      const canvas = canvasRef.current;
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);

      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      const uniforms = {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(window.innerWidth * 2, window.innerHeight * 2) },
        u_opacities: { value: [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1.0] },
        u_colors: {
          value: [
            new THREE.Vector3(1, 1, 1),
            new THREE.Vector3(1, 1, 1),
            new THREE.Vector3(1, 1, 1),
            new THREE.Vector3(1, 1, 1),
            new THREE.Vector3(1, 1, 1),
            new THREE.Vector3(1, 1, 1),
          ],
        },
        u_total_size: { value: 20.0 },
        u_dot_size: { value: 6.0 },
        u_reverse: { value: 0 },
      };

      material = new THREE.ShaderMaterial({
        vertexShader: `
          precision mediump float;
          uniform vec2 u_resolution;
          out vec2 fragCoord;
          void main() {
            gl_Position = vec4(position, 1.0);
            fragCoord = (position.xy + 1.0) * 0.5 * u_resolution;
            fragCoord.y = u_resolution.y - fragCoord.y;
          }
        `,
        fragmentShader: `
          precision mediump float;
          in vec2 fragCoord;

          uniform float u_time;
          uniform float u_opacities[10];
          uniform vec3 u_colors[6];
          uniform float u_total_size;
          uniform float u_dot_size;
          uniform vec2 u_resolution;
          uniform int u_reverse;

          out vec4 fragColor;

          float PHI = 1.61803398874989484820459;
          float random(vec2 xy) {
              return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
          }

          void main() {
              vec2 st = fragCoord.xy;
              st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));
              st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));

              float opacity = step(0.0, st.x) * step(0.0, st.y);

              vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));

              float frequency = 5.0;
              float show_offset = random(st2);
              float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency));
              opacity *= u_opacities[int(rand * 10.0)];
              opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
              opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));

              vec3 color = u_colors[int(show_offset * 6.0)];

              float animation_speed_factor = 3.0;
              vec2 center_grid = u_resolution / 2.0 / u_total_size;
              float dist_from_center = distance(center_grid, st2);

              float timing_offset_intro = dist_from_center * 0.01 + (random(st2) * 0.15);

              float current_timing_offset = timing_offset_intro;
              opacity *= step(current_timing_offset, u_time * animation_speed_factor);
              opacity *= clamp((1.0 - step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);

              fragColor = vec4(color, opacity);
              fragColor.rgb *= fragColor.a;
          }
        `,
        uniforms: uniforms,
        glslVersion: THREE.GLSL3,
        blending: THREE.CustomBlending,
        blendSrc: THREE.SrcAlphaFactor,
        blendDst: THREE.OneFactor,
        transparent: true,
      });

      geometry = new THREE.PlaneGeometry(2, 2);
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const startTime = performance.now();
      const animate = () => {
        if (!active) return;
        animationId = requestAnimationFrame(animate);
        uniforms.u_time.value = (performance.now() - startTime) / 1000.0;
        renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        if (!renderer) return;
        renderer.setSize(window.innerWidth, window.innerHeight);
        uniforms.u_resolution.value.set(window.innerWidth * 2, window.innerHeight * 2);
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    };

    if ((window as any).THREE) {
      const cleanUp = initThree((window as any).THREE);
      return () => {
        active = false;
        if (cleanUp) cleanUp();
        if (animationId) cancelAnimationFrame(animationId);
        if (renderer) renderer.dispose();
        if (geometry) geometry.dispose();
        if (material) material.dispose();
      };
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      script.async = true;
      script.onload = () => {
        if ((window as any).THREE && active) {
          initThree((window as any).THREE);
        }
      };
      document.head.appendChild(script);
    }

    return () => {
      active = false;
      if (animationId) cancelAnimationFrame(animationId);
      if (renderer) renderer.dispose();
      if (geometry) geometry.dispose();
      if (material) material.dispose();
    };
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(isAr ? "يرجى تعبئة جميع الحقول المطلوبة." : "Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await signIn.email({
          email,
          password,
        });

        if (res.error) {
          posthog.capture("login_failed", {
            provider: "email",
            reason: res.error.message || "unknown",
          });
          toast.error(
            isAr
              ? "تعذر تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور."
              : res.error.message || "Invalid email or password."
          );
        } else {
          toast.success(isAr ? "أهلاً بك مجدداً في UniGate!" : "Welcome back to UniGate!");
          // Identify the authenticated user in PostHog
          posthog.identify(res.data?.user?.id ?? email, {
            name: res.data?.user?.name,
          });
          posthog.capture("user_logged_in", {
            provider: "email",
          });
          setTimeout(() => {
            window.location.href = targetUrl;
          }, 300);
        }
      } else {
        if (!name) {
          toast.error(isAr ? "يرجى إدخال اسمك الكامل." : "Please enter your name.");
          setLoading(false);
          return;
        }

        const res = await signUp.email({
          name,
          email,
          password,
        });

        if (res.error) {
          posthog.capture("signup_failed", {
            provider: "email",
            reason: res.error.message || "unknown",
          });
          toast.error(
            isAr
              ? "تعذر إنشاء الحساب. قد يكون البريد الإلكتروني مسجلاً مسبقاً."
              : res.error.message || "Registration failed."
          );
        } else {
          toast.success(isAr ? "تم إنشاء الحساب بنجاح! مرحباً بك في UniGate." : "Account created successfully!");
          // Identify the new user in PostHog and track signup
          posthog.identify(res.data?.user?.id ?? email, {
            name,
          });
          posthog.capture("user_signed_up", {
            provider: "email",
          });
          setTimeout(() => {
            window.location.href = targetUrl;
          }, 300);
        }
      }
    } catch (error) {
      console.error("Email auth request failed", error);
      posthog.captureException(error);
      posthog.capture(isLogin ? "login_failed" : "signup_failed", {
        provider: "email",
        reason: "exception",
      });
      toast.error(isAr ? "حدث خطأ غير متوقع. يرجى المحاولة مجدداً." : "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: "Google") => {
    posthog.capture("social_auth_initiated", {
      provider: provider.toLowerCase(),
      mode: isLogin ? "login" : "signup",
    });
    try {
      const providerId = provider.toLowerCase() as "google";
      await signIn.social({
        provider: providerId,
        callbackURL: targetUrl,
      });
    } catch {
      toast.error(
        isAr
          ? `تعذر الاتصال بمزود ${provider}. يرجى التحقق من الإعدادات.`
          : `Failed to connect to ${provider}. Please check provider configuration.`
      );
    }
  };

  /* ─── shared styles ─── */
  const socialBtn: React.CSSProperties = {
    width: "100%",
    padding: "0.65rem",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.03)",
    color: "#fff",
    fontWeight: 500,
    fontSize: "0.875rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    marginBottom: "0.5rem",
    transition: "background 0.2s ease, border-color 0.2s ease",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem 0.95rem",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "#0a0a0f",
    color: "#fff",
    fontSize: "0.875rem",
    outline: "none",
    textAlign: isAr ? "right" : "left",
    direction: isAr ? "rtl" : "ltr",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  };

  /* ─── Google ─── */
  const GoogleIcon = (
    <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, flexShrink: 0 }} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );

  const Logo = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "1rem",
      }}
    >
      <img
        src={isAr ? "/logo_ar.jpeg" : "/logo_en.jpeg"}
        alt={isAr ? "بوابة الجامعة" : "UniGate Egypt"}
        style={{
          height: "60px",
          borderRadius: "12px",
          objectFit: "contain",
          boxShadow: "0 4px 20px rgba(124, 58, 237, 0.35)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      />
    </div>
  );

  const FooterText = (
    <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "#888", lineHeight: 1.6, textAlign: "center" }}>
      {isAr ? (
        <>
          بالمتابعة، فإنك توافق على{" "}
          <Link href="/about" style={{ color: "#c084fc", textDecoration: "underline" }}>
            شروط الاستخدام
          </Link>{" "}
          و{" "}
          <Link href="/about" style={{ color: "#c084fc", textDecoration: "underline" }}>
            سياسة الخصوصية
          </Link>
          .
        </>
      ) : (
        <>
          By proceeding, you agree to UniGate Egypt&apos;s{" "}
          <Link href="/about" style={{ color: "#c084fc", textDecoration: "underline" }}>
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/about" style={{ color: "#c084fc", textDecoration: "underline" }}>
            Privacy Policy
          </Link>
          .
        </>
      )}
    </div>
  );

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "#000",
        color: "#fff",
        paddingTop: "120px",
        paddingBottom: "80px",
        paddingLeft: "1rem",
        paddingRight: "1rem",
        direction: isAr ? "rtl" : "ltr",
        fontFamily: isAr ? "'Cairo', sans-serif" : "'Plus Jakarta Sans', 'Inter', sans-serif",
      }}
    >
      {/* WebGL Dot canvas */}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }} />

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: "radial-gradient(circle at center, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.95) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Modal card */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          background: "#111115",
          borderRadius: 16,
          padding: "2.25rem 2rem",
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 10px 50px rgba(0,0,0,0.9), 0 0 40px rgba(124, 58, 237, 0.15)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Link
          href="/"
          style={{
            alignSelf: "flex-start",
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
            fontSize: "0.8rem",
            color: "#a1a1aa",
            textDecoration: "none",
            marginBottom: "1rem",
            padding: "0.4rem 0.75rem",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.03)",
            transition: "background 0.2s ease, color 0.2s ease, border-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(124, 58, 237, 0.15)";
            e.currentTarget.style.color = "#c084fc";
            e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.03)";
            e.currentTarget.style.color = "#a1a1aa";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
          }}
        >
          <span style={{ transform: isAr ? "scaleX(-1)" : undefined }}>←</span>
          {isAr ? "العودة إلى الصفحة الرئيسية" : "Back to Home Page"}
        </Link>
        {isLogin ? (
          /* ── SIGN IN FORM ── */
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            {Logo}
            <h1 style={{ fontSize: "1.45rem", fontWeight: 700, marginBottom: "0.25rem", letterSpacing: "-0.025em" }}>
              {isAr ? "تسجيل الدخول إلى UniGate" : "Sign in to UniGate"}
            </h1>
            <p style={{ fontSize: "0.85rem", color: "#888", marginBottom: "1.25rem", lineHeight: 1.5 }}>
              {isAr
                ? "سجّل دخولك للوصول إلى خطتك الأكاديمية والجامعات المحفوظة."
                : "Access your admissions roadmap and saved universities."}
            </p>

            <div style={{ height: 1, background: "rgba(255,255,255,0.08)", width: "100%", margin: "1.1rem 0" }} />

            <button style={socialBtn} onClick={() => handleSocialAuth("Google")}>
              {GoogleIcon}
              <span>{isAr ? "المتابعة باستخدام Google" : "Continue with Google"}</span>
            </button>

            <div style={{ marginTop: "1.25rem", fontSize: "0.875rem", color: "#888" }}>
              {isAr ? "ليس لديك حساب بعد؟ " : "Don't have an account? "}
              <Link
                href="/auth/register"
                onClick={() => setIsLogin(false)}
                style={{
                  color: "#c084fc",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: "inherit",
                  textDecoration: "underline",
                }}
              >
                {isAr ? "إنشاء حساب" : "Sign Up"}
              </Link>
            </div>
            {FooterText}
          </div>
        ) : (
          /* ── SIGN UP FORM ── */
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            {Logo}
            <h1 style={{ fontSize: "1.45rem", fontWeight: 700, marginBottom: "0.25rem", letterSpacing: "-0.025em" }}>
              {isAr ? "إنشاء حساب في UniGate" : "Create an Account"}
            </h1>
            <p style={{ fontSize: "0.85rem", color: "#888", marginBottom: "1.25rem", lineHeight: 1.5 }}>
              {isAr
                ? "أنشئ حسابك المجاني لمتابعة مواعيد القبول والتنسيق."
                : "Create a free account to track university applications."}
            </p>

            <div style={{ height: 1, background: "rgba(255,255,255,0.08)", width: "100%", margin: "1.1rem 0" }} />

            <button style={socialBtn} onClick={() => handleSocialAuth("Google")}>
              {GoogleIcon}
              <span>{isAr ? "التسجيل باستخدام Google" : "Sign up with Google"}</span>
            </button>

            <div style={{ marginTop: "1.25rem", fontSize: "0.875rem", color: "#888" }}>
              {isAr ? "لديك حساب بالفعل؟ " : "Already have an account? "}
              <Link
                href="/auth/login"
                onClick={() => setIsLogin(true)}
                style={{
                  color: "#c084fc",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: "inherit",
                  textDecoration: "underline",
                }}
              >
                {isAr ? "تسجيل الدخول" : "Sign In"}
              </Link>
            </div>
            {FooterText}
          </div>
        )}
      </div>
    </div>
  );
}
