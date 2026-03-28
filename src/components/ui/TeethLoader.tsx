"use client";

/**
 * TeethLoader — animated loading screen with bouncing teeth illustration
 * and sparkle/bubble effects. Used on the jadwal & booking pages.
 */

export default function TeethLoader({ message = "Tunggu yaa, kami cek terlebih dahulu" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 select-none">
      {/* ── Animated SVG ── */}
      <div className="relative mb-6">
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-full animate-ping"
          style={{
            background: "radial-gradient(circle, rgba(253,172,172,0.22) 0%, transparent 70%)",
            animationDuration: "2s",
          }} />

        {/* Main SVG card */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full flex items-center justify-center"
          style={{
            background: "#e6e7ee",
            border: "1px solid rgba(255,255,255,0.52)",
            boxShadow: "8px 8px 16px rgba(163,177,198,0.22), -8px -8px 16px rgba(255,255,255,0.56)",
            animation: "teethBounce 1.6s ease-in-out infinite",
          }}>

          <svg viewBox="0 0 160 140" xmlns="http://www.w3.org/2000/svg" className="w-32 h-28 sm:w-36 sm:h-32">

            {/* ── Top teeth row ── */}
            {/* Gum base top */}
            <rect x="10" y="18" width="140" height="18" rx="9" fill="#FDACAC" opacity="0.82" />

            {/* Top tooth 1 */}
            <rect x="14" y="28" width="22" height="30" rx="5" fill="white" stroke="#FDACAC" strokeWidth="1.5" />
            <rect x="17" y="30" width="6" height="12" rx="3" fill="rgba(93,104,138,0.07)" />

            {/* Top tooth 2 */}
            <rect x="39" y="26" width="24" height="34" rx="5" fill="white" stroke="#FEC3C3" strokeWidth="1.5" />
            <rect x="42" y="28" width="6" height="13" rx="3" fill="rgba(93,104,138,0.07)" />

            {/* Top tooth 3 (center big) */}
            <rect x="66" y="24" width="28" height="38" rx="6" fill="white" stroke="#FDACAC" strokeWidth="1.5" />
            <rect x="70" y="26" width="7" height="15" rx="3" fill="rgba(93,104,138,0.07)" />

            {/* Top tooth 4 */}
            <rect x="97" y="26" width="24" height="34" rx="5" fill="white" stroke="#FEC3C3" strokeWidth="1.5" />
            <rect x="100" y="28" width="6" height="13" rx="3" fill="rgba(93,104,138,0.07)" />

            {/* Top tooth 5 */}
            <rect x="124" y="28" width="22" height="30" rx="5" fill="white" stroke="#FDACAC" strokeWidth="1.5" />
            <rect x="127" y="30" width="6" height="12" rx="3" fill="rgba(93,104,138,0.07)" />

            {/* ── Gap line ── */}
            <line x1="10" y1="70" x2="150" y2="70" stroke="rgba(253,172,172,0.28)" strokeWidth="1" strokeDasharray="4 3" />

            {/* ── Bottom teeth row ── */}
            {/* Gum base bottom */}
            <rect x="10" y="94" width="140" height="18" rx="9" fill="#FEC3C3" opacity="0.82" />

            {/* Bottom tooth 1 */}
            <rect x="16" y="72" width="20" height="26" rx="5" fill="white" stroke="#FEC3C3" strokeWidth="1.5" />
            <rect x="19" y="74" width="5" height="10" rx="2.5" fill="rgba(93,104,138,0.07)" />

            {/* Bottom tooth 2 */}
            <rect x="40" y="70" width="22" height="28" rx="5" fill="white" stroke="#FDACAC" strokeWidth="1.5" />
            <rect x="43" y="72" width="6" height="11" rx="3" fill="rgba(93,104,138,0.07)" />

            {/* Bottom tooth 3 (center) */}
            <rect x="66" y="68" width="28" height="32" rx="6" fill="white" stroke="#FEC3C3" strokeWidth="1.5" />
            <rect x="70" y="70" width="7" height="13" rx="3" fill="rgba(93,104,138,0.07)" />

            {/* Bottom tooth 4 */}
            <rect x="98" y="70" width="22" height="28" rx="5" fill="white" stroke="#FDACAC" strokeWidth="1.5" />
            <rect x="101" y="72" width="6" height="11" rx="3" fill="rgba(93,104,138,0.07)" />

            {/* Bottom tooth 5 */}
            <rect x="124" y="72" width="20" height="26" rx="5" fill="white" stroke="#FEC3C3" strokeWidth="1.5" />
            <rect x="127" y="74" width="5" height="10" rx="2.5" fill="rgba(93,104,138,0.07)" />

            {/* ── Sparkle accents ── */}
            <g style={{ animation: "sparkle1 2s ease-in-out infinite" }}>
              <circle cx="148" cy="14" r="3" fill="#FDACAC" opacity="0.68" />
              <circle cx="148" cy="14" r="1.5" fill="white" />
            </g>
            <g style={{ animation: "sparkle2 2.4s ease-in-out infinite" }}>
              <circle cx="12" cy="12" r="2.5" fill="#FEC3C3" opacity="0.78" />
              <circle cx="12" cy="12" r="1" fill="white" />
            </g>
            <g style={{ animation: "sparkle1 1.8s ease-in-out infinite 0.5s" }}>
              <circle cx="80" cy="10" r="2" fill="#5D688A" opacity="0.4" />
            </g>

            {/* ── Toothbrush ── */}
            <g style={{ animation: "brush 1.6s ease-in-out infinite", transformOrigin: "130px 115px" }}>
              {/* Handle */}
              <rect x="118" y="108" width="28" height="10" rx="5" fill="#5D688A" opacity="0.85" />
              {/* Head */}
              <rect x="92" y="106" width="28" height="14" rx="5" fill="#7a88b0" />
              {/* Bristles */}
              {[95,100,105,110,115].map((x) => (
                <line key={x} x1={x} y1="106" x2={x} y2="100" stroke="white" strokeWidth="2" strokeLinecap="round" />
              ))}
            </g>

            {/* ── Bubbles (toothpaste foam) ── */}
            <circle cx="88" cy="96" r="4" fill="white" opacity="0.6" style={{ animation: "bubble 1.6s ease-in-out infinite" }} />
            <circle cx="80" cy="91" r="3" fill="white" opacity="0.5" style={{ animation: "bubble 1.6s ease-in-out infinite 0.3s" }} />
            <circle cx="95" cy="89" r="2.5" fill="white" opacity="0.4" style={{ animation: "bubble 1.6s ease-in-out infinite 0.6s" }} />

            {/* ── Shine dots on teeth ── */}
            <circle cx="78" cy="32" r="2.5" fill="white" opacity="0.8" />
            <circle cx="82" cy="28" r="1.5" fill="white" opacity="0.6" />
          </svg>
        </div>

        {/* Floating mini hearts / stars */}
        <div className="absolute -top-2 -right-2 text-lg" style={{ animation: "floatUp 2s ease-in-out infinite" }}>✨</div>
        <div className="absolute -bottom-1 -left-3 text-base" style={{ animation: "floatUp 2.4s ease-in-out infinite 0.8s" }}>🦷</div>
        <div className="absolute top-2 -left-4 text-sm" style={{ animation: "floatUp 2s ease-in-out infinite 0.4s" }}>💧</div>
      </div>

      {/* ── Text ── */}
      <div className="text-center px-4">
        <p className="font-bold text-base sm:text-lg text-[#3a3f52] mb-1">
          {message} 🦷
        </p>
        {/* Animated dots */}
        <div className="flex items-center justify-center gap-1 mt-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full"
              style={{
                background: "#4e6785",
                animation: `dotBounce 1.2s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }} />
          ))}
        </div>
        <p className="text-xs text-[#5D688A]/50 mt-3">Mengambil data jadwal dari database...</p>
      </div>

      {/* ── Keyframe injection ── */}
      <style>{`
        @keyframes teethBounce {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50%       { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes brush {
          0%, 100% { transform: translateX(0px); }
          25%       { transform: translateX(-6px); }
          75%       { transform: translateX(4px); }
        }
        @keyframes bubble {
          0%   { transform: translateY(0) scale(1); opacity: 0.6; }
          100% { transform: translateY(-18px) scale(0); opacity: 0; }
        }
        @keyframes sparkle1 {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50%       { transform: scale(1.6); opacity: 1; }
        }
        @keyframes sparkle2 {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
          50%       { transform: scale(1.4) rotate(20deg); opacity: 1; }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px); opacity: 1; }
          50%       { transform: translateY(-8px); opacity: 0.7; }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(1);   opacity: 0.4; }
          40%            { transform: scale(1.5); opacity: 1;   }
        }
      `}</style>
    </div>
  );
}

