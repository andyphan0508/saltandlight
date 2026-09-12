"use client";

import { Suspense, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Mail, Lock, Eye, EyeOff, AlertTriangle } from "@/components/admin/Icons";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fbf9f4]">
          <div className="h-8 w-8 rounded-full border-3 border-brand-forest/30 border-t-brand-forest animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError("Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.");
      return;
    }

    const nextUrl = searchParams.get("next") || "/admin/dashboard";
    router.push(nextUrl);
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[#091512] via-[#0e1d19] to-[#0a1210] px-4 py-12 overflow-hidden select-none">
      {/* ── Radiant Ambient Glow Orbs ─────────────────────────────────── */}
      <div className="pointer-events-none absolute -top-44 -right-44 h-[550px] w-[550px] rounded-full bg-emerald-500/20 blur-[130px] animate-pulse" style={{ animationDuration: "8s" }} />
      <div className="pointer-events-none absolute -bottom-44 -left-44 h-[550px] w-[550px] rounded-full bg-amber-500/15 blur-[130px] animate-pulse" style={{ animationDuration: "10s" }} />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[750px] w-[750px] rounded-full bg-teal-400/10 blur-[160px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

      {/* ── Main Glassmorphism Card ───────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-[440px] rounded-[32px] border border-white/30 bg-white/95 p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5),0_0_50px_rgba(16,185,129,0.12)] backdrop-blur-2xl transition-all duration-300 hover:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.6),0_0_60px_rgba(16,185,129,0.18)]">
        {/* Brand Emblem Logo Centerpiece with Glow Halo */}
        <div className="text-center">
          <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-b from-white to-slate-50 p-2.5 shadow-[0_12px_30px_-5px_rgba(16,185,129,0.25)] border-2 border-emerald-500/30 transition-all duration-300 hover:scale-105 hover:rotate-1 ring-4 ring-emerald-500/10">
            <div className="relative h-full w-full">
              <Image
                src="/images/logo-emblem.webp"
                alt="Salt & Light Logo"
                fill
                priority
                sizes="96px"
                className="object-contain"
              />
            </div>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wider text-slate-900">
            Salt &amp; Light
          </h1>

          <div className="mt-2.5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 via-mint-100 to-emerald-50 px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-brand-forest border border-emerald-200/80 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-sm" />
            <span>Cổng Quản Trị Hệ Thống</span>
          </div>
        </div>

        {/* Unauthorized warning notice */}
        {searchParams.get("unauthorized") && (
          <div className="mt-6 rounded-2xl bg-amber-50/90 p-4 text-xs text-amber-900 border border-amber-200 shadow-xs space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
              <span>Chưa được phân quyền quản trị</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Tài khoản hiện tại chưa được cấp quyền truy cập khu vực quản trị. Vui lòng đăng nhập với tài khoản quản trị viên.
            </p>
            <button
              type="button"
              onClick={async () => {
                const supabase = createSupabaseBrowserClient();
                await supabase.auth.signOut();
                router.replace("/admin/login");
              }}
              className="mt-1 block w-full rounded-xl bg-amber-100 py-2 text-center text-xs font-bold text-amber-900 hover:bg-amber-200 transition-colors shadow-xs"
            >
              Đăng xuất và thử lại
            </button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-6 flex items-center gap-2.5 rounded-2xl bg-rose-50/90 p-3.5 text-xs font-semibold text-rose-700 border border-rose-200/80 shadow-xs animate-fade-in">
            <AlertTriangle size={16} className="flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4.5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email đăng nhập
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Mail size={16} />
              </div>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@saltandlight.vn"
                className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/70 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-brand-forest focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-forest/15 transition-all shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Lock size={16} />
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/70 py-3 pl-10 pr-11 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-brand-forest focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-forest/15 transition-all shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1"
                tabIndex={-1}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-brand-forest via-emerald-800 to-brand-forest py-3.5 text-sm font-bold text-white shadow-[0_10px_25px_-5px_rgba(27,67,50,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(27,67,50,0.5)] hover:brightness-105 active:scale-[0.99] disabled:opacity-70 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Đang xác thực bảo mật…</span>
                </>
              ) : (
                <span>Đăng nhập trang quản trị</span>
              )}
            </button>
          </div>
        </form>

        {/* Footer info & Scripture */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-3">
          <p className="text-xs italic text-slate-500 leading-relaxed font-serif">
            &ldquo;Các con là muối của đất... là ánh sáng của thế gian.&rdquo;
            <br />
            <span className="font-sans font-bold not-italic text-brand-forest uppercase tracking-wider text-[10px]">
              — Ma-thi-ơ 5:13-14
            </span>
          </p>

          <div>
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-brand-forest transition-colors group"
            >
              <span className="transition-transform group-hover:-translate-x-0.5">←</span>
              <span>Quay lại website Salt &amp; Light</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
