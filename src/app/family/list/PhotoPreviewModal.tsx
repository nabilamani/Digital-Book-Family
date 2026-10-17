"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Download, ExternalLink, User, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoPerson {
  label: string;
  role: string;
  full_name: string;
  photo_path: string | null;
  gender?: string | null;
}

interface PhotoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  persons: PhotoPerson[];
  initialIndex?: number;
}

export function PhotoPreviewModal({
  isOpen,
  onClose,
  persons,
  initialIndex = 0,
}: PhotoPreviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(initialIndex);
      setImageLoaded(false);
    }
  }, [isOpen, initialIndex]);

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

  if (!isOpen || !mounted || persons.length === 0) return null;

  const currentPerson = persons[selectedIndex] || persons[0];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  const getFullUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${supabaseUrl}/storage/v1/object/public/photos/${path}`;
  };

  const photoUrl = getFullUrl(currentPerson?.photo_path);

  const handleDownload = async () => {
    if (!photoUrl) return;
    setIsDownloading(true);
    try {
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const sanitizedName = (currentPerson.full_name || "foto")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_");
      const roleName = (currentPerson.role || "anggota")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_");
      a.download = `Foto_${roleName}_${sanitizedName}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error downloading photo:", err);
      // Fallback: open in new tab
      window.open(photoUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-card border border-border shadow-2xl rounded-2xl flex flex-col overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm sm:text-base text-foreground">
              Preview Foto Keluarga
            </h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Person Selector Tabs (if more than 1 person) */}
        {persons.length > 1 && (
          <div className="flex border-b border-border bg-background/50 p-1.5 gap-1.5">
            {persons.map((p, idx) => {
              const isActive = idx === selectedIndex;
              const hasPhoto = Boolean(p.photo_path);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedIndex(idx);
                    setImageLoaded(false);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-primary text-black font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="truncate">{p.label}</span>
                  {!hasPhoto && (
                    <span className="text-[10px] opacity-75">(Kosong)</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Photo Display Body */}
        <div className="p-5 flex flex-col items-center justify-center bg-black/20 min-h-[280px] max-h-[60vh] overflow-hidden">
          {photoUrl ? (
            <div className="relative w-full max-w-xs aspect-3/4 rounded-xl overflow-hidden border border-border bg-muted shadow-lg flex items-center justify-center group">
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={currentPerson.full_name}
                onLoad={() => setImageLoaded(true)}
                className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-2">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground/60 border border-border">
                <User className="w-8 h-8" />
              </div>
              <p className="text-xs font-medium text-foreground">
                Belum ada foto yang diunggah
              </p>
              <p className="text-[11px] text-muted-foreground max-w-xs">
                Foto untuk {currentPerson.full_name || currentPerson.label} belum tersedia di database.
              </p>
            </div>
          )}

          {/* Person Info Details */}
          <div className="mt-3.5 text-center">
            <h4 className="font-bold text-foreground text-sm sm:text-base">
              {currentPerson.full_name || "-"}
            </h4>
            <p className="text-xs text-primary font-medium mt-0.5">
              {currentPerson.role}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-2 p-3 sm:p-4 border-t border-border bg-muted/20">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Tutup
          </Button>

          <div className="flex items-center gap-2">
            {photoUrl && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(photoUrl, "_blank")}
                  className="text-xs border-border hover:bg-muted"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Buka Asli
                </Button>

                <Button
                  size="sm"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="bg-primary text-black hover:bg-primary/90 text-xs font-semibold"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Mengunduh...
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Unduh Foto
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
