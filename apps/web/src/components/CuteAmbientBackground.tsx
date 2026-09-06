import React from "react";

export function CuteAmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
    >
      {/* 1. Shifting Warm Pastel Ambient Orbs (Slow, graceful 32s-42s drift) */}
      <div
        className="animate-drift-a absolute -top-24 -left-20 h-96 w-96 rounded-full bg-gradient-to-br from-amber-200/30 to-rose-200/20 blur-3xl opacity-80"
      />
      <div
        className="animate-drift-b absolute top-1/4 -right-24 h-[440px] w-[440px] rounded-full bg-gradient-to-bl from-pink-200/25 via-rose-100/20 to-amber-100/15 blur-3xl opacity-80"
      />
      <div
        className="animate-drift-c absolute top-2/3 -left-28 h-[460px] w-[460px] rounded-full bg-gradient-to-tr from-emerald-100/30 via-teal-100/20 to-amber-100/15 blur-3xl opacity-75"
      />
      <div
        className="animate-drift-a absolute -bottom-20 right-1/4 h-[380px] w-[380px] rounded-full bg-gradient-to-t from-orange-100/25 via-rose-100/20 to-yellow-100/15 blur-3xl opacity-75"
      />

      {/* 2. Cute Twinkling Sparkles (✦, ✨, ⭐, ✧) with slow, serene timing (5.5s-7s) */}
      {/* Top Left Area */}
      <div
        className="animate-sparkle-twinkle absolute top-[7%] left-[6%] text-amber-400/65"
        style={{ animationDelay: "0s", fontSize: "20px" }}
      >
        ✦
      </div>
      <div
        className="animate-sparkle-spin absolute top-[13%] left-[16%] text-pink-400/55"
        style={{ animationDelay: "1.8s", fontSize: "15px" }}
      >
        ✨
      </div>
      <div
        className="animate-sparkle-twinkle absolute top-[22%] left-[9%] text-emerald-400/55"
        style={{ animationDelay: "3.2s", fontSize: "16px" }}
      >
        ✧
      </div>

      {/* Top Right Area */}
      <div
        className="animate-sparkle-twinkle absolute top-[6%] right-[8%] text-amber-400/70"
        style={{ animationDelay: "1.2s", fontSize: "22px" }}
      >
        ✨
      </div>
      <div
        className="animate-sparkle-spin absolute top-[15%] right-[15%] text-rose-400/60"
        style={{ animationDelay: "2.8s", fontSize: "18px" }}
      >
        ✦
      </div>
      <div
        className="animate-sparkle-twinkle absolute top-[27%] right-[6%] text-teal-400/55"
        style={{ animationDelay: "2.1s", fontSize: "16px" }}
      >
        ⭐
      </div>

      {/* Mid Left Area */}
      <div
        className="animate-sparkle-twinkle absolute top-[44%] left-[4%] text-amber-500/60"
        style={{ animationDelay: "4.0s", fontSize: "18px" }}
      >
        ✨
      </div>
      <div
        className="animate-sparkle-spin absolute top-[55%] left-[11%] text-pink-400/55"
        style={{ animationDelay: "2.5s", fontSize: "19px" }}
      >
        ✦
      </div>

      {/* Mid Right Area */}
      <div
        className="animate-sparkle-twinkle absolute top-[47%] right-[7%] text-orange-400/60"
        style={{ animationDelay: "0.8s", fontSize: "17px" }}
      >
        ✧
      </div>
      <div
        className="animate-sparkle-spin absolute top-[61%] right-[11%] text-emerald-500/55"
        style={{ animationDelay: "3.6s", fontSize: "15px" }}
      >
        ✨
      </div>

      {/* Bottom Area */}
      <div
        className="animate-sparkle-twinkle absolute top-[77%] left-[7%] text-rose-400/60"
        style={{ animationDelay: "1.6s", fontSize: "20px" }}
      >
        ✦
      </div>
      <div
        className="animate-sparkle-spin absolute top-[87%] left-[20%] text-amber-400/65"
        style={{ animationDelay: "4.5s", fontSize: "16px" }}
      >
        ⭐
      </div>
      <div
        className="animate-sparkle-twinkle absolute top-[81%] right-[8%] text-pink-400/60"
        style={{ animationDelay: "3.0s", fontSize: "21px" }}
      >
        ✨
      </div>
      <div
        className="animate-sparkle-spin absolute top-[91%] right-[18%] text-teal-400/55"
        style={{ animationDelay: "1.0s", fontSize: "15px" }}
      >
        ✧
      </div>

      {/* 3. Tiny Bokeh Motes (Subtle Floating Fairy Dust) */}
      <div
        className="animate-sparkle-twinkle absolute top-[18%] left-[38%] h-2 w-2 rounded-full bg-amber-300/35 blur-[0.5px]"
        style={{ animationDelay: "0.7s" }}
      />
      <div
        className="animate-sparkle-twinkle absolute top-[34%] right-[33%] h-2.5 w-2.5 rounded-full bg-pink-300/30 blur-[0.5px]"
        style={{ animationDelay: "2.2s" }}
      />
      <div
        className="animate-sparkle-twinkle absolute top-[66%] left-[42%] h-2 w-2 rounded-full bg-emerald-300/30 blur-[0.5px]"
        style={{ animationDelay: "3.8s" }}
      />
      <div
        className="animate-sparkle-twinkle absolute top-[74%] right-[39%] h-2 w-2 rounded-full bg-yellow-300/35 blur-[0.5px]"
        style={{ animationDelay: "1.9s" }}
      />
    </div>
  );
}
export default CuteAmbientBackground;
