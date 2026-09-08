"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, Home, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // In production, you would determine the base URL dynamically or via env var.
  // For local dev, hardcoding localhost is fine. We can use window.location.origin
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const editLink = token ? `${origin}/edit/${token}` : "";

  const copyToClipboard = () => {
    if (editLink) {
      navigator.clipboard.writeText(editLink);
      toast.success("Tautan berhasil disalin!");
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card border-border shadow-lg text-center">
      <CardHeader className="pt-6 md:pt-10 p-4 md:p-6">
        <div className="mx-auto w-16 h-16 md:w-20 md:h-20 bg-primary/20 rounded-full flex items-center justify-center mb-4 md:mb-6">
          <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-primary" />
        </div>
        <CardTitle className="text-2xl md:text-3xl font-bold text-white mb-2">Terima Kasih!</CardTitle>
        <CardDescription className="text-sm md:text-lg">
          Data keluarga Anda telah berhasil disimpan ke dalam sistem.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
        {token ? (
          <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4 md:p-6 text-left">
            <h3 className="text-secondary font-semibold text-sm md:text-base mb-2 flex items-center gap-2">
              Tautan Akses Pribadi Anda
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
              Simpan tautan di bawah ini. Anda dapat menggunakan tautan ini kapan saja untuk mengubah atau memperbarui data Anda tanpa perlu login.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-background p-2.5 md:p-3 rounded-md text-xs md:text-sm break-all font-mono border border-border text-foreground">
                {editLink}
              </code>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={copyToClipboard}
                className="shrink-0 h-[42px] w-[42px] md:h-[46px] md:w-[46px]"
                title="Salin tautan"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md text-xs md:text-sm">
            Token tidak ditemukan. Data Anda mungkin tersimpan, namun tautan edit tidak tersedia.
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 p-4 md:p-6 pb-6 md:pb-10">
        <Link href="/" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto border-border text-muted-foreground hover:text-white">
            <Home className="w-4 h-4 mr-2" /> Kembali ke Beranda
          </Button>
        </Link>
        <Link href="/tree" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-primary text-black hover:bg-primary/85 font-semibold">
            Lihat Struktural Keluarga <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function SuccessPage() {
  return (
    <div className="w-full min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-184px)] flex flex-col items-center justify-center px-4 py-6 md:px-6 md:py-12">
      <Suspense fallback={<div>Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
