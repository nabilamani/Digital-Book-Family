import { Network, Construction } from "lucide-react";

export default function TreePage() {
  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-92px)]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 md:px-12 xl:px-[128px] py-3 md:py-4 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Network className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-foreground">Struktural Keluarga</h1>
          </div>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4 py-12">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted flex items-center justify-center">
          <Construction className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Coming Soon</h2>
        <p className="text-sm md:text-base text-muted-foreground max-w-md">
          Fitur Struktural Keluarga saat ini sedang dalam tahap pengembangan dan belum dapat digunakan.
        </p>
      </div>
    </div>
  );
}
