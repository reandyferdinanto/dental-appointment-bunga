"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Sparkles, Calendar, Clock, Home } from "lucide-react";

const navLinks = [
	{ href: "/", label: "Beranda", icon: Home },
	{ href: "/jadwal", label: "Jadwal", icon: Clock },
	{ href: "/booking", label: "Booking", icon: Calendar },
];

export default function Navbar() {
	const [isOpen, setIsOpen] = useState(false);
	const pathname = usePathname();
	const menuRef = useRef<HTMLDivElement>(null);

	// Close menu when route changes
	useEffect(() => { setIsOpen(false); }, [pathname]);

	// Close menu on outside click
	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		}
		if (isOpen) document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, [isOpen]);

	// Prevent body scroll when menu open
	useEffect(() => {
		document.body.style.overflow = isOpen ? "hidden" : "";
		return () => { document.body.style.overflow = ""; };
	}, [isOpen]);

	return (
		<nav
			ref={menuRef}
			className="glass sticky top-0 z-50"
			style={{
				background: "rgba(255,242,239,0.82)",
				backdropFilter: "blur(20px)",
				WebkitBackdropFilter: "blur(20px)",
				borderBottom: "1px solid rgba(247,165,165,0.25)"
			}}
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">

					{/* Logo */}
					<Link href="/" className="flex items-center gap-2.5 group tap-feedback" aria-label="Beranda">
						<div className="relative w-9 h-9 sm:w-10 sm:h-10">
							<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#F7A5A5] to-[#FFDBB6] opacity-60 blur-sm group-hover:opacity-90 transition-opacity" />
							<div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#5D688A] to-[#7a88b0] flex items-center justify-center shadow-lg shadow-[#5D688A]/20">
								<svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
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
						{navLinks.map((link) => {
							const isActive = pathname === link.href;
							return (
								<Link
									key={link.href}
									href={link.href}
									className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
									style={isActive ? {
										background: "rgba(247,165,165,0.18)",
										color: "#5D688A",
										fontWeight: 700,
									} : {
										color: "rgba(93,104,138,0.75)"
									}}
								>
									{link.label}
								</Link>
							);
						})}
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
						className="md:hidden p-2.5 rounded-xl hover:bg-white/50 text-[#5D688A] transition-colors tap-feedback"
						aria-expanded={isOpen}
						aria-label="Toggle menu"
					>
						{isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
					</button>
				</div>
			</div>

			{/* Mobile Nav — animated slide down */}
			<div
				className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}`}
				style={{ borderTop: isOpen ? "1px solid rgba(247,165,165,0.2)" : "none" }}
			>
				<div className="px-4 py-3 space-y-1" style={{ background: "rgba(255,242,239,0.95)", backdropFilter: "blur(20px)" }}>
					{navLinks.map((link) => {
						const isActive = pathname === link.href;
						const Icon = link.icon;
						return (
							<Link
								key={link.href}
								href={link.href}
								onClick={() => setIsOpen(false)}
								className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all tap-feedback"
								style={isActive ? {
									background: "rgba(247,165,165,0.2)",
									color: "#5D688A",
									fontWeight: 700,
									border: "1px solid rgba(247,165,165,0.3)"
								} : {
									color: "#5D688A"
								}}
							>
								<Icon className="w-4 h-4" style={{ color: isActive ? "#F7A5A5" : "rgba(93,104,138,0.6)" }} />
								{link.label}
								{isActive && <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(247,165,165,0.3)", color: "#F7A5A5" }}>Aktif</span>}
							</Link>
						);
					})}
					<Link
						href="/login"
						onClick={() => setIsOpen(false)}
						className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium text-[#5D688A] transition-all tap-feedback"
					>
						<svg className="w-4 h-4 text-[#5D688A]/60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
						Login Dashboard
					</Link>
					<div className="pt-1 pb-1">
						<Link
							href="/booking"
							onClick={() => setIsOpen(false)}
							className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-2xl text-sm font-bold text-white transition-all hover:scale-[1.01] tap-feedback"
							style={{
								background: "linear-gradient(135deg, #5D688A 0%, #7a88b0 100%)",
								boxShadow: "0 4px 15px rgba(93,104,138,0.3)"
							}}
						>
							<Sparkles className="w-4 h-4" />
							Buat Janji Sekarang ✨
						</Link>
					</div>
				</div>
			</div>
		</nav>
	);
}
