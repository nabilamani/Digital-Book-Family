"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, Network, Heart, Sparkles, BookOpen } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="w-full min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-184px)] flex flex-col items-center justify-center px-4 py-8 md:px-6 md:py-12">
      <Card className="w-full max-w-3xl mx-auto bg-card border-border shadow-xl text-center overflow-hidden">
        {/* Decorative Top Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-primary to-teal-600 py-3 px-4 text-emerald-950 font-semibold text-xs md:text-sm flex items-center justify-center gap-2">
          {/* <Sparkles className="w-4 h-4 shrink-0" /> */}
          <span>Buku Induk Digital Keluarga Besar</span>
          {/* <Sparkles className="w-4 h-4 shrink-0" /> */}
        </div>

        <CardHeader className="pt-6 md:pt-10 p-4 md:p-6 pb-2 md:pb-4">
          <div className="mx-auto w-16 h-16 md:w-20 md:h-20 bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center justify-center mb-4 md:mb-5">
            <CheckCircle2 className="w-9 h-9 md:w-11 md:h-11 text-emerald-500" />
          </div>

          <p className="text-xl md:text-2xl font-serif text-emerald-400 font-bold tracking-wide mb-1" dir="rtl">
            جَزَاكُمُ اللهُ خَيْرًا كَثِيْرًا
          </p>
          <CardTitle className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Terima Kasih Banyak!
          </CardTitle>
          <CardDescription className="text-xs md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Alhamdulillah, formulir pendataan keluarga Anda telah <span className="text-foreground font-semibold">berhasil tersimpan</span> ke dalam sistem Buku Induk Digital Keluarga Besar.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6 text-left">
          {/* Section Doa & Ayat Islami */}
          <div className="bg-gradient-to-b from-secondary/10 to-background border border-secondary/25 rounded-2xl p-4 md:p-6 space-y-5 md:space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
              <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-bold text-foreground">
                  Doa & Keberkahan untuk Keluarga Besar
                </h3>
                <p className="text-xs text-muted-foreground">Ayat Al-Qur&apos;an dan Hadits tentang Silaturahmi</p>
              </div>
            </div>

            {/* 1. QS Al Furqan 74 */}
            <div className="bg-card/70 border border-border/80 rounded-xl p-4 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-secondary font-medium">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 fill-secondary/30" /> Doa Keturunan & Pasangan
                </span>
                <span className="font-mono text-[11px] bg-secondary/10 px-2 py-0.5 rounded">QS. Al-Furqan: 74</span>
              </div>
              <p className="text-right text-lg md:text-xl font-serif text-emerald-300 leading-loose py-1" dir="rtl">
                وَالَّذِينَ يَقُولُونَ رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا
              </p>
              <p className="text-xs md:text-sm text-muted-foreground italic leading-relaxed">
                &ldquo;Dan orang-orang yang berkata, &apos;Ya Tuhan kami, anugerahkanlah kepada kami pasangan kami dan keturunan kami sebagai penyenang hati (kami), dan jadikanlah kami pemimpin bagi orang-orang yang bertakwa.&apos;&rdquo;
              </p>
            </div>

            {/* 2. Hadits Silaturahmi */}
            <div className="bg-card/70 border border-border/80 rounded-xl p-4 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Keutamaan Menyambung Silaturahmi
                </span>
                <span className="font-mono text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded">HR. Bukhari & Muslim</span>
              </div>
              <p className="text-right text-lg md:text-xl font-serif text-emerald-300 leading-loose py-1" dir="rtl">
                مَنْ أَحَبَّ أَنْ يُبْسَطَ لَهُ فِي رِزْقِهِ وَيُنْسَأَ لَهُ فِي أَثَرِهِ فَلْيَصِلْ رَحِمَهُ
              </p>
              <p className="text-xs md:text-sm text-muted-foreground italic leading-relaxed">
                &ldquo;Barangsiapa yang ingin diluaskan rezekinya dan dipanjangkan umurnya, hendaklah ia menyambung tali silaturahmi.&rdquo;
              </p>
            </div>

            {/* 3. Doa Persatuan Keluarga */}
            <div className="bg-card/70 border border-border/80 rounded-xl p-4 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-teal-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" /> Doa Keberkahan Keluarga
                </span>
              </div>
              <p className="text-right text-lg md:text-xl font-serif text-emerald-300 leading-loose py-1" dir="rtl">
                اللَّهُمَّ اجْعَلْ هَذَا الْجَمْعَ جَمْعًا مَرْحُوْمًا، وَتَفَرُّقَنَا مِنْ بَعْدِهِ تَفَرُّقًا مَعْصُوْمًا
              </p>
              <p className="text-xs md:text-sm text-muted-foreground italic leading-relaxed">
                &ldquo;Ya Allah, jadikanlah perkumpulan keluarga kami ini perkumpulan yang dirahmati, dan perpisahan kami setelahnya perpisahan yang terpelihara dari keburukan dan kejahatan.&rdquo;
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 p-4 md:p-6 pb-6 md:pb-8">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto border-border text-muted-foreground hover:text-foreground">
              <Home className="w-4 h-4 mr-2" /> Kembali ke Beranda
            </Button>
          </Link>
          <Link href="/tree" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-primary text-black hover:bg-primary/85 font-semibold">
              <Network className="w-4 h-4 mr-2" /> Lihat Silsilah Keluarga
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
