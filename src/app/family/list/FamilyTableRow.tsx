"use client";

import { useState } from "react";
import { Eye, CheckSquare, Square, BookCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FamilyDetailModal } from "./FamilyDetailModal";

interface FamilyTableRowProps {
  family: any;
  isMobileCard?: boolean;
  isPaperBookChecked?: boolean;
  onTogglePaperBook?: (personId: string, newValue: boolean) => void;
}

export function FamilyTableRow({
  family,
  isMobileCard = false,
  isPaperBookChecked = false,
  onTogglePaperBook,
}: FamilyTableRowProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { head, wife } = family;

  const handleToggle = () => {
    if (onTogglePaperBook && head?.id) {
      onTogglePaperBook(head.id, !isPaperBookChecked);
    }
  };

  if (isMobileCard) {
    return (
      <>
        <div className={`bg-card rounded-lg border p-4 shadow-sm space-y-3 transition-colors ${
          isPaperBookChecked ? "border-green-500/40 bg-green-500/5" : "border-border"
        }`}>
          <div className="flex justify-between items-start gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground text-base">{head.full_name}</h3>
                {isPaperBookChecked && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-green-500/15 text-green-600 px-2 py-0.5 rounded-full border border-green-500/30">
                    <BookCheck className="w-3 h-3" /> Buku Kertas
                  </span>
                )}
              </div>
              <p className="text-xs text-primary font-medium mt-0.5">{head.family_status || "Kepala Keluarga"}</p>
            </div>
            
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant={isPaperBookChecked ? "default" : "outline"}
                size="sm"
                onClick={handleToggle}
                title={isPaperBookChecked ? "Sudah dimasukkan ke Buku Kertas (Klik untuk hapus)" : "Tandai sudah masuk Buku Kertas"}
                className={`h-8 px-2.5 text-xs rounded-md transition-all ${
                  isPaperBookChecked
                    ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                    : "text-muted-foreground hover:text-foreground border-border hover:bg-muted"
                }`}
              >
                {isPaperBookChecked ? (
                  <CheckSquare className="w-4 h-4 text-white" />
                ) : (
                  <Square className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDetailOpen(true)}
                className="flex items-center gap-1.5 text-xs h-8 text-primary border-primary/30 hover:bg-primary/10 hover:text-primary"
              >
                <Eye className="w-3.5 h-3.5" />
                Detail
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1 bg-background/50 p-2.5 rounded-md border border-border/50">
            <div><span className="font-medium text-foreground">Nama Istri:</span> {wife ? wife.full_name : "-"}</div>
            <div><span className="font-medium text-foreground">Alamat:</span> {head.address || "-"}</div>
          </div>
        </div>

        <FamilyDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          family={family}
        />
      </>
    );
  }

  return (
    <>
      <tr className={`transition-colors border-b border-border ${
        isPaperBookChecked ? "bg-green-500/5 hover:bg-green-500/10" : "hover:bg-muted/30"
      }`}>
        <td className="px-4 py-4 text-center w-14">
          <button
            type="button"
            onClick={handleToggle}
            title={isPaperBookChecked ? "Sudah di Buku Kertas (Klik untuk membatalkan)" : "Tandai sudah masuk ke Buku Kertas"}
            className={`p-1.5 rounded-md transition-all inline-flex items-center justify-center ${
              isPaperBookChecked
                ? "bg-green-500/20 text-green-600 hover:bg-green-500/30"
                : "text-muted-foreground/60 hover:text-foreground hover:bg-muted"
            }`}
          >
            {isPaperBookChecked ? (
              <CheckSquare className="w-5 h-5 text-green-500" />
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>
        </td>
        <td className="px-6 py-4 font-medium text-foreground">
          <div className="flex items-center gap-2">
            <span>{head.full_name}</span>
            {isPaperBookChecked && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-green-500/15 text-green-600 px-2 py-0.5 rounded-full border border-green-500/30">
                <BookCheck className="w-3 h-3" /> Buku Kertas
              </span>
            )}
          </div>
        </td>
        <td className="px-6 py-4 text-muted-foreground">{head.family_status || "-"}</td>
        <td className="px-6 py-4 text-muted-foreground">{wife ? wife.full_name : "-"}</td>
        <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate" title={head.address || "-"}>
          {head.address || "-"}
        </td>
        <td className="px-6 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDetailOpen(true)}
            className="flex items-center gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/10 hover:text-primary"
          >
            <Eye className="w-3.5 h-3.5" />
            Detail
          </Button>
        </td>
      </tr>

      <FamilyDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        family={family}
      />
    </>
  );
}


