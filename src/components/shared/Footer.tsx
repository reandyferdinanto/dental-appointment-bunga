import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-10" style={{ background: "#e6e7ee" }}>
      <div
        className="w-full overflow-hidden leading-none"
        style={{ marginBottom: "-2px" }}
      >
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          style={{ transform: "scaleY(-1) translateY(-1px)" }}
        >
          <path
            d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z"
            fill="#EEF3F8"
          />
        </svg>
      </div>

      <div className="section-shell px-4 py-12 sm:px-6 lg:px-8">
        <div className="glass rounded-[2rem] p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="relative h-11 w-11">
                  <div
                    className="relative flex h-11 w-11 items-center justify-center rounded-2xl"
                    style={{
                      background: "#e6e7ee",
                      border: "1px solid rgba(255,255,255,0.52)",
                      boxShadow:
                        "4px 4px 8px rgba(163,177,198,0.18), -4px -4px 8px rgba(255,255,255,0.36)",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="#4E6785"
                        d="M12 2C9.5 2 7.5 3.5 6.5 5.5C5.5 3.5 3.5 2 1.5 2C1.5 2 1 6 2 8.5C3 11 4 12 4 15C4 18 5 22 7 22C8.5 22 9 20 10 18C10.5 16.5 11 15 12 15C13 15 13.5 16.5 14 18C15 20 15.5 22 17 22C19 22 20 18 20 15C20 12 21 11 22 8.5C23 6 22.5 2 22.5 2C20.5 2 18.5 3.5 17.5 5.5C16.5 3.5 14.5 2 12 2Z"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <span className="block text-sm font-bold text-[#2c3d52]">
                    drg. Bunga Maureen
                  </span>
                  <span className="text-[10px] font-semibold text-[#E79191]">
                    Healthcare SaaS
                  </span>
                </div>
              </div>

              <p className="mb-4 text-sm leading-relaxed text-[#63768c]">
                Platform praktik gigi yang lebih tenang, profesional, dan mudah
                dipakai pasien maupun admin klinik.
              </p>

              <div className="flex gap-2.5">
                {["Caring", "Clear", "Fast"].map((label) => (
                  <div
                    key={label}
                    className="chip-neu px-3 py-2 text-xs font-semibold text-[#4e6785]"
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#2c3d52]">
                Menu
              </h3>
              <div className="space-y-2.5">
                {[
                  { href: "/", label: "Beranda" },
                  { href: "/jadwal", label: "Lihat Jadwal" },
                  { href: "/booking", label: "Buat Janji" },
                  { href: "/login", label: "Login Dashboard" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center gap-2 text-sm text-[#63768c] transition-colors hover:text-[#4e6785]"
                  >
                    <span className="h-1 w-1 rounded-full bg-[#FDACAC] opacity-0 transition-opacity group-hover:opacity-100" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#2c3d52]">
                Kontak
              </h3>
              <div className="space-y-3">
                {[
                  { Icon: MapPin, text: "Klinik Gigi Universitas Trisakti" },
                  { Icon: Phone, text: "+62 812-xxxx-xxxx" },
                  { Icon: Mail, text: "bunga@dentist.com" },
                  { Icon: Clock, text: "Senin - Sabtu, 08:00 - 16:00" },
                ].map(({ Icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-3 text-sm text-[#63768c]"
                  >
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: "#e6e7ee",
                        boxShadow:
                          "4px 4px 8px rgba(163,177,198,0.16), -4px -4px 8px rgba(255,255,255,0.34)",
                      }}
                    >
                      <Icon className="h-3.5 w-3.5 text-[#E79191]" />
                    </div>
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className="mt-10 border-t pt-6 text-center"
            style={{ borderColor: "rgba(78,103,133,0.1)" }}
          >
            <p className="text-xs text-[#78899d]">
              © 2026 Reandy Ferdinanto. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
