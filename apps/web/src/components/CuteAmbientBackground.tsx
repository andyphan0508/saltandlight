import React from "react";

export function CuteAmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
    >
      {/* 1. Shifting Warm Pastel Ambient Orbs (Soft Mesh) */}
      <div
        className="animate-drift-a absolute -top-24 -left-20 h-96 w-96 rounded-full bg-gradient-to-br from-amber-200/35 to-rose-200/25 blur-3xl"
      />
      <div
        className="animate-drift-b absolute top-1/4 -right-24 h-[420px] w-[420px] rounded-full bg-gradient-to-bl from-pink-200/30 via-rose-100/25 to-amber-100/20 blur-3xl"
      />
      <div
        className="animate-drift-c absolute top-2/3 -left-28 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-emerald-100/35 via-teal-100/25 to-amber-100/20 blur-3xl"
      />
      <div
        className="animate-drift-a absolute -bottom-20 right-1/4 h-[380px] w-[380px] rounded-full bg-gradient-to-t from-orange-100/30 via-rose-100/25 to-yellow-100/20 blur-3xl"
      />

      {/* 2. Cute Twinkling Sparkles (✦, ✨, ⭐, ✧) */}
      {/* Top Left Area */}
      <div
        className="animate-sparkle-twinkle absolute top-[8%] left-[6%] text-amber-400/70"
        style={{ animationDelay: "0s", fontSize: "19px" }}
      >
        ✦
      </div>
      <div
        className="animate-sparkle-spin absolute top-[14%] left-[18%] text-pink-400/60"
        style={{ animationDelay: "1.2s", fontSize: "14px" }}
      >
        ✨
      </div>
      <div
        className="animate-sparkle-twinkle absolute top-[22%] left-[10%] text-emerald-400/60"
        style={{ animationDelay: "2.4s", fontSize: "16px" }}
      >
        ✧
      </div>

      {/* Top Right Area */}
      <div
        className="animate-sparkle-twinkle absolute top-[6%] right-[8%] text-amber-400/75"
        style={{ animationDelay: "0.8s", fontSize: "22px" }}
      >
        ✨
      </div>
      <div
        className="animate-sparkle-spin absolute top-[16%] right-[16%] text-rose-400/65"
        style={{ animationDelay: "2.1s", fontSize: "18px" }}
      >
        ✦
      </div>
      <div
        className="animate-sparkle-twinkle absolute top-[28%] right-[5%] text-teal-400/60"
        style={{ animationDelay: "1.5s", fontSize: "15px" }}
      >
        ⭐
      </div>

      {/* Mid Left Area */}
      <div
        className="animate-sparkle-twinkle absolute top-[45%] left-[4%] text-amber-500/65"
        style={{ animationDelay: "3.1s", fontSize: "18px" }}
      >
        ✨
      </div>
      <div
        className="animate-sparkle-spin absolute top-[56%] left-[12%] text-pink-400/60"
        style={{ animationDelay: "1.9s", fontSize: "20px" }}
      >
        ✦
      </div>

      {/* Mid Right Area */}
      <div
        className="animate-sparkle-twinkle absolute top-[48%] right-[7%] text-orange-400/65"
        style={{ animationDelay: "0.4s", fontSize: "17px" }}
      >
        ✧
      </div>
      <div
        className="animate-sparkle-spin absolute top-[62%] right-[12%] text-emerald-500/60"
        style={{ animationDelay: "2.7s", fontSize: "15px" }}
      >
        ✨
      </div>

      {/* Bottom Area */}
      <div
        className="animate-sparkle-twinkle absolute top-[78%] left-[8%] text-rose-400/65"
        style={{ animationDelay: "1.1s", fontSize: "20px" }}
      >
        ✦
      </div>
      <div
        className="animate-sparkle-spin absolute top-[88%] left-[22%] text-amber-400/70"
        style={{ animationDelay: "3.5s", fontSize: "16px" }}
      >
        ⭐
      </div>
      <div
        className="animate-sparkle-twinkle absolute top-[82%] right-[9%] text-pink-400/65"
        style={{ animationDelay: "2.3s", fontSize: "22px" }}
      >
        ✨
      </div>
      <div
        className="animate-sparkle-spin absolute top-[92%] right-[20%] text-teal-400/60"
        style={{ animationDelay: "0.7s", fontSize: "15px" }}
      >
        ✧
      </div>

      {/* 3. Tiny Bokeh Motes (Subtle Floating Fairy Dust) */}
      <div
        className="animate-sparkle-twinkle absolute top-[20%] left-[40%] h-2 w-2 rounded-full bg-amber-300/40 blur-[0.5px]"
        style={{ animationDelay: "0.5s" }}
      />
      <div
        className="animate-sparkle-twinkle absolute top-[35%] right-[35%] h-2.5 w-2.5 rounded-full bg-pink-300/35 blur-[0.5px]"
        style={{ animationDelay: "1.7s" }}
      />
      <div
        className="animate-sparkle-twinkle absolute top-[68%] left-[45%] h-2 w-2 rounded-full bg-emerald-300/35 blur-[0.5px]"
        style={{ animationDelay: "2.9s" }}
      />
      <div
        className="animate-sparkle-twinkle absolute top-[75%] right-[42%] h-2 w-2 rounded-full bg-yellow-300/40 blur-[0.5px]"
        style={{ animationDelay: "1.3s" }}
      />
    </div>
  );
}
export default CuteAmbientBackground;
