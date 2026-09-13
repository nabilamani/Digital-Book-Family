"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FamilyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  family: {
    head: any;
    wife: any;
    children: any[];
  };
}

export function FamilyDetailModal({ isOpen, onClose, family }: FamilyDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  // Touch gesture states for swipe down to close on mobile
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const deltaY = e.touches[0].clientY - touchStartY;
    if (deltaY > 0) {
      setDragOffsetY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragOffsetY > 100) {
      onClose();
    }
    setDragOffsetY(0);
    setTouchStartY(null);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !family || !mounted) return null;

  const { head, wife, children = [] } = family;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  const getPhotoUrl = (photoPath: string | null) => {
    if (!photoPath) return null;
    if (photoPath.startsWith("http")) return photoPath;
    return `${supabaseUrl}/storage/v1/object/public/photos/${photoPath}`;
  };

  const formatTTL = (birthPlace: string | null, birthDate: string | null) => {
    if (birthPlace && birthDate) return `${birthPlace}, ${birthDate}`;
    if (birthPlace) return birthPlace;
    if (birthDate) return birthDate;
    return "-";
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">

      {/* Click backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Pop-up (Desktop) / Bottom Sheet (Mobile) Container */}
      <div
        style={{
          transform: dragOffsetY > 0 ? `translateY(${dragOffsetY}px)` : "none",
          transition: isDragging ? "none" : "transform 0.2s ease-out",
        }}
        className="relative w-full max-w-4xl bg-card border border-border shadow-2xl rounded-t-2xl md:rounded-2xl flex flex-col max-h-[90vh] md:max-h-[85vh] overflow-hidden z-10 animate-in slide-in-from-bottom-5 md:zoom-in-95 duration-200"
      >
        
        {/* Touch Handle Header for Mobile Bottom Sheet Swipe Down */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="block md:hidden py-3 bg-muted/40 text-center shrink-0 cursor-grab active:cursor-grabbing touch-none"
        >
          <div className="w-12 h-1.5 bg-muted-foreground/50 rounded-full mx-auto" />
        </div>

        {/* Header Bar */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20 shrink-0 md:touch-auto"
        >

          <div>
            <h3 className="text-lg md:text-xl font-bold text-foreground">
              Detail Data Keluarga - {head?.full_name || "-"}
            </h3>
            <p className="text-xs text-muted-foreground">Informasi detail anggota keluarga</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full w-8 h-8 hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Scrollable Body - Matching original grid layout with photo & child birth data */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Data Kepala Keluarga & Istri */}
            <div className="space-y-4">
              {/* Data Kepala Keluarga */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/40 bg-muted shrink-0 flex items-center justify-center">
                    {getPhotoUrl(head?.photo_path) ? (
                      <img
                        src={getPhotoUrl(head.photo_path)!}
                        alt={head.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-500/10 text-blue-400 flex items-center justify-center">
                        <User className="w-7 h-7" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary text-base">Data Kepala Keluarga</h4>
                    <p className="text-xs text-muted-foreground">{head?.full_name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm bg-background border border-border p-3 rounded-lg md:bg-transparent md:border-transparent md:p-0">
                  <div className="text-muted-foreground">Nama Lengkap:</div>
                  <div className="font-medium">{head?.full_name || "-"}</div>
                  <div className="text-muted-foreground">TTL:</div>
                  <div className="font-medium">{formatTTL(head?.birth_place, head?.birth_date)}</div>
                  <div className="text-muted-foreground">Pendidikan:</div>
                  <div className="font-medium">{head?.education || "-"}</div>
                  <div className="text-muted-foreground">Pekerjaan:</div>
                  <div className="font-medium">{head?.occupation || "-"}</div>
                  <div className="text-muted-foreground">No. Telp:</div>
                  <div className="font-medium">{head?.phone || "-"}</div>
                  <div className="text-muted-foreground">Email:</div>
                  <div className="font-medium break-all">{head?.email || "-"}</div>
                  <div className="text-muted-foreground">Alamat:</div>
                  <div className="font-medium break-words">{head?.address || "-"}</div>
                  <div className="text-muted-foreground">Status Hidup:</div>
                  <div className="font-medium">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      head?.life_status === "alive" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    }`}>
                      {head?.life_status === "alive" ? "Hidup" : "Meninggal"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Istri */}
              {wife && (
                <div className="md:border-t md:border-border md:pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-pink-500/40 bg-muted shrink-0 flex items-center justify-center">
                      {getPhotoUrl(wife?.photo_path) ? (
                        <img
                          src={getPhotoUrl(wife.photo_path)!}
                          alt={wife.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-pink-500/10 text-pink-400 flex items-center justify-center">
                          <User className="w-7 h-7" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-pink-400 text-base">Data Istri</h4>
                      <p className="text-xs text-muted-foreground">{wife.full_name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm bg-background border border-border p-3 rounded-lg md:bg-transparent md:border-transparent md:p-0">
                    <div className="text-muted-foreground">Nama Lengkap:</div>
                    <div className="font-medium">{wife.full_name || "-"}</div>
                    <div className="text-muted-foreground">TTL:</div>
                    <div className="font-medium">{formatTTL(wife.birth_place, wife.birth_date)}</div>
                    <div className="text-muted-foreground">Pendidikan:</div>
                    <div className="font-medium">{wife.education || "-"}</div>
                    <div className="text-muted-foreground">Pekerjaan:</div>
                    <div className="font-medium">{wife.occupation || "-"}</div>
                    <div className="text-muted-foreground">No. Telp:</div>
                    <div className="font-medium">{wife.phone || "-"}</div>
                    <div className="text-muted-foreground">Email:</div>
                    <div className="font-medium break-all">{wife.email || "-"}</div>
                    <div className="text-muted-foreground">Alamat:</div>
                    <div className="font-medium break-words">{wife.address || "-"}</div>
                    <div className="text-muted-foreground">Status Hidup:</div>
                    <div className="font-medium">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        wife.life_status === "alive" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      }`}>
                        {wife.life_status === "alive" ? "Hidup" : "Meninggal"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Data Anak */}
            <div>
              <h4 className="font-semibold text-blue-400 mb-3 text-base">Data Anak ({children.length})</h4>
              {children.length > 0 ? (
                <div className="space-y-3">
                  {children.map((child: any, idx: number) => {
                    const isMaleChild = child.gender === "L" || child.gender === "Laki-laki";
                    return (
                      <div key={child.id || idx} className="p-3.5 rounded-lg bg-background border border-border text-sm space-y-2">
                        <div className="flex items-center gap-3">
                          {/* <div className="w-10 h-10 rounded-full overflow-hidden border border-border bg-muted shrink-0 flex items-center justify-center">
                            {getPhotoUrl(child.photo_path) ? (
                              <img
                                src={getPhotoUrl(child.photo_path)!}
                                alt={child.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className={`w-full h-full flex items-center justify-center ${
                                isMaleChild ? "bg-blue-500/10 text-blue-400" : "bg-pink-500/10 text-pink-400"
                              }`}>
                                <User className="w-5 h-5" />
                              </div>
                            )}
                          </div> */}
                          <div className="font-medium text-foreground">{idx + 1}. {child.full_name}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 text-xs pt-1">
                          <div className="text-muted-foreground">Jenis Kelamin:</div>
                          <div>{isMaleChild ? "Laki-laki" : "Perempuan"}</div>
                          <div className="text-muted-foreground">TTL (Data Kelahiran):</div>
                          <div className="font-medium text-foreground">{formatTTL(child.birth_place, child.birth_date)}</div>
                          <div className="text-muted-foreground">Pendidikan:</div>
                          <div>{child.education || "-"}</div>
                          {child.occupation && (
                            <>
                              <div className="text-muted-foreground">Pekerjaan:</div>
                              <div>{child.occupation}</div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Belum ada data anak.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-muted/20 flex justify-end shrink-0">
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-md text-xs md:text-sm">
            Tutup
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

