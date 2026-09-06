"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FamilyTableRow({ family }: { family: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { head, wife, children } = family;

  return (
    <>
      <tr className="hover:bg-muted/30 transition-colors border-b border-border">
        <td className="px-6 py-4 font-medium text-foreground">{head.full_name}</td>
        <td className="px-6 py-4 text-muted-foreground">{head.family_status || "-"}</td>
        <td className="px-6 py-4 text-muted-foreground">{wife ? wife.full_name : "-"}</td>
        <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate" title={head.address || "-"}>
          {head.address || "-"}
        </td>
        <td className="px-6 py-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1"
          >
            {isExpanded ? "Tutup" : "Detail"}
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </td>
      </tr>
      
      {isExpanded && (
        <tr className="bg-muted/10">
          <td colSpan={5} className="px-6 py-6 border-b border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Data Kepala Keluarga & Istri */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-primary mb-3">Data Kepala Keluarga</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Nama Lengkap:</div>
                    <div className="font-medium">{head.full_name}</div>
                    <div className="text-muted-foreground">TTL:</div>
                    <div className="font-medium">{head.birth_place || "-"}{head.birth_date ? `, ${head.birth_date}` : ""}</div>
                    <div className="text-muted-foreground">Pendidikan:</div>
                    <div className="font-medium">{head.education || "-"}</div>
                    <div className="text-muted-foreground">Pekerjaan:</div>
                    <div className="font-medium">{head.occupation || "-"}</div>
                    <div className="text-muted-foreground">No. Telp:</div>
                    <div className="font-medium">{head.phone || "-"}</div>
                    <div className="text-muted-foreground">Email:</div>
                    <div className="font-medium">{head.email || "-"}</div>
                    <div className="text-muted-foreground">Alamat:</div>
                    <div className="font-medium break-words">{head.address || "-"}</div>
                    <div className="text-muted-foreground">Status Hidup:</div>
                    <div className="font-medium">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        head.life_status === "alive" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      }`}>
                        {head.life_status === "alive" ? "Hidup" : "Meninggal"}
                      </span>
                    </div>
                  </div>
                </div>

                {wife && (
                  <div>
                    <h4 className="font-semibold text-pink-400 mb-3">Data Istri</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Nama Lengkap:</div>
                      <div className="font-medium">{wife.full_name}</div>
                      <div className="text-muted-foreground">TTL:</div>
                      <div className="font-medium">{wife.birth_place || "-"}{wife.birth_date ? `, ${wife.birth_date}` : ""}</div>
                      <div className="text-muted-foreground">Pendidikan:</div>
                      <div className="font-medium">{wife.education || "-"}</div>
                      <div className="text-muted-foreground">Pekerjaan:</div>
                      <div className="font-medium">{wife.occupation || "-"}</div>
                      <div className="text-muted-foreground">No. Telp:</div>
                      <div className="font-medium">{wife.phone || "-"}</div>
                      <div className="text-muted-foreground">Email:</div>
                      <div className="font-medium">{wife.email || "-"}</div>
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
                <h4 className="font-semibold text-blue-400 mb-3">Data Anak ({children.length})</h4>
                {children.length > 0 ? (
                  <div className="space-y-3">
                    {children.map((child: any, idx: number) => (
                      <div key={child.id} className="p-3 rounded-md bg-background border border-border text-sm">
                        <div className="font-medium text-foreground">{idx + 1}. {child.full_name}</div>
                        <div className="grid grid-cols-2 gap-1 mt-2">
                          <div className="text-muted-foreground">Jenis Kelamin:</div>
                          <div>{child.gender === "L" || child.gender === "Laki-laki" ? "Laki-laki" : "Perempuan"}</div>
                          <div className="text-muted-foreground">Pendidikan:</div>
                          <div>{child.education || "-"}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Belum ada data anak.</p>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
