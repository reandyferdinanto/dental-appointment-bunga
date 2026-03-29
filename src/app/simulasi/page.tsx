"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Info,
  Pause,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import {
  NeuButton,
  NeuCard,
  NeuChip,
  NeuIconTile,
} from "@/components/ui/neumorphism";

const PROCEDURES = {
  filling: {
    chip: "Simulasi Interaktif",
    title: "Simulasi Penambalan Gigi",
    description:
      "Pelajari alur perawatan dari kondisi awal sampai hasil akhir dengan tampilan visual yang lebih jelas dan kontrol yang mudah diikuti.",
    infoTitle: "Tentang Simulasi",
    infoDescription:
      "Penambalan gigi adalah tindakan umum untuk memperbaiki gigi berlubang. Simulasi ini membantu pasien memahami setiap tahap sebelum perawatan dilakukan.",
    footer: "drg. Natasya Bunga Maureen - Simulasi edukasi pasien interaktif",
    steps: [
      {
        id: 0,
        title: "Gigi Berlubang",
        subtitle: "Kondisi Awal",
        description:
          "Gigi mengalami kerusakan akibat karies. Bakteri merusak email dan dentin hingga terbentuk lubang berwarna gelap. Jika tidak ditangani, kerusakan bisa mencapai saraf gigi.",
        tip: "Kunjungi dokter gigi setiap 6 bulan untuk deteksi dini karies.",
        color: "#ef4444",
        image: "/images/simulasi/step-0-cavity.png",
        stageTitle: "Area karies terlihat jelas",
      },
      {
        id: 1,
        title: "Pemeriksaan",
        subtitle: "Langkah 1",
        description:
          "Dokter memeriksa kondisi gigi dengan kaca mulut dan sonde untuk menilai kedalaman lubang. Rontgen dapat digunakan bila perlu untuk melihat kondisi di bawah permukaan.",
        tip: "Sampaikan keluhan nyeri dengan jelas agar dokter dapat menentukan penanganan terbaik.",
        color: "#3b82f6",
        image: "/images/simulasi/step-1-examination.png",
        stageTitle: "Pemeriksaan kedalaman kerusakan",
      },
      {
        id: 2,
        title: "Anestesi Lokal",
        subtitle: "Langkah 2",
        description:
          "Dokter memberikan anestesi lokal di sekitar gigi yang akan ditambal. Area menjadi mati rasa sehingga pasien lebih nyaman selama prosedur berlangsung.",
        tip: "Efek bius biasanya hilang dalam 2 sampai 4 jam setelah tindakan.",
        color: "#8b5cf6",
        image: "/images/simulasi/step-2-anesthesia.png",
        stageTitle: "Persiapan area sebelum tindakan",
      },
      {
        id: 3,
        title: "Pembersihan Karies",
        subtitle: "Langkah 3",
        description:
          "Dengan handpiece khusus, dokter mengangkat jaringan gigi yang rusak dan membersihkan kavitas sampai tersisa jaringan sehat yang siap ditambal.",
        tip: "Suara alat mungkin terdengar keras, tetapi anestesi membantu mengurangi rasa tidak nyaman.",
        color: "#f59e0b",
        image: "/images/simulasi/step-3-drilling.png",
        stageTitle: "Jaringan yang rusak dibersihkan",
      },
      {
        id: 4,
        title: "Penambalan",
        subtitle: "Langkah 4",
        description:
          "Bahan tambal resin komposit diaplikasikan bertahap ke dalam kavitas. Setiap lapisan disinari untuk mengeras dan menempel kuat pada struktur gigi.",
        tip: "Tambalan modern dapat disesuaikan dengan warna gigi asli agar hasilnya natural.",
        color: "#10b981",
        image: "/images/simulasi/step-4-filling.png",
        stageTitle: "Lapisan tambalan dibentuk bertahap",
      },
      {
        id: 5,
        title: "Poles dan Selesai",
        subtitle: "Langkah 5",
        description:
          "Tambalan dipoles agar halus dan nyaman saat menggigit. Dokter juga memeriksa oklusi untuk memastikan tinggi tambalan sudah pas dan gigi bisa berfungsi normal.",
        tip: "Hindari makanan keras pada 24 jam pertama agar area tambalan tetap nyaman.",
        color: "#06b6d4",
        image: "/images/simulasi/step-5-polished.png",
        stageTitle: "Hasil akhir tampak lebih rapi",
      },
    ],
  },
  scaling: {
    chip: "Simulasi Interaktif",
    title: "Simulasi Scaling Gigi",
    description:
      "Pahami alur pembersihan karang gigi dari pemeriksaan awal sampai permukaan gigi terasa lebih bersih, halus, dan nyaman.",
    infoTitle: "Tentang Scaling",
    infoDescription:
      "Scaling gigi dilakukan untuk membersihkan plak dan karang gigi yang menempel di atas maupun di sekitar garis gusi. Tindakan ini membantu menjaga kesehatan gusi dan mengurangi bau mulut.",
    footer: "drg. Natasya Bunga Maureen - Simulasi edukasi scaling gigi",
    steps: [
      {
        id: 0,
        title: "Karang Gigi Menumpuk",
        subtitle: "Kondisi Awal",
        description:
          "Plak yang tidak dibersihkan akan mengeras menjadi karang gigi. Penumpukan ini sering muncul di dekat garis gusi dan dapat memicu radang, bau mulut, serta perdarahan saat menyikat gigi.",
        tip: "Karang gigi tidak bisa dibersihkan tuntas hanya dengan sikat gigi biasa dan perlu alat profesional.",
        color: "#ef4444",
        image: "/images/simulasi/scaling-step-0.png",
        stageTitle: "Karang gigi tampak menempel di sekitar gusi",
      },
      {
        id: 1,
        title: "Pemeriksaan Gusi",
        subtitle: "Langkah 1",
        description:
          "Dokter memeriksa kondisi gusi, melihat lokasi karang gigi, dan menilai apakah ada perdarahan atau radang. Area yang paling banyak penumpukan akan menjadi fokus pembersihan.",
        tip: "Beritahu dokter bila Anda sering gusi berdarah atau memiliki gigi sensitif.",
        color: "#3b82f6",
        image: "/images/simulasi/scaling-step-1.png",
        stageTitle: "Area scaling dipetakan sebelum tindakan",
      },
      {
        id: 2,
        title: "Ultrasonic Scaling",
        subtitle: "Langkah 2",
        description:
          "Alat ultrasonic digunakan untuk memecah karang gigi dengan getaran halus dan semprotan air. Tahap ini membantu melepaskan deposit keras dari permukaan gigi dengan lebih efisien.",
        tip: "Suara alat mungkin terdengar nyaring, tetapi biasanya tindakan berlangsung cepat.",
        color: "#8b5cf6",
        image: "/images/simulasi/scaling-step-2.png",
        stageTitle: "Getaran alat membantu melepaskan karang gigi",
      },
      {
        id: 3,
        title: "Scaling Manual Detail",
        subtitle: "Langkah 3",
        description:
          "Dokter melanjutkan dengan instrumen manual untuk area yang lebih sempit atau karang yang masih tertinggal di dekat garis gusi agar hasil pembersihan lebih menyeluruh.",
        tip: "Bagian ini penting untuk memastikan sisa deposit keras benar-benar terangkat.",
        color: "#f59e0b",
        image: "/images/simulasi/scaling-step-3.png",
        stageTitle: "Sisa karang dibersihkan lebih detail",
      },
      {
        id: 4,
        title: "Polishing",
        subtitle: "Langkah 4",
        description:
          "Setelah karang gigi dibersihkan, permukaan gigi dipoles agar terasa lebih halus. Tahap ini juga membantu mengurangi noda ringan yang menempel di permukaan.",
        tip: "Polishing membuat permukaan gigi lebih licin sehingga plak baru tidak mudah menempel.",
        color: "#10b981",
        image: "/images/simulasi/scaling-step-4.png",
        stageTitle: "Permukaan gigi dipoles hingga lebih halus",
      },
      {
        id: 5,
        title: "Kontrol dan Edukasi",
        subtitle: "Langkah 5",
        description:
          "Dokter mengevaluasi hasil scaling, memberi edukasi cara menyikat gigi yang benar, dan menjelaskan jadwal kontrol agar karang gigi tidak cepat menumpuk kembali.",
        tip: "Scaling rutin tiap 6 bulan umumnya dianjurkan, tergantung kondisi gigi dan gusi pasien.",
        color: "#06b6d4",
        image: "/images/simulasi/scaling-step-5.png",
        stageTitle: "Gigi lebih bersih dan gusi lebih nyaman",
      },
    ],
  },
} as const;

type ProcedureKey = keyof typeof PROCEDURES;
type Step = (typeof PROCEDURES)[ProcedureKey]["steps"][number];

function StepPill({
  item,
  index,
  active,
  onClick,
}: {
  item: Step;
  index: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
      aria-label={`Step ${index + 1}: ${item.title}`}
    >
      <div
        className="rounded-[1.4rem] border px-3 py-3 transition-all duration-300"
        style={{
          background: active ? "rgba(255,255,255,0.62)" : "rgba(255,255,255,0.34)",
          borderColor: active ? `${item.color}44` : "rgba(255,255,255,0.42)",
          boxShadow: active
            ? "12px 12px 24px rgba(163,177,198,0.14), -10px -10px 20px rgba(255,255,255,0.78)"
            : "inset 1px 1px 0 rgba(255,255,255,0.3)",
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white shadow-[6px_6px_14px_rgba(163,177,198,0.14),-5px_-5px_12px_rgba(255,255,255,0.6)]"
            style={{ background: active ? item.color : "#94a3b8" }}
          >
            {index + 1}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a8fa8]">
              {item.subtitle}
            </p>
            <p className="mt-1 text-sm font-bold leading-tight text-[#3a3f52]">
              {item.title}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function SimulasiPage() {
  const [procedure, setProcedure] = useState<ProcedureKey>("filling");
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const procedureConfig = PROCEDURES[procedure];
  const steps = procedureConfig.steps;
  const step = steps[currentStep];
  const progressWidth = `${((currentStep + 1) / steps.length) * 100}%`;

  const stageGradient = useMemo(
    () => ({
      background: `radial-gradient(circle at 50% 18%, ${step.color}20 0%, rgba(255,255,255,0.38) 36%, rgba(238,240,246,0.98) 100%)`,
      borderColor: `${step.color}22`,
    }),
    [step.color],
  );

  const goNext = useCallback(() => {
    setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : 0));
  }, [steps.length]);

  const goPrev = useCallback(() => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : steps.length - 1));
  }, [steps.length]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }

        return prev + 1;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [isPlaying, steps.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-mesh">
      <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 -translate-x-1/3 -translate-y-1/3 rounded-full blob-pink mix-blend-multiply" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[28rem] w-[28rem] translate-x-1/4 translate-y-1/4 rounded-full blob-peach mix-blend-multiply" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-72 w-72 translate-x-1/2 rounded-full blob-navy mix-blend-multiply" />

      <header className="relative z-10 px-4 pb-4 pt-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-[#5D688A] transition-colors hover:text-[#3a3f52] tap-feedback"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali</span>
          </Link>
          <NeuButton
            onClick={() => setShowInfo((prev) => !prev)}
            size="sm"
            className="rounded-2xl"
            aria-label="Tentang simulasi"
          >
            <Info className="h-4 w-4" />
          </NeuButton>
        </div>
      </header>

      <AnimatePresence>
        {showInfo ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowInfo(false)}
          >
            <div className="absolute inset-0 bg-[#3a3f52]/30 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <NeuCard className="rounded-[28px] p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <NeuIconTile tone="accent" className="h-11 w-11 rounded-2xl">
                      <Info className="h-5 w-5" />
                    </NeuIconTile>
                    <h3 className="text-sm font-bold text-[#3a3f52]">{procedureConfig.infoTitle}</h3>
                  </div>
                  <button
                    onClick={() => setShowInfo(false)}
                    className="text-[#8a8fa8] transition-colors hover:text-[#3a3f52]"
                    aria-label="Tutup informasi"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs leading-relaxed text-[#5D688A]">
                  {procedureConfig.infoDescription}
                </p>
                <NeuChip className="mt-4 w-full justify-center rounded-2xl px-3 py-2 text-[11px] font-semibold text-[#5D688A]">
                  Gunakan tombol navigasi atau keyboard kiri dan kanan. Tekan play untuk auto-play.
                </NeuChip>
              </NeuCard>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <main className="relative z-10 px-4 pb-8 sm:px-6 lg:px-8 lg:pb-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:gap-8">
            <motion.section
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="order-2 lg:order-1"
            >
              <div className="max-w-lg">
                <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(253,172,172,0.45)] bg-white/50 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5D688A] shadow-[8px_8px_18px_rgba(163,177,198,0.12),-8px_-8px_18px_rgba(255,255,255,0.8)]">
                  <span className="h-2 w-2 rounded-full bg-[#FDACAC] animate-pulse-soft" />
                  {procedureConfig.chip}
                </div>
                <h1 className="mt-4 max-w-[11ch] text-[2.2rem] font-extrabold leading-[0.94] tracking-[-0.05em] text-[#3a3f52] sm:text-[2.8rem] lg:text-[3.35rem]">
                  Simulasi{" "}
                  <span className="gradient-text">
                    {procedure === "filling" ? "Penambalan Gigi" : "Scaling Gigi"}
                  </span>
                </h1>
                <p className="mt-3 max-w-[32rem] text-sm leading-7 text-[#5D688A]/78 sm:text-[15px]">
                  {procedureConfig.description}
                </p>

                <div className="mt-5 grid gap-2 sm:max-w-md sm:grid-cols-2">
                  {([
                    { key: "filling", label: "Penambalan" },
                    { key: "scaling", label: "Scaling" },
                  ] as const).map((item) => {
                    const active = item.key === procedure;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          setProcedure(item.key);
                          setCurrentStep(0);
                          setIsPlaying(false);
                        }}
                        className="rounded-[1.2rem] border px-4 py-3 text-left transition-all duration-200"
                        style={active ? {
                          background: "linear-gradient(135deg, #4e6785 0%, #6d7f9e 100%)",
                          color: "#ffffff",
                          borderColor: "rgba(255,255,255,0.18)",
                          boxShadow: "12px 12px 24px rgba(120,134,155,0.2), -8px -8px 18px rgba(255,255,255,0.16)",
                        } : {
                          background: "rgba(255,255,255,0.42)",
                          color: "#4e6785",
                          borderColor: "rgba(255,255,255,0.52)",
                          boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.38)",
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-bold tracking-[-0.02em]">{item.label}</span>
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                              background: active ? "rgba(253,172,172,0.95)" : "rgba(93,104,138,0.24)",
                              boxShadow: active ? "0 0 0 4px rgba(253,172,172,0.16)" : "none",
                            }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8a8fa8]">
                    Progress
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#3a3f52]">
                    {currentStep + 1} dari {steps.length} langkah
                  </p>
                </div>
                <NeuChip
                  className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] border bg-white/45 shadow-[6px_6px_14px_rgba(163,177,198,0.1),-6px_-6px_14px_rgba(255,255,255,0.66)]"
                  style={{ color: step.color }}
                >
                  {step.subtitle}
                </NeuChip>
              </div>

              <div className="mt-3 overflow-hidden rounded-full bg-[#5D688A]/10">
                <motion.div
                  className="h-1.5 rounded-full"
                  style={{ background: step.color }}
                  initial={false}
                  animate={{ width: progressWidth }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.28 }}
                  className="mt-5"
                >
                  <NeuCard className="rounded-[2rem] border border-white/55 bg-white/38 p-5 shadow-[14px_14px_28px_rgba(163,177,198,0.14),-12px_-12px_24px_rgba(255,255,255,0.78)] backdrop-blur-xl sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a8fa8]">
                          Langkah Aktif
                        </p>
                        <h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-[#3a3f52] sm:text-2xl">
                          {step.title}
                        </h2>
                      </div>
                      <div
                        className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]"
                        style={{
                          color: step.color,
                          background: `${step.color}14`,
                          border: `1px solid ${step.color}22`,
                        }}
                      >
                        {step.subtitle}
                      </div>
                    </div>

                    <p className="mt-4 text-[13px] leading-7 text-[#5D688A]/82 sm:text-sm">
                      {step.description}
                    </p>

                    <div className="mt-4 rounded-[1.45rem] border border-white/45 bg-white/24 px-4 py-3 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.12),inset_-4px_-4px_8px_rgba(255,255,255,0.48)]">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a8fa8]">
                        Tip Perawatan
                      </p>
                      <p className="mt-2 text-[12px] leading-6 text-[#4e6785] sm:text-[13px]">
                        {step.tip}
                      </p>
                    </div>
                  </NeuCard>
                </motion.div>
              </AnimatePresence>

              <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
                {steps.map((item, index) => (
                  <StepPill
                    key={item.id}
                    item={item}
                    index={index}
                    active={index === currentStep}
                    onClick={() => setCurrentStep(index)}
                  />
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55 }}
              className="order-1 lg:order-2"
            >
              <div className="relative overflow-hidden rounded-[2.4rem] border border-white/55 bg-[linear-gradient(145deg,rgba(255,255,255,0.46),rgba(230,231,238,0.88))] p-4 shadow-[18px_18px_36px_rgba(163,177,198,0.18),-16px_-16px_30px_rgba(255,255,255,0.86)] backdrop-blur-xl sm:p-5 lg:p-6">
                <motion.div
                  key={`glow-${step.id}`}
                  initial={{ opacity: 0.2, scale: 0.86 }}
                  animate={{ opacity: 0.5, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.12 }}
                  transition={{ duration: 0.45 }}
                  className="pointer-events-none absolute left-1/2 top-[18%] h-44 w-44 -translate-x-1/2 rounded-full blur-3xl sm:h-56 sm:w-56"
                  style={{ background: `${step.color}30` }}
                />
                <div className="blob-pink pointer-events-none absolute -left-12 -top-10 h-28 w-28 opacity-30" />
                <div className="blob-peach pointer-events-none absolute -bottom-10 right-0 h-32 w-32 opacity-30" />

                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8a8fa8]">
                      Visual Prosedur
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#3a3f52] sm:text-base">
                      {step.stageTitle}
                    </p>
                  </div>
                  <div
                    className="rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] shadow-[6px_6px_14px_rgba(163,177,198,0.1),-6px_-6px_14px_rgba(255,255,255,0.66)]"
                    style={{
                      color: step.color,
                      background: `${step.color}14`,
                      border: `1px solid ${step.color}24`,
                    }}
                  >
                    {isPlaying ? "Auto Play" : "Manual"}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.92, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -10 }}
                    transition={{ duration: 0.42, ease: "easeOut" }}
                    className="relative z-10 mt-4"
                  >
                    <div
                      className="relative overflow-hidden rounded-[2rem] border"
                      style={{
                        ...stageGradient,
                        boxShadow:
                          "inset 1px 1px 0 rgba(255,255,255,0.42), 10px 10px 24px rgba(163,177,198,0.16), -10px -10px 22px rgba(255,255,255,0.74)",
                      }}
                    >
                      <motion.div
                        className="absolute inset-x-[16%] top-[14%] h-[46%] rounded-full blur-3xl"
                        style={{ background: `${step.color}16` }}
                        animate={{ scale: [1, 1.06, 1], opacity: [0.45, 0.6, 0.45] }}
                        transition={{ duration: 3.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      />
                      <div className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#4e6785] text-sm font-extrabold text-white shadow-[8px_8px_18px_rgba(137,150,166,0.24),-8px_-8px_18px_rgba(255,255,255,0.16)] sm:h-12 sm:w-12 sm:text-base">
                        {currentStep === 0 ? "!" : currentStep}
                      </div>
                      <div
                        className="absolute right-4 top-4 z-10 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]"
                        style={{
                          color: step.color,
                          background: "rgba(255,255,255,0.7)",
                          border: `1px solid ${step.color}22`,
                        }}
                      >
                        {currentStep + 1}/{steps.length}
                      </div>

                      <div className="relative aspect-[1/1] min-h-[320px] w-full sm:min-h-[430px] lg:min-h-[540px]">
                        <motion.div
                          key={`image-${step.id}`}
                          initial={{ opacity: 0, scale: 0.84, rotate: -6, y: 28 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
                          exit={{ opacity: 0, scale: 1.08, rotate: 5, y: -18 }}
                          transition={{ duration: 0.55, ease: "easeOut" }}
                          className="absolute inset-0"
                        >
                          <motion.div
                            animate={{ y: [0, -8, 0], rotate: [0, 0.6, 0] }}
                            transition={{ duration: 4.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                            className="absolute inset-0"
                          >
                            <Image
                              src={step.image}
                              alt={step.title}
                              fill
                              className="object-contain p-5 sm:p-8 lg:p-10"
                              sizes="(max-width: 1024px) 100vw, 55vw"
                              priority
                            />
                            {procedure === "scaling" ? (
                              <>
                                <div className="pointer-events-none absolute inset-x-[24%] top-[26%] h-4 rounded-full bg-[rgba(123,91,255,0.08)] blur-md" />
                                <div className="pointer-events-none absolute inset-x-[28%] top-[31%] h-3 rounded-full bg-[rgba(239,68,68,0.18)] blur-sm" />
                                <div className="pointer-events-none absolute inset-x-[31%] top-[36%] h-2.5 rounded-full bg-[rgba(245,158,11,0.16)] blur-sm" />
                                <div
                                  className="pointer-events-none absolute right-[20%] top-[22%] h-24 w-1.5 rounded-full"
                                  style={{ background: `linear-gradient(180deg, ${step.color}, rgba(255,255,255,0.1))` }}
                                />
                                <div
                                  className="pointer-events-none absolute right-[19.2%] top-[20%] h-10 w-5 rounded-full border border-white/55 bg-white/55 shadow-[6px_6px_14px_rgba(163,177,198,0.12),-6px_-6px_14px_rgba(255,255,255,0.66)]"
                                  style={{ boxShadow: `0 0 0 6px ${step.color}12` }}
                                />
                              </>
                            ) : null}
                          </motion.div>
                        </motion.div>
                      </div>

                      <div className="absolute inset-x-5 bottom-5 z-10 rounded-[1.35rem] border border-white/55 bg-white/54 px-4 py-3 backdrop-blur-lg shadow-[10px_10px_22px_rgba(163,177,198,0.14),-10px_-10px_18px_rgba(255,255,255,0.72)] sm:hidden">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a8fa8]">
                          Langkah Aktif
                        </p>
                        <p className="mt-1 text-sm font-bold text-[#3a3f52]">{step.title}</p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="relative z-10 mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center justify-center gap-2 sm:justify-start">
                    {steps.map((item, index) => (
                      <button
                        key={item.id}
                        onClick={() => setCurrentStep(index)}
                        className="transition-all duration-300 tap-feedback"
                        aria-label={`Step ${index + 1}: ${item.title}`}
                      >
                        <motion.div
                          className="rounded-full"
                          initial={false}
                          animate={{
                            width: index === currentStep ? 28 : 8,
                            height: 8,
                            backgroundColor:
                              index === currentStep
                                ? step.color
                                : index < currentStep
                                  ? `${step.color}55`
                                  : "#D4C7B8",
                          }}
                          transition={{ duration: 0.25 }}
                        />
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-2 sm:justify-end">
                    <NeuButton
                      onClick={reset}
                      size="sm"
                      className="rounded-2xl px-3 py-2 sm:px-4"
                      aria-label="Reset"
                    >
                      <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
                    </NeuButton>
                    <NeuButton
                      onClick={goPrev}
                      size="sm"
                      className="rounded-2xl px-3 py-2 sm:px-4"
                      aria-label="Sebelumnya"
                    >
                      <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                    </NeuButton>
                    <NeuButton
                      onClick={() => setIsPlaying((prev) => !prev)}
                      variant="primary"
                      size="md"
                      className="rounded-2xl px-4 py-3 text-white"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5 sm:h-6 sm:w-6" />
                      ) : (
                        <Play className="h-5 w-5 sm:h-6 sm:w-6" />
                      )}
                    </NeuButton>
                    <NeuButton
                      onClick={goNext}
                      size="sm"
                      className="rounded-2xl px-3 py-2 sm:px-4"
                      aria-label="Selanjutnya"
                    >
                      <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                    </NeuButton>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-[#8a8fa8]">
              {procedureConfig.footer}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}



