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
      <section className="w-full flex flex-col items-center justify-center text-center px-6 md:px-12 xl:px-[128px] pt-[80px] pb-[128px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-[1000px] flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary text-sm font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            Private Alpha
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Warisan Keluarga dalam <br className="hidden md:block" /> 
            <span className="text-primary">Buku Digital Interaktif</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-[800px] mb-12">
            Platform modern untuk mengumpulkan, menghubungkan, dan mencetak silsilah serta profil keluarga besar Anda secara kolektif.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/form">
              <Button className="bg-primary text-black hover:bg-primary/85 rounded-full px-8 py-6 h-auto text-lg font-semibold flex items-center gap-2">
                Mulai Isi Data <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/family/list">
              <Button variant="outline" className="border-border text-foreground hover:bg-white/5 rounded-full px-8 py-6 h-auto text-lg font-normal">
                Lihat Data Keluarga
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-[#162129] px-6 md:px-12 xl:px-[128px] py-[64px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1280px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-card border-border h-full hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Network className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">Input Bebas & Fleksibel</CardTitle>
                <CardDescription className="text-base text-muted-foreground mt-2">
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
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">Buku Digital Otomatis</CardTitle>
                <CardDescription className="text-base text-muted-foreground mt-2">
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
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">Aman & Terkendali</CardTitle>
                <CardDescription className="text-base text-muted-foreground mt-2">
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
