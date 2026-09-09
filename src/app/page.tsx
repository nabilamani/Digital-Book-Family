"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Network, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center justify-center text-center px-4 md:px-12 xl:px-[128px] pt-8 md:pt-[80px] pb-12 md:pb-[128px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-[1000px] flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary text-xs md:text-sm font-semibold mb-4 md:mb-6">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            Digital Family Book
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-4 md:mb-6 leading-tight">
            Warisan Keluarga dalam <br className="hidden md:block" />
            <span className="text-primary">Buku Digital Interaktif</span>
          </h1>
          <p className="text-base sm:text-lg md:text-2xl text-muted-foreground max-w-[800px] mb-8 md:mb-12">
            Platform modern untuk mengumpulkan, menghubungkan, dan mencetak silsilah serta profil keluarga besar Anda secara kolektif.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <Link href="/form" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-primary text-black hover:bg-primary/85 rounded-full px-6 md:px-8 py-4 md:py-6 h-auto text-base md:text-lg font-semibold flex items-center justify-center gap-2">
                Mulai Isi Data <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/family/list" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto border-border text-foreground hover:bg-white/5 rounded-full px-6 md:px-8 py-4 md:py-6 h-auto text-base md:text-lg font-normal justify-center">
                Lihat Data Keluarga
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-[#162129] px-4 md:px-12 xl:px-[128px] py-8 md:py-[64px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-[1280px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-card border-border h-full hover:border-primary/50 transition-colors">
              <CardHeader className="p-5 md:p-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 md:mb-4">
                  <Network className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <CardTitle className="text-xl md:text-2xl font-bold">Input Bebas & Fleksibel</CardTitle>
                <CardDescription className="text-sm md:text-base text-muted-foreground mt-2">
                  Tidak perlu berurutan dari generasi tertua. Setiap anggota bisa mengisi datanya masing-masing dan sistem akan menghubungkannya nanti.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-card border-border h-full hover:border-primary/50 transition-colors">
              <CardHeader className="p-5 md:p-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 md:mb-4">
                  <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <CardTitle className="text-xl md:text-2xl font-bold">Buku Digital Otomatis</CardTitle>
                <CardDescription className="text-sm md:text-base text-muted-foreground mt-2">
                  Data yang terkumpul dapat di-generate menjadi format PDF dengan layout buku keluarga yang rapi, lengkap dengan daftar isi.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-card border-border h-full hover:border-primary/50 transition-colors">
              <CardHeader className="p-5 md:p-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 md:mb-4">
                  <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <CardTitle className="text-xl md:text-2xl font-bold">Aman & Terkendali</CardTitle>
                <CardDescription className="text-sm md:text-base text-muted-foreground mt-2">
                  Tanpa proses login yang rumit. Anda akan mendapatkan tautan khusus (Edit Token) setelah mengisi form untuk mengelola data Anda.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
