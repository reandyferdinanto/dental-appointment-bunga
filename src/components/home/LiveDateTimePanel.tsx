"use client";

import { useEffect, useState } from "react";
import { Clock3, MapPin } from "lucide-react";

function getJakartaNow() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
}

function formatTimeParts(date: Date) {
  return {
    hours: String(date.getHours()).padStart(2, "0"),
    minutes: String(date.getMinutes()).padStart(2, "0"),
    seconds: String(date.getSeconds()).padStart(2, "0"),
  };
}

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function formatGreeting(date: Date) {
  const hour = date.getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

function FlipDigit({
  value,
  accent,
}: {
  value: string;
  accent: string;
}) {
  return (
    <div
      className="relative h-[3.35rem] w-[2.5rem] overflow-hidden rounded-[0.95rem] sm:h-[3.7rem] sm:w-[2.85rem]"
      style={{
        border: `1px solid ${accent}35`,
        boxShadow:
          "6px 6px 14px rgba(163,177,198,0.18), -6px -6px 14px rgba(255,255,255,0.82)",
      }}
    >
      <div className="flip-base flip-top" />
      <div className="flip-base flip-bottom" />
      <div className="flip-divider" />
      <div key={value} className="flip-value text-[1.38rem] sm:text-[1.62rem]">
        {value}
      </div>
    </div>
  );
}

function DigitGroup({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="text-center">
      <div className="flex items-center gap-1.5">
        <FlipDigit value={value[0] ?? "0"} accent={accent} />
        <FlipDigit value={value[1] ?? "0"} accent={accent} />
      </div>
      <div className="mt-1.5 text-[8px] font-bold uppercase tracking-[0.22em] text-[#5D688A]/68 sm:text-[9px]">
        {label}
      </div>
    </div>
  );
}

export default function LiveDateTimePanel() {
  const [now, setNow] = useState<Date>(() => getJakartaNow());

  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(getJakartaNow());
    }, 1000);

    return () => window.clearInterval(id);
  }, []);

  const { hours, minutes, seconds } = formatTimeParts(now);
  const dateLabel = formatDateLabel(now);
  const greeting = formatGreeting(now);
  const showColon = now.getSeconds() % 2 === 0;

  return (
    <>
      <div className="relative overflow-hidden rounded-[1.65rem] border border-white/55 bg-[linear-gradient(145deg,rgba(255,255,255,0.52),rgba(230,231,238,0.84))] p-3.5 shadow-[12px_12px_28px_rgba(163,177,198,0.16),-12px_-12px_24px_rgba(255,255,255,0.82)] backdrop-blur-xl sm:p-4">
        <div className="blob-pink pointer-events-none absolute -right-10 -top-10 h-20 w-20 opacity-24" />
        <div className="blob-navy pointer-events-none absolute -bottom-10 left-8 h-20 w-20 opacity-12" />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <div className="mb-1.5 inline-flex items-center gap-2 rounded-full border border-white/55 bg-white/45 px-3 py-1.5 text-[9px] font-bold tracking-[0.18em] text-[#4e6785]">
              <Clock3 className="h-3.5 w-3.5" />
              FLIP CLOCK WIB
            </div>
            <p className="text-[13px] font-bold text-[#3a3f52] sm:text-sm">{greeting}</p>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/55 bg-white/45 px-2.5 py-1.5 text-[9px] font-semibold text-[#4e6785]">
            <MapPin className="h-3.5 w-3.5" />
            WIB
          </div>
        </div>

        <div className="relative z-10 mt-3 flex items-center justify-center gap-1 rounded-[1.45rem] border border-white/35 bg-white/28 px-2 py-2.5 sm:gap-1.5 sm:px-3 sm:py-3">
          <DigitGroup label="Jam" value={hours} accent="#FDACAC" />
          <div className={`px-0.5 text-xl font-black text-[#E79191] transition-opacity duration-300 sm:text-2xl ${showColon ? "opacity-100" : "opacity-35"}`}>
            :
          </div>
          <DigitGroup label="Menit" value={minutes} accent="#F7BABA" />
          <div className={`px-0.5 text-xl font-black text-[#4e6785] transition-opacity duration-300 sm:text-2xl ${showColon ? "opacity-35" : "opacity-100"}`}>
            :
          </div>
          <DigitGroup label="Detik" value={seconds} accent="#4e6785" />
        </div>

        <div className="relative z-10 mt-3 rounded-[1.25rem] border border-white/35 bg-white/22 px-3.5 py-2.5 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.14),inset_-4px_-4px_8px_rgba(255,255,255,0.52)]">
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#5D688A]/58">
            Tanggal Hari Ini
          </p>
          <p className="mt-1 text-[13px] font-semibold capitalize leading-relaxed text-[#3a3f52] sm:text-sm">
            {dateLabel}
          </p>
        </div>
      </div>

      <style jsx>{`
        .flip-base {
          position: absolute;
          left: 0;
          width: 100%;
          background: linear-gradient(180deg, rgba(248, 249, 252, 0.98) 0%, rgba(233, 236, 243, 0.92) 48%, rgba(216, 221, 233, 0.96) 100%);
        }

        .flip-top {
          top: 0;
          height: 50%;
          border-top-left-radius: 1rem;
          border-top-right-radius: 1rem;
        }

        .flip-bottom {
          bottom: 0;
          height: 50%;
          border-bottom-left-radius: 1rem;
          border-bottom-right-radius: 1rem;
        }

        .flip-divider {
          position: absolute;
          inset-inline: 0.5rem;
          top: 50%;
          height: 1px;
          background: rgba(93, 104, 138, 0.14);
          z-index: 2;
        }

        .flip-value {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          letter-spacing: 0.08em;
          color: #314056;
          transform-origin: center;
          animation: flip-in 0.48s ease;
          z-index: 1;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.42);
        }

        @keyframes flip-in {
          0% {
            transform: perspective(220px) rotateX(88deg) scale(0.96);
            filter: brightness(0.9);
            opacity: 0.2;
          }
          55% {
            transform: perspective(220px) rotateX(-12deg) scale(1.02);
            filter: brightness(1.04);
            opacity: 1;
          }
          100% {
            transform: perspective(220px) rotateX(0deg) scale(1);
            filter: brightness(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

