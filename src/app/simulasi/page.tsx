"use client";

import { useCallback, useEffect, useState } from "react";
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

const STEPS = [
  {
    id: 0,
    title: "Gigi Berlubang",
    subtitle: "Kondisi Awal",
    description:
      "Gigi mengalami kerusakan akibat karies. Bakteri merusak email dan dentin hingga terbentuk lubang berwarna gelap. Jika tidak ditangani, kerusakan bisa mencapai saraf gigi.",
    tip: "Kunjungi dokter gigi setiap 6 bulan untuk deteksi dini karies.",
    color: "#ef4444",
    bg: "#eef0f6",
    image: "/images/simulasi/step-0-cavity.png",
  },
  {
    id: 1,
    title: "Pemeriksaan",
    subtitle: "Langkah 1",
    description:
      "Dokter memeriksa kondisi gigi dengan kaca mulut dan sonde untuk menilai kedalaman lubang. Rontgen dapat digunakan bila perlu untuk melihat kondisi di bawah permukaan.",
    tip: "Sampaikan keluhan nyeri dengan jelas agar dokter dapat menentukan penanganan terbaik.",
    color: "#3b82f6",
    bg: "#eef0f6",
    image: "/images/simulasi/step-1-examination.png",
  },
  {
    id: 2,
    title: "Anestesi Lokal",
    subtitle: "Langkah 2",
    description:
      "Dokter memberikan anestesi lokal di sekitar gigi yang akan ditambal. Area menjadi mati rasa sehingga pasien lebih nyaman selama prosedur berlangsung.",
    tip: "Efek bius biasanya hilang dalam 2 sampai 4 jam setelah tindakan.",
    color: "#8b5cf6",
    bg: "#eef0f6",
    image: "/images/simulasi/step-2-anesthesia.png",
  },
  {
    id: 3,
    title: "Pembersihan Karies",
    subtitle: "Langkah 3",
    description:
      "Dengan handpiece khusus, dokter mengangkat jaringan gigi yang rusak dan membersihkan kavitas sampai tersisa jaringan sehat yang siap ditambal.",
    tip: "Suara alat mungkin terdengar keras, tetapi anestesi membantu mengurangi rasa tidak nyaman.",
    color: "#f59e0b",
    bg: "#eef0f6",
    image: "/images/simulasi/step-3-drilling.png",
  },
  {
    id: 4,
    title: "Penambalan",
    subtitle: "Langkah 4",
    description:
      "Bahan tambal resin komposit diaplikasikan bertahap ke dalam kavitas. Setiap lapisan disinari untuk mengeras dan menempel kuat pada struktur gigi.",
    tip: "Tambalan modern dapat disesuaikan dengan warna gigi asli agar hasilnya natural.",
    color: "#10b981",
    bg: "#eef0f6",
    image: "/images/simulasi/step-4-filling.png",
  },
  {
    id: 5,
    title: "Poles dan Selesai",
    subtitle: "Langkah 5",
    description:
      "Tambalan dipoles agar halus dan nyaman saat menggigit. Dokter juga memeriksa oklusi untuk memastikan tinggi tambalan sudah pas dan gigi bisa berfungsi normal.",
    tip: "Hindari makanan keras pada 24 jam pertama agar area tambalan tetap nyaman.",
    color: "#06b6d4",
    bg: "#eef0f6",
    image: "/images/simulasi/step-5-polished.png",
  },
] as const;

export default function SimulasiPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const step = STEPS[currentStep];

  const goNext = useCallback(() => {
    setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : 0));
  }, []);

  const goPrev = useCallback(() => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : STEPS.length - 1));
  }, []);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= STEPS.length - 1) {
          setIsPlaying(false);
          return prev;
        }

        return prev + 1;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [isPlaying]);

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
      <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full blob-pink mix-blend-multiply" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full blob-peach mix-blend-multiply" />
      <div className="pointer-events-none absolute right-0 top-1/2 h-64 w-64 translate-x-1/2 rounded-full blob-navy mix-blend-multiply" />

      <header className="relative z-10 px-4 pb-2 pt-4 sm:px-6 sm:pt-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-[#5D688A] transition-colors hover:text-[#3a3f52] tap-feedback"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Kembali</span>
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
                    <h3 className="text-sm font-bold text-[#3a3f52]">Tentang Simulasi</h3>
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
                  <strong>Penambalan gigi</strong> adalah tindakan umum untuk
                  memperbaiki gigi berlubang. Simulasi ini membantu pasien
                  memahami setiap tahap sebelum perawatan dilakukan.
                </p>
                <NeuChip className="mt-4 w-full justify-center rounded-2xl px-3 py-2 text-[11px] font-semibold text-[#5D688A]">
                  Gunakan tombol navigasi atau keyboard kiri dan kanan. Tekan
                  play untuk auto-play.
                </NeuChip>
              </NeuCard>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <section
        className="relative z-10 flex flex-col"
        style={{ minHeight: "100dvh" }}
      >
        <motion.div
          className="px-4 pb-1 pt-1 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-lg font-extrabold text-[#3a3f52] sm:text-2xl lg:text-3xl">
            Simulasi <span className="gradient-text">Penambalan Gigi</span>
          </h1>
          <p className="mt-0.5 text-[10px] text-[#8a8fa8] sm:text-xs">
            Pahami langkah prosedur secara interaktif sebelum perawatan.
          </p>
        </motion.div>

        <div className="mx-auto mb-1.5 w-full max-w-2xl px-4 sm:px-8">
          <div className="mb-1 flex items-center justify-between">
            <motion.span
              key={step.id}
              className="text-[10px] font-bold uppercase tracking-widest sm:text-xs"
              style={{ color: step.color }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {step.subtitle}
            </motion.span>
            <span className="text-[10px] font-medium text-[#8a8fa8] sm:text-xs">
              {currentStep + 1} / {STEPS.length}
            </span>
          </div>
          <div className="overflow-hidden rounded-full bg-[#5D688A]/10">
            <motion.div
              className="h-1.5 rounded-full"
              style={{ background: step.color }}
              initial={false}
              animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-1 sm:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
              style={{
                background: step.bg,
                border: "1px solid rgba(255,255,255,0.52)",
                boxShadow: "8px 8px 16px rgba(163,177,198,0.2), -8px -8px 16px rgba(255,255,255,0.56)",
                width: "min(75vw, 360px)",
                aspectRatio: "1 / 1",
                maxHeight: "38vh",
              }}
            >
              <Image
                src={step.image}
                alt={step.title}
                fill
                className="object-contain p-2 sm:p-3"
                sizes="(max-width: 640px) 75vw, 360px"
                priority
              />

              <motion.div
                className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-extrabold text-white sm:left-3 sm:top-3 sm:h-9 sm:w-9 sm:rounded-xl sm:text-sm"
                style={{
                  background: "#4e6785",
                  boxShadow: "4px 4px 8px rgba(137,150,166,0.24), -4px -4px 8px rgba(255,255,255,0.18)",
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                {currentStep === 0 ? "!" : currentStep}
              </motion.div>

              {currentStep === STEPS.length - 1 ? (
                <motion.div
                  className="absolute right-2 top-2 rounded-lg px-2 py-0.5 text-[9px] font-bold text-[#4e6785] sm:right-3 sm:top-3 sm:rounded-xl sm:px-2.5 sm:py-1 sm:text-xs chip-neu"
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4, type: "spring" }}
                >
                  Selesai
                </motion.div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mx-auto w-full max-w-2xl px-4 py-2 sm:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <NeuCard className="space-y-2 rounded-[28px] p-3 sm:p-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-bold text-[#3a3f52] sm:text-base lg:text-lg">
                    {step.title}
                  </h2>
                  <NeuChip
                    className="px-3 py-1 text-[10px] uppercase tracking-[0.2em]"
                    style={{ color: step.color }}
                  >
                    {step.subtitle}
                  </NeuChip>
                </div>
                <p className="text-[11px] leading-relaxed text-[#5D688A]/80 sm:text-xs">
                  {step.description}
                </p>
                <div
                  className="neu-inset flex items-start gap-2 rounded-2xl px-3 py-2 text-[10px] text-[#4e6785] sm:text-[11px]"
                  style={{ borderColor: "rgba(255,255,255,0.42)" }}
                >
                  <span className="shrink-0 font-semibold">Tip</span>
                  <span className="leading-relaxed">{step.tip}</span>
                </div>
              </NeuCard>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="px-4 py-2 sm:py-3">
          <div className="mb-2 flex items-center justify-center gap-1.5 sm:gap-2">
            {STEPS.map((item, index) => (
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
                    width: index === currentStep ? 24 : 8,
                    height: 8,
                    backgroundColor:
                      index === currentStep
                        ? step.color
                        : index < currentStep
                          ? `${step.color}60`
                          : "#D4C7B8",
                  }}
                  transition={{ duration: 0.3 }}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-3">
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
            <div className="w-8 sm:w-10" />
          </div>
        </div>
      </section>

      <main className="relative z-10 px-4 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {STEPS.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => setCurrentStep(index)}
                className="overflow-hidden rounded-2xl"
                style={{
                  borderColor: index === currentStep ? item.color : "transparent",
                  borderWidth: "2px",
                }}
                whileTap={{ scale: 0.96 }}
              >
                <NeuCard className="neu-card-hover rounded-2xl p-2 text-center transition-all">
                  <div
                    className="relative mx-auto mb-1.5 aspect-square w-full max-w-[64px] overflow-hidden rounded-lg"
                    style={{ background: item.bg }}
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-contain p-0.5"
                      sizes="64px"
                    />
                    <div
                      className="absolute left-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded text-[8px] font-bold text-white"
                      style={{
                        background: index <= currentStep ? item.color : "#D4C7B8",
                        transition: "background 0.3s",
                      }}
                    >
                      {index + 1}
                    </div>
                  </div>
                  <p className="text-[10px] font-bold leading-tight text-[#3a3f52] sm:text-xs">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[9px] text-[#8a8fa8]">
                    {item.subtitle}
                  </p>
                </NeuCard>
              </motion.button>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-[#8a8fa8]">
              drg. Natasya Bunga Maureen - Simulasi edukasi pasien
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
