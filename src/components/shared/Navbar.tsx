"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";

const navLinks = [
	{ href: "/", label: "Beranda" },
	{ href: "/jadwal", label: "Jadwal" },
	{ href: "/booking", label: "Booking" },
];

export default function Navbar() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<nav className="glass sticky top-0 z-50" style={{
			background: "rgba(255,242,239,0.72)",
			backdropFilter: "blur(20px)",
			WebkitBackdropFilter: "blur(20px)",
			borderBottom: "1px solid rgba(247,165,165,0.25)"
		}}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">

					{/* Logo */}
					<Link href="/" className="flex items-center gap-2.5 group">
						<div className="relative w-10 h-10">
							{/* Glow ring */}
							<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#F7A5A5] to-[#FFDBB6] opacity-60 blur-sm group-hover:opacity-90 transition-opacity" />
							<div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-[#5D688A] to-[#7a88b0] flex items-center justify-center shadow-lg shadow-[#5D688A]/20">
								{/* Tooth SVG logo */}
								<svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
									<path d="M12 2C9.5 2 7.5 3.5 6.5 5.5C5.5 3.5 3.5 2 1.5 2C1.5 2 1 6 2 8.5C3 11 4 12 4 15C4 18 5 22 7 22C8.5 22 9 20 10 18C10.5 16.5 11 15 12 15C13 15 13.5 16.5 14 18C15 20 15.5 22 17 22C19 22 20 18 20 15C20 12 21 11 22 8.5C23 6 22.5 2 22.5 2C20.5 2 18.5 3.5 17.5 5.5C16.5 3.5 14.5 2 12 2Z" />
								</svg>
							</div>
						</div>
						<div>
							<span className="font-bold text-[#5D688A] text-sm leading-tight block">drg. Bunga Maureen</span>
							<span className="text-[10px] text-[#F7A5A5] font-medium leading-tight">Dental Care ✨</span>
						</div>
					</Link>

					{/* Desktop Nav */}
					<div className="hidden md:flex items-center gap-1">
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="px-4 py-2 rounded-xl text-sm font-medium text-[#5D688A]/80 hover:text-[#5D688A] hover:bg-white/50 transition-all duration-200"
							>
								{link.label}
							</Link>
						))}
						<Link
							href="/login"
							className="ml-1 px-4 py-2 rounded-xl text-sm font-medium text-[#5D688A]/80 hover:text-[#5D688A] hover:bg-white/50 transition-all duration-200"
						>
							Login
						</Link>
						<Link
							href="/booking"
							className="ml-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-lg"
							style={{
								background: "linear-gradient(135deg, #5D688A 0%, #7a88b0 100%)",
								boxShadow: "0 4px 15px rgba(93,104,138,0.35)"
							}}
						>
							<Sparkles className="w-3.5 h-3.5" />
							Buat Janji
						</Link>
					</div>

					{/* Mobile toggle */}
					<button
						onClick={() => setIsOpen(!isOpen)}
						className="md:hidden p-2 rounded-xl hover:bg-white/50 text-[#5D688A] transition-colors"
					>
						{isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
					</button>
				</div>
			</div>

			{/* Mobile Nav */}
			{isOpen && (
				<div className="md:hidden border-t border-white/40" style={{
					background: "rgba(255,242,239,0.90)",
					backdropFilter: "blur(20px)"
				}}>
					<div className="px-4 py-3 space-y-1">
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								onClick={() => setIsOpen(false)}
								className="block px-4 py-3 rounded-xl text-sm font-medium text-[#5D688A] hover:bg-white/60 transition-all"
							>
								{link.label}
							</Link>
						))}
						<Link
							href="/login"
							onClick={() => setIsOpen(false)}
							className="block px-4 py-3 rounded-xl text-sm font-medium text-[#5D688A] hover:bg-white/60 transition-all"
						>
							Login Dashboard
						</Link>
						<Link
							href="/booking"
							onClick={() => setIsOpen(false)}
							className="block px-4 py-3 rounded-xl text-sm font-semibold text-white text-center mt-2 hover:scale-[1.02] transition-all"
							style={{
								background: "linear-gradient(135deg, #5D688A 0%, #7a88b0 100%)",
								boxShadow: "0 4px 15px rgba(93,104,138,0.3)"
							}}
						>
							✨ Buat Janji Sekarang
						</Link>
					</div>
				</div>
			)}
		</nav>
	);
}
