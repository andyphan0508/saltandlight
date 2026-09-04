"use client";

import { Suspense, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Mail, Lock, Eye, EyeOff, AlertTriangle } from "@/components/Icons";

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

    const nextUrl = searchParams.get("next") || "/dashboard";
    router.push(nextUrl);
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#FAF7F0] px-4 py-12 overflow-hidden">
      {/* Decorative ambient orbs */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-amber-100/50 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full bg-mint-100/30 blur-3xl" />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-[430px] rounded-3xl border border-mint-200/80 bg-white/95 p-8 sm:p-10 shadow-2xl shadow-brand-forest/10 backdrop-blur-xl">
        {/* Brand Emblem Logo Centerpiece */}
        <div className="text-center">
          <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-3xl bg-white p-2.5 shadow-lg shadow-brand-forest/15 border-2 border-mint-200/80 transition-transform duration-300 hover:scale-105">
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

          <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-wider text-ink">
            Salt &amp; Light
          </h1>

          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-mint-100/80 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-brand-forest">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cổng Quản Trị Hệ Thống</span>
          </div>
        </div>

        {/* Unauthorized warning notice */}
        {searchParams.get("unauthorized") && (
          <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-xs text-amber-900 border border-amber-200 shadow-sm space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
              <span>Chưa được phân quyền quản trị</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Tài khoản hiện tại chưa được cấp quyền truy cập khu vực quản trị. Vui lòng đăng nhập với tài khoản chủ shop hoặc liên hệ quản trị viên.
            </p>
            <button
              type="button"
              onClick={async () => {
                const supabase = createSupabaseBrowserClient();
                await supabase.auth.signOut();
                router.replace("/login");
              }}
              className="mt-1 block w-full rounded-xl bg-amber-100 py-1.5 text-center text-xs font-bold text-amber-900 hover:bg-amber-200 transition-colors"
            >
              Đăng xuất và đăng nhập lại
            </button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-2xl bg-rose-50 p-3.5 text-xs font-medium text-rose-700 border border-rose-200">
            <AlertTriangle size={16} className="flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-1.5">
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
                className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 py-3 pl-10 pr-4 text-sm font-medium text-ink placeholder:text-slate-400 focus:border-brand-forest focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-forest/10 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-1.5">
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
                className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 py-3 pl-10 pr-11 text-sm font-medium text-ink placeholder:text-slate-400 focus:border-brand-forest focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-forest/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink transition-colors"
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
              className="w-full rounded-2xl bg-brand-forest py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-forest/25 hover:bg-brand-forest/95 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Đang xác thực…</span>
                </>
              ) : (
                <span>Đăng nhập trang quản trị</span>
              )}
            </button>
          </div>
        </form>

        {/* Footer info & Scripture */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-3">
          <p className="text-[11px] italic text-slate-500 leading-relaxed">
            &ldquo;Các con là muối của đất... là ánh sáng của thế gian.&rdquo;
            <br />
            <span className="font-semibold not-italic text-brand-forest uppercase tracking-wider text-[10px]">
              — Ma-thi-ơ 5:13-14
            </span>
          </p>

          <div>
            <a
              href="https://saltandlight-web.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-brand-forest transition-colors"
            >
              <span>← Quay lại website Salt &amp; Light</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
