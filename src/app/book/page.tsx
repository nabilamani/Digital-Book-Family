import { BookOpen, Construction } from "lucide-react";

export default function BookPage() {
  return (
    <div className="flex flex-col w-full h-[calc(100vh-92px)]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 md:px-12 xl:px-[128px] py-4 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Buku Digital Keluarga</h1>
          </div>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <Construction className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Coming Soon</h2>
        <p className="text-muted-foreground max-w-md">
          Fitur Buku Digital saat ini sedang dalam tahap pengembangan dan belum dapat digunakan.
        </p>
      </div>
    </div>
  );
}
