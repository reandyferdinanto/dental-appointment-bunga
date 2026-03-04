import Link from "next/link";
import { Heart, MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ background: "linear-gradient(135deg, #5D688A 0%, #3a4566 100%)" }}>
      {/* Wave divider */}
      <div className="w-full overflow-hidden leading-none" style={{ marginBottom: "-2px" }}>
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ transform: "scaleY(-1) translateY(-1px)" }}>
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#FFF2EF"/>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="relative w-11 h-11">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#F7A5A5] to-[#FFDBB6] opacity-40 blur-sm" />
                <div className="relative w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}>
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C9.5 2 7.5 3.5 6.5 5.5C5.5 3.5 3.5 2 1.5 2C1.5 2 1 6 2 8.5C3 11 4 12 4 15C4 18 5 22 7 22C8.5 22 9 20 10 18C10.5 16.5 11 15 12 15C13 15 13.5 16.5 14 18C15 20 15.5 22 17 22C19 22 20 18 20 15C20 12 21 11 22 8.5C23 6 22.5 2 22.5 2C20.5 2 18.5 3.5 17.5 5.5C16.5 3.5 14.5 2 12 2Z"/>
                  </svg>
                </div>
              </div>
              <div>
                <span className="font-bold text-white text-sm block">drg. Bunga Maureen</span>
                <span className="text-[10px] text-[#FFDBB6] font-medium">Dental Care ✨</span>
              </div>
            </div>
            <p className="text-sm text-white/65 leading-relaxed mb-4">
              Melayani perawatan gigi dengan sepenuh hati dan senyum terbaik untuk Anda.
            </p>
            <div className="flex gap-2">
              {["💙", "🌸", "⭐"].map((emoji, i) => (
                <div key={i} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-transform hover:scale-110" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  {emoji}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm tracking-wide uppercase">Menu</h3>
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
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-[#FFDBB6] transition-colors group"
                >
                  <span className="w-1 h-1 rounded-full bg-[#F7A5A5] opacity-0 group-hover:opacity-100 transition-opacity" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm tracking-wide uppercase">Kontak</h3>
            <div className="space-y-3">
              {[
                { Icon: MapPin, text: "Klinik Gigi Universitas Trisakti" },
                { Icon: Phone, text: "+62 812-xxxx-xxxx" },
                { Icon: Mail, text: "bunga@dentist.com" },
                { Icon: Clock, text: "Senin – Sabtu, 08:00 – 16:00" },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-white/60">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(247,165,165,0.2)" }}>
                    <Icon className="w-3.5 h-3.5 text-[#F7A5A5]" />
                  </div>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t mt-10 pt-6 text-center" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
          <p className="text-xs text-white/35 flex items-center justify-center gap-1.5">
            © 2026 drg. Natasya Bunga Maureen. Dibuat dengan
            <Heart className="w-3 h-3 fill-[#F7A5A5] text-[#F7A5A5]" />
            penuh kasih
          </p>
        </div>
      </div>
    </footer>
  );
}
