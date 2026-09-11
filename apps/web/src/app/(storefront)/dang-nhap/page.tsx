"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@saltandlight/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useCustomer } from "@/lib/use-customer";
import { GoogleIcon, FacebookIcon, ArrowRight, ShieldCheck, ShoppingBag, Sparkles, Check } from "@/components/Icons";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get("next") || "/tai-khoan";
  const errorParam = searchParams?.get("error");

  const { customer, loading: authLoading } = useCustomer();
  const [oauthLoading, setOauthLoading] = useState<"google" | "facebook" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    errorParam === "auth"
      ? "Quá trình đăng nhập chưa hoàn tất hoặc bạn đã hủy xác thực. Vui lòng thử lại."
      : null
  );

  async function handleOAuth(provider: "google" | "facebook") {
    setErrorMessage(null);
    setOauthLoading(provider);

    try {
      const supabase = createSupabaseBrowserClient();
      const origin =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : "";

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (error) {
        setErrorMessage(error.message || "Không thể khởi động đăng nhập. Vui lòng thử lại.");
        setOauthLoading(null);
      }
    } catch (err: any) {
      console.error("OAuth error:", err);
      setErrorMessage("Có lỗi xảy ra khi kết nối máy chủ xác thực. Vui lòng thử lại.");
      setOauthLoading(null);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:py-16 animate-slide-up-fade">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="mx-auto relative h-16 w-16 overflow-hidden rounded-full bg-mint-100 p-2.5 shadow-sm border border-mint-200">
          <Image
            src="/images/logo-emblem.webp"
            alt="Salt & Light"
            fill
            className="object-contain p-2"
            priority
          />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-brand-forest">
          Thành Viên Salt &amp; Light
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase text-ink">
          Đăng Nhập Khách Hàng
        </h1>
        <p className="text-xs sm:text-sm text-ink/65 max-w-sm mx-auto leading-relaxed">
          Đăng nhập nhanh để quản lý đơn hàng đã mua, theo dõi tiến độ giao hàng và nhận ưu đãi đặc quyền.
        </p>
      </div>

      {/* Main Card */}
      <div className="mt-8 rounded-3xl bg-white p-6 sm:p-8 shadow-card border border-ink/5 space-y-6">
        {/* Error Alert */}
        {errorMessage && (
          <div className="rounded-2xl bg-rose-50 p-4 border border-rose-200 text-xs font-semibold text-rose-800 animate-pop-in">
            {errorMessage}
          </div>
        )}

        {/* If user is already logged in */}
        {!authLoading && customer ? (
          <div className="rounded-2xl bg-mint-50 p-5 border border-mint-200 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-forest text-white font-bold text-lg">
              {customer.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-ink/60">Bạn hiện đang đăng nhập với tài khoản</p>
              <h3 className="font-display text-base font-bold text-ink">{customer.fullName}</h3>
              {customer.email && <p className="text-xs text-ink/50">{customer.email}</p>}
            </div>
            <div className="pt-2">
              <Link href={next}>
                <Button variant="primary" size="md" className="w-full shadow-sm">
                  <span>Tiếp tục đến tài khoản</span>
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* OAuth Action Buttons */
          <div className="space-y-3">
            {/* Google Button */}
            <button
              type="button"
              disabled={oauthLoading !== null}
              onClick={() => handleOAuth("google")}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-ink/15 bg-white px-4 py-3 text-xs sm:text-sm font-bold text-ink shadow-xs hover:bg-ink/5 active-press transition-all disabled:opacity-60"
            >
              <GoogleIcon size={20} />
              <span>
                {oauthLoading === "google"
                  ? "Đang kết nối Google…"
                  : "Tiếp tục bằng tài khoản Google"}
              </span>
            </button>

            {/* Facebook Button */}
            <button
              type="button"
              disabled={oauthLoading !== null}
              onClick={() => handleOAuth("facebook")}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#1877F2] px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#166fe5] active-press transition-all disabled:opacity-60"
            >
              <FacebookIcon size={20} />
              <span>
                {oauthLoading === "facebook"
                  ? "Đang kết nối Facebook…"
                  : "Tiếp tục bằng tài khoản Facebook"}
              </span>
            </button>
          </div>
        )}

        {/* Benefits list */}
        <div className="border-t border-ink/10 pt-5 space-y-2.5">
          <div className="flex items-center gap-2.5 text-xs text-ink/75">
            <Check size={16} className="text-brand-forest flex-shrink-0" />
            <span>Tự động đồng bộ các đơn hàng bạn từng đặt trước đây bằng email.</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-ink/75">
            <Check size={16} className="text-brand-forest flex-shrink-0" />
            <span>Theo dõi trực quan hành trình đóng gói và vận chuyển bưu tá.</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-ink/75">
            <Check size={16} className="text-brand-forest flex-shrink-0" />
            <span>Bảo mật an toàn 100% qua Supabase OAuth, không lưu mật khẩu.</span>
          </div>
        </div>

        {/* Continue as Guest option */}
        <div className="border-t border-ink/10 pt-5 text-center">
          <Link
            href={next !== "/tai-khoan" ? next : "/san-pham"}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-ink/65 hover:text-brand-forest transition-colors hover:underline"
          >
            <ShoppingBag size={15} />
            <span>Tiếp tục mua sắm không cần đăng nhập →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-4 py-24 text-center animate-pulse">
          <div className="mx-auto h-16 w-16 rounded-full bg-mint-100" />
          <div className="mt-4 h-6 w-48 mx-auto rounded-2xl bg-ink/10" />
          <div className="mt-8 h-64 rounded-3xl bg-white shadow-card border border-ink/5" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
