"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w-full h-[92px] bg-transparent flex items-center justify-between px-6 md:px-12 xl:px-[128px]">
      <div className="flex items-center">
        <Link href="/" className="text-white text-xl font-bold tracking-tight">
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
          className="text-white p-2"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-[92px] left-0 w-full bg-card border-b border-border p-6 flex flex-col gap-4 z-50 md:hidden">
          <Link 
            href="/family/list" 
            className="text-white text-[16px] font-normal hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Data Keluarga
          </Link>
          <Link 
            href="/tree" 
            className="text-white text-[16px] font-normal hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Struktural Keluarga
          </Link>
          <Link 
            href="/book" 
            className="text-white text-[16px] font-normal hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Buku Digital
          </Link>
          <Link href="/form" onClick={() => setIsMobileMenuOpen(false)}>
            <Button className="w-full mt-2 bg-primary text-black hover:bg-primary/85 rounded-full px-6 py-3 h-auto font-semibold">
              Mulai Isi Data
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
