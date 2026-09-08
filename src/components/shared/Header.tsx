"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w-full h-16 md:h-[92px] bg-card/60 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border-b border-border/40 md:border-b-0 sticky top-0 md:relative z-40 flex items-center justify-between px-4 md:px-12 xl:px-[128px]">
      <div className="flex items-center">
        <Link href="/" className="text-white text-lg md:text-xl font-bold tracking-tight">
          BukuKeluarga<span className="text-primary">.</span>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-4">
        <Link 
          href="/family/list" 
          className="text-white text-[16px] font-normal hover:text-primary transition-colors px-2 py-1"
        >
          Data Keluarga
        </Link>
        <Link 
          href="/tree" 
          className="text-white text-[16px] font-normal hover:text-primary transition-colors px-2 py-1"
        >
          Struktural Keluarga
        </Link>
        <Link 
          href="/book" 
          className="text-white text-[16px] font-normal hover:text-primary transition-colors px-2 py-1"
        >
          Buku Digital
        </Link>
        <Link href="/form">
          <Button className="ml-4 bg-primary text-black hover:bg-primary/85 rounded-full px-6 py-3 h-auto font-semibold">
            Mulai Isi Data
          </Button>
        </Link>
      </nav>

      {/* Mobile Navigation Toggle */}
      <div className="md:hidden">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white p-2 rounded-md hover:bg-white/10 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-card/95 backdrop-blur-lg border-b border-border p-5 flex flex-col gap-3.5 z-50 md:hidden shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <Link 
            href="/family/list" 
            className="text-white text-base font-medium hover:text-primary transition-colors py-1.5 px-2 rounded-md hover:bg-white/5"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Data Keluarga
          </Link>
          <Link 
            href="/tree" 
            className="text-white text-base font-medium hover:text-primary transition-colors py-1.5 px-2 rounded-md hover:bg-white/5"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Struktural Keluarga
          </Link>
          <Link 
            href="/book" 
            className="text-white text-base font-medium hover:text-primary transition-colors py-1.5 px-2 rounded-md hover:bg-white/5"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Buku Digital
          </Link>
          <Link href="/form" onClick={() => setIsMobileMenuOpen(false)} className="pt-2">
            <Button className="w-full bg-primary text-black hover:bg-primary/85 rounded-full py-2.5 h-auto font-semibold text-sm shadow-md">
              Mulai Isi Data
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
