"use client";

import { useState, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Search, Edit2, Trash2, Plus, X, ChevronDown, ChevronUp, Users, User, Heart, Baby, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { createAdminFamily, updateAdminFamily, deleteAdminFamily } from "@/actions/admin-actions";
import { useRouter } from "next/navigation";

export function FamiliesTable({ families }: { families: any[] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"husband" | "wife" | "children">("husband");
  const [isLoading, setIsLoading] = useState(false);
  const [familyToDelete, setFamilyToDelete] = useState<any | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<any>({
    husband: {
      nik: "",
      full_name: "",
      family_status: "",
      birth_place: "",
      birth_date: "",
      education: "",
      occupation: "",
      phone: "",
      email: "",
      address: "",
      life_status: "alive",
    },
    wife: {
      has_wife: false,
      nik: "",
      full_name: "",
      family_status: "",
      birth_place: "",
      birth_date: "",
      education: "",
      occupation: "",
      phone: "",
      email: "",
      address: "",
      parent_name: "",
      parent_address: "",
      life_status: "alive",
    },
    children: [] as any[],
  });

  const toggleExpand = (headId: string) => {
    setExpandedRows((prev) => ({ ...prev, [headId]: !prev[headId] }));
  };

  const openModalForNew = () => {
    setEditingFamily(null);
    setFormData({
      husband: {
        nik: "",
        full_name: "",
        family_status: "",
        birth_place: "",
        birth_date: "",
        education: "",
        occupation: "",
        phone: "",
        email: "",
        address: "",
        life_status: "alive",
      },
      wife: {
        has_wife: false,
        nik: "",
        full_name: "",
        family_status: "",
        birth_place: "",
        birth_date: "",
        education: "",
        occupation: "",
        phone: "",
        email: "",
        address: "",
        parent_name: "",
        parent_address: "",
        life_status: "alive",
      },
      children: [],
    });
    setActiveTab("husband");
    setIsModalOpen(true);
  };

  const openModalForEdit = (family: any) => {
    setEditingFamily(family);
    const head = family.head || {};
    const wife = family.wife || null;
    const children = family.children || [];

    setFormData({
      husband: {
        nik: head.nik || "",
        full_name: head.full_name || "",
        family_status: head.family_status || "",
        birth_place: head.birth_place || "",
        birth_date: head.birth_date || "",
        education: head.education || "",
        occupation: head.occupation || "",
        phone: head.phone || "",
        email: head.email || "",
        address: head.address || "",
        life_status: head.life_status || "alive",
      },
      wife: {
        has_wife: !!wife,
        nik: wife?.nik || "",
        full_name: wife?.full_name || "",
        family_status: wife?.family_status || "",
        birth_place: wife?.birth_place || "",
        birth_date: wife?.birth_date || "",
        education: wife?.education || "",
        occupation: wife?.occupation || "",
        phone: wife?.phone || "",
        email: wife?.email || "",
        address: wife?.address || "",
        parent_name: wife?.parent_name || "",
        parent_address: wife?.parent_address || "",
        life_status: wife?.life_status || "alive",
      },
      children: children.map((c: any) => ({
        id: c.id,
        nik: c.nik || "",
        full_name: c.full_name || "",
        gender: c.gender === "Laki-laki" || c.gender === "L" ? "L" : "P",
        birth_place: c.birth_place || "",
        birth_date: c.birth_date || "",
        education: c.education || "",
        life_status: c.life_status || "alive",
      })),
    });
    setActiveTab("husband");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleAddChild = () => {
    setFormData((prev: any) => ({
      ...prev,
      children: [
        ...prev.children,
        { nik: "", full_name: "", gender: "L", birth_place: "", birth_date: "", education: "", life_status: "alive" },
      ],
    }));
  };

  const handleRemoveChild = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      children: prev.children.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleChildChange = (index: number, field: string, value: any) => {
    setFormData((prev: any) => {
      const newChildren = [...prev.children];
      newChildren[index] = { ...newChildren[index], [field]: value };
      return { ...prev, children: newChildren };
    });
  };

  const handleOpenSaveConfirm = () => {
    if (!formData.husband.full_name) {
      toast.error("Nama lengkap Kepala Keluarga harus diisi");
      setActiveTab("husband");
      return;
    }

    if (!formData.husband.family_status) {
      toast.error("Status keluarga harus diisi");
      setActiveTab("husband");
      return;
    }

    if (formData.wife.has_wife && !formData.wife.full_name) {
      toast.error("Nama lengkap Istri harus diisi jika dicentang");
      setActiveTab("wife");
      return;
    }

    setShowSaveConfirm(true);
  };

  const executeSave = async () => {
    setShowSaveConfirm(false);
    setIsLoading(true);
    let res;
    if (editingFamily) {
      const headId = editingFamily.head.id;
      const wifeId = editingFamily.wife?.id || null;
      const childIds = (editingFamily.children || []).map((c: any) => c.id);
      res = await updateAdminFamily(headId, formData, wifeId, childIds);
    } else {
      res = await createAdminFamily(formData);
    }

    setIsLoading(false);

    if (res.success) {
      toast.success(editingFamily ? "Data keluarga berhasil diperbarui" : "Data keluarga berhasil ditambahkan");
      closeModal();
      router.refresh();
    } else {
      toast.error(res.error || "Terjadi kesalahan saat menyimpan data");
    }
  };

  const requestDelete = (family: any) => {
    setFamilyToDelete(family);
  };

  const executeDelete = async () => {
    if (!familyToDelete) return;
    setIsDeleting(true);
    const headId = familyToDelete.head.id;
    const wifeId = familyToDelete.wife?.id || null;
    const childIds = (familyToDelete.children || []).map((c: any) => c.id);

    const res = await deleteAdminFamily(headId, wifeId, childIds);
    setIsDeleting(false);
    setFamilyToDelete(null);

    if (res.success) {
      toast.success("Data keluarga berhasil dihapus");
      router.refresh();
    } else {
      toast.error(res.error || "Gagal menghapus data keluarga");
    }
  };

  const filteredFamilies = families.filter((family) => {
    const headName = family.head?.full_name?.toLowerCase() || "";
    const wifeName = family.wife?.full_name?.toLowerCase() || "";
    const headNik = family.head?.nik?.toLowerCase() || "";
    const address = family.head?.address?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return headName.includes(query) || wifeName.includes(query) || headNik.includes(query) || address.includes(query);
  });

  return (
    <div className="space-y-4">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-card p-3 md:p-4 rounded-lg border border-border shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari kepala keluarga / istri / alamat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm bg-background w-full"
          />
        </div>
        <Button onClick={openModalForNew} className="bg-primary text-black hover:bg-primary/85 shrink-0 w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Tambah Keluarga
        </Button>
      </div>

      {/* Main Data Container - Mobile Card View (< md) */}
      <div className="block md:hidden space-y-3">
        {filteredFamilies.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground bg-card rounded-lg border border-border text-sm">
            {searchQuery ? "Tidak ada data keluarga yang cocok dengan pencarian." : "Belum ada data keluarga tersimpan."}
          </div>
        ) : (
          filteredFamilies.map((family) => {
            const { head, wife, children } = family;
            const isExpanded = !!expandedRows[head.id];

            return (
              <div key={head.id} className="bg-card rounded-lg border border-border p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-bold text-foreground text-base">{head.full_name}</h3>
                    <p className="text-xs text-primary font-medium">{head.family_status || "Kepala Keluarga"}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => openModalForEdit(family)}>
                      <Edit2 className="w-4 h-4 text-blue-400" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Hapus" onClick={() => requestDelete(family)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1 bg-background/50 p-2.5 rounded-md border border-border/50">
                  <div><span className="font-medium text-foreground">Istri:</span> {wife ? wife.full_name : "-"}</div>
                  <div><span className="font-medium text-foreground">Alamat:</span> {head.address || "-"}</div>
                  <div><span className="font-medium text-foreground">Anak:</span> {children.length} Orang</div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleExpand(head.id)}
                    className="w-full flex items-center justify-center gap-1 text-xs h-8"
                  >
                    {isExpanded ? "Sembunyikan Detail" : "Lihat Detail Keluarga"}
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </Button>
                </div>

                {/* Mobile Expanded Detail View */}
                {isExpanded && (
                  <div className="pt-3 border-t border-border space-y-4 text-xs">
                    {/* Data Kepala Keluarga */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-primary flex items-center gap-1.5 text-xs">
                        <User className="w-3.5 h-3.5" /> Data Kepala Keluarga
                      </h4>
                      <div className="grid grid-cols-2 gap-1.5 bg-background p-2.5 rounded-md border border-border">
                        <span className="text-muted-foreground">NIK:</span> <span className="font-mono">{head.nik || "-"}</span>
                        <span className="text-muted-foreground">TTL:</span> <span>{head.birth_place || "-"}{head.birth_date ? `, ${head.birth_date}` : ""}</span>
                        <span className="text-muted-foreground">Pendidikan:</span> <span>{head.education || "-"}</span>
                        <span className="text-muted-foreground">Pekerjaan:</span> <span>{head.occupation || "-"}</span>
                        <span className="text-muted-foreground">No. Telp:</span> <span>{head.phone || "-"}</span>
                        <span className="text-muted-foreground">Email:</span> <span className="truncate">{head.email || "-"}</span>
                        <span className="text-muted-foreground">Status:</span> 
                        <span className={head.life_status === "alive" ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                          {head.life_status === "alive" ? "Hidup" : "Meninggal"}
                        </span>
                      </div>
                    </div>

                    {/* Data Istri */}
                    {wife && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-pink-400 flex items-center gap-1.5 text-xs">
                          <Heart className="w-3.5 h-3.5" /> Data Istri
                        </h4>
                        <div className="grid grid-cols-2 gap-1.5 bg-background p-2.5 rounded-md border border-border">
                          <span className="text-muted-foreground">Nama:</span> <span className="font-medium">{wife.full_name}</span>
                          <span className="text-muted-foreground">NIK:</span> <span className="font-mono">{wife.nik || "-"}</span>
                          <span className="text-muted-foreground">TTL:</span> <span>{wife.birth_place || "-"}{wife.birth_date ? `, ${wife.birth_date}` : ""}</span>
                          <span className="text-muted-foreground">Pendidikan:</span> <span>{wife.education || "-"}</span>
                          <span className="text-muted-foreground">Orang Tua:</span> <span>{wife.parent_name || "-"}</span>
                        </div>
                      </div>
                    )}

                    {/* Data Anak */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-400 flex items-center gap-1.5 text-xs">
                        <Baby className="w-3.5 h-3.5" /> Data Anak ({children.length})
                      </h4>
                      {children.length > 0 ? (
                        <div className="space-y-2">
                          {children.map((child: any, idx: number) => (
                            <div key={child.id} className="p-2 rounded bg-background border border-border space-y-1">
                              <div className="font-medium text-foreground flex justify-between">
                                <span>{idx + 1}. {child.full_name}</span>
                                <span>({child.gender === "L" || child.gender === "Laki-laki" ? "L" : "P"})</span>
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                TTL: {child.birth_place || "-"}{child.birth_date ? `, ${child.birth_date}` : ""} | Edu: {child.education || "-"}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground italic">Belum ada data anak.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Main Table (md+) */}
      <div className="hidden md:block rounded-lg border border-border bg-card overflow-x-auto shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-3.5 font-medium">Nama Kepala Keluarga</th>
              <th className="px-6 py-3.5 font-medium">Status Keluarga</th>
              <th className="px-6 py-3.5 font-medium">Nama Istri</th>
              <th className="px-6 py-3.5 font-medium">Alamat</th>
              <th className="px-6 py-3.5 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredFamilies.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  {searchQuery ? "Tidak ada data keluarga yang cocok dengan pencarian." : "Belum ada data keluarga tersimpan."}
                </td>
              </tr>
            ) : (
              filteredFamilies.map((family) => {
                const { head, wife, children } = family;
                const isExpanded = !!expandedRows[head.id];

                return (
                  <Fragment key={head.id}>
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">{head.full_name}</td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{head.family_status || "-"}</td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{wife ? wife.full_name : "-"}</td>
                      <td className="px-6 py-4 text-muted-foreground max-w-[250px] truncate" title={head.address || "-"}>
                        {head.address || "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(head.id)}
                            className="flex items-center gap-1 text-xs"
                          >
                            {isExpanded ? "Tutup" : "Detail"}
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </Button>
                          <Button variant="ghost" size="icon" title="Edit" onClick={() => openModalForEdit(family)}>
                            <Edit2 className="w-4 h-4 text-blue-400" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Hapus" onClick={() => requestDelete(family)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {/* Detail Expandable View */}
                    {isExpanded && (
                      <tr className="bg-muted/10">
                        <td colSpan={5} className="px-6 py-6 border-b border-border">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Data Kepala Keluarga & Istri */}
                            <div className="space-y-6">
                              <div>
                                <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                                  <User className="w-4 h-4" /> Data Kepala Keluarga
                                </h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="text-muted-foreground">NIK / No. Identik:</div>
                                  <div className="font-mono">{head.nik || "-"}</div>
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
                                  <h4 className="font-semibold text-pink-400 mb-3 flex items-center gap-2">
                                    <Heart className="w-4 h-4" /> Data Istri
                                  </h4>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">NIK / No. Identik:</div>
                                    <div className="font-mono">{wife.nik || "-"}</div>
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
                                    <div className="text-muted-foreground">Orang Tua Istri:</div>
                                    <div className="font-medium">{wife.parent_name || "-"}</div>
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
                              <h4 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
                                <Baby className="w-4 h-4" /> Data Anak ({children.length})
                              </h4>
                              {children.length > 0 ? (
                                <div className="space-y-3">
                                  {children.map((child: any, idx: number) => (
                                    <div key={child.id} className="p-3 rounded-md bg-background border border-border text-sm space-y-1">
                                      <div className="font-medium text-foreground flex justify-between">
                                        <span>{idx + 1}. {child.full_name}</span>
                                        <span className="text-xs font-mono text-muted-foreground">{child.nik ? `NIK: ${child.nik}` : ""}</span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-1 text-xs">
                                        <div className="text-muted-foreground">Jenis Kelamin:</div>
                                        <div>{child.gender === "L" || child.gender === "Laki-laki" ? "Laki-laki" : "Perempuan"}</div>
                                        <div className="text-muted-foreground">TTL:</div>
                                        <div>{child.birth_place || "-"}{child.birth_date ? `, ${child.birth_date}` : ""}</div>
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
                  </Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>

      {/* Modal Form CRUD (Sama seperti Pengumpulan Data Keluarga) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4">
          <div className="bg-card w-[96vw] max-w-3xl max-h-[92vh] rounded-lg shadow-xl border border-border flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-3 md:p-4 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                <h3 className="font-bold text-base md:text-lg">{editingFamily ? "Edit Data Keluarga" : "Tambah Data Keluarga Baru"}</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={closeModal} className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-border bg-background px-2 sm:px-4 pt-2 gap-1 sm:gap-2 overflow-x-auto shrink-0 scrollbar-none">
              <Button
                variant={activeTab === "husband" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("husband")}
                className="rounded-b-none text-xs whitespace-nowrap px-2.5 py-1.5 h-auto"
              >
                1. Kepala Keluarga
              </Button>
              <Button
                variant={activeTab === "wife" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("wife")}
                className="rounded-b-none text-xs whitespace-nowrap px-2.5 py-1.5 h-auto"
              >
                2. Data Istri
              </Button>
              <Button
                variant={activeTab === "children" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("children")}
                className="rounded-b-none text-xs whitespace-nowrap px-2.5 py-1.5 h-auto"
              >
                3. Data Anak ({formData.children.length})
              </Button>
            </div>

            {/* Form Body */}
            <div className="p-3 md:p-6 overflow-y-auto space-y-3 md:space-y-6 flex-1">
              {/* TAB 1: KEPALA KELUARGA */}
              {activeTab === "husband" && (
                <div className="space-y-2.5 md:space-y-4">
                  <div className="grid grid-cols-2 gap-2 md:gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="husband_nik" className="text-xs">NIK <span className="text-[10px] text-muted-foreground">(Relasi)</span></Label>
                      <Input
                        id="husband_nik"
                        placeholder="337123000..."
                        className="h-8 md:h-9 text-xs"
                        value={formData.husband.nik}
                        onChange={(e) => setFormData({ ...formData, husband: { ...formData.husband, nik: e.target.value } })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="husband_family_status" className="text-xs">Status Keluarga <span className="text-red-500">*</span></Label>
                      <Input
                        id="husband_family_status"
                        placeholder="Kepala Keluarga / Cucu"
                        className="h-8 md:h-9 text-xs"
                        value={formData.husband.family_status}
                        onChange={(e) => setFormData({ ...formData, husband: { ...formData.husband, family_status: e.target.value } })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="husband_full_name" className="text-xs">Nama Lengkap <span className="text-red-500">*</span></Label>
                    <Input
                      id="husband_full_name"
                      placeholder="Nama lengkap sesuai identitas"
                      className="h-8 md:h-9 text-xs"
                      value={formData.husband.full_name}
                      onChange={(e) => setFormData({ ...formData, husband: { ...formData.husband, full_name: e.target.value } })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 md:gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="husband_birth_place" className="text-xs">Tempat Lahir</Label>
                      <Input
                        id="husband_birth_place"
                        className="h-8 md:h-9 text-xs"
                        value={formData.husband.birth_place}
                        onChange={(e) => setFormData({ ...formData, husband: { ...formData.husband, birth_place: e.target.value } })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="husband_birth_date" className="text-xs">Tanggal Lahir</Label>
                      <Input
                        id="husband_birth_date"
                        type="date"
                        className="h-8 md:h-9 text-xs"
                        value={formData.husband.birth_date}
                        onChange={(e) => setFormData({ ...formData, husband: { ...formData.husband, birth_date: e.target.value } })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 md:gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="husband_education" className="text-xs">Pendidikan</Label>
                      <Input
                        id="husband_education"
                        className="h-8 md:h-9 text-xs"
                        value={formData.husband.education}
                        onChange={(e) => setFormData({ ...formData, husband: { ...formData.husband, education: e.target.value } })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="husband_occupation" className="text-xs">Pekerjaan</Label>
                      <Input
                        id="husband_occupation"
                        className="h-8 md:h-9 text-xs"
                        value={formData.husband.occupation}
                        onChange={(e) => setFormData({ ...formData, husband: { ...formData.husband, occupation: e.target.value } })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 md:gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="husband_phone" className="text-xs">No. Telp/HP</Label>
                      <Input
                        id="husband_phone"
                        className="h-8 md:h-9 text-xs"
                        value={formData.husband.phone}
                        onChange={(e) => setFormData({ ...formData, husband: { ...formData.husband, phone: e.target.value } })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="husband_email" className="text-xs">E-mail</Label>
                      <Input
                        id="husband_email"
                        type="email"
                        className="h-8 md:h-9 text-xs"
                        value={formData.husband.email}
                        onChange={(e) => setFormData({ ...formData, husband: { ...formData.husband, email: e.target.value } })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="husband_address" className="text-xs">Alamat Rumah</Label>
                    <Input
                      id="husband_address"
                      className="h-8 md:h-9 text-xs"
                      value={formData.husband.address}
                      onChange={(e) => setFormData({ ...formData, husband: { ...formData.husband, address: e.target.value } })}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="husband_life_status" className="text-xs">Status Hidup</Label>
                    <Select
                      value={formData.husband.life_status}
                      onValueChange={(val) => setFormData({ ...formData, husband: { ...formData.husband, life_status: val } })}
                    >
                      <SelectTrigger className="h-8 md:h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alive">Hidup</SelectItem>
                        <SelectItem value="deceased">Meninggal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* TAB 2: DATA ISTRI */}
              {activeTab === "wife" && (
                <div className="space-y-2.5 md:space-y-4">
                  <div className="flex items-center justify-between border border-border p-3 rounded-lg bg-background mb-2">
                    <div>
                      <Label className="text-sm">Data Istri</Label>
                      <p className="text-[11px] text-muted-foreground">Aktifkan jika memiliki data Istri.</p>
                    </div>
                    <Switch
                      checked={formData.wife.has_wife}
                      onCheckedChange={(checked) => setFormData({ ...formData, wife: { ...formData.wife, has_wife: checked } })}
                    />
                  </div>

                  {formData.wife.has_wife && (
                    <div className="space-y-2.5 md:space-y-4 pt-2 border-t border-border">
                      <div className="grid grid-cols-2 gap-2 md:gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="wife_nik" className="text-xs">NIK Istri</Label>
                          <Input
                            id="wife_nik"
                            className="h-8 md:h-9 text-xs"
                            value={formData.wife.nik}
                            onChange={(e) => setFormData({ ...formData, wife: { ...formData.wife, nik: e.target.value } })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="wife_family_status" className="text-xs">Status Keluarga</Label>
                          <Input
                            id="wife_family_status"
                            placeholder="Cucu Menantu"
                            className="h-8 md:h-9 text-xs"
                            value={formData.wife.family_status}
                            onChange={(e) => setFormData({ ...formData, wife: { ...formData.wife, family_status: e.target.value } })}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="wife_full_name" className="text-xs">Nama Lengkap Istri <span className="text-red-500">*</span></Label>
                        <Input
                          id="wife_full_name"
                          className="h-8 md:h-9 text-xs"
                          value={formData.wife.full_name}
                          onChange={(e) => setFormData({ ...formData, wife: { ...formData.wife, full_name: e.target.value } })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 md:gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="wife_birth_place" className="text-xs">Tempat Lahir</Label>
                          <Input
                            id="wife_birth_place"
                            className="h-8 md:h-9 text-xs"
                            value={formData.wife.birth_place}
                            onChange={(e) => setFormData({ ...formData, wife: { ...formData.wife, birth_place: e.target.value } })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="wife_birth_date" className="text-xs">Tanggal Lahir</Label>
                          <Input
                            id="wife_birth_date"
                            type="date"
                            className="h-8 md:h-9 text-xs"
                            value={formData.wife.birth_date}
                            onChange={(e) => setFormData({ ...formData, wife: { ...formData.wife, birth_date: e.target.value } })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 md:gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="wife_education" className="text-xs">Pendidikan</Label>
                          <Input
                            id="wife_education"
                            className="h-8 md:h-9 text-xs"
                            value={formData.wife.education}
                            onChange={(e) => setFormData({ ...formData, wife: { ...formData.wife, education: e.target.value } })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="wife_occupation" className="text-xs">Pekerjaan</Label>
                          <Input
                            id="wife_occupation"
                            className="h-8 md:h-9 text-xs"
                            value={formData.wife.occupation}
                            onChange={(e) => setFormData({ ...formData, wife: { ...formData.wife, occupation: e.target.value } })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 md:gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="wife_phone" className="text-xs">No. Telp/HP</Label>
                          <Input
                            id="wife_phone"
                            className="h-8 md:h-9 text-xs"
                            value={formData.wife.phone}
                            onChange={(e) => setFormData({ ...formData, wife: { ...formData.wife, phone: e.target.value } })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="wife_email" className="text-xs">E-mail</Label>
                          <Input
                            id="wife_email"
                            type="email"
                            className="h-8 md:h-9 text-xs"
                            value={formData.wife.email}
                            onChange={(e) => setFormData({ ...formData, wife: { ...formData.wife, email: e.target.value } })}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="wife_address" className="text-xs">Alamat Rumah</Label>
                        <Input
                          id="wife_address"
                          className="h-8 md:h-9 text-xs"
                          value={formData.wife.address}
                          onChange={(e) => setFormData({ ...formData, wife: { ...formData.wife, address: e.target.value } })}
                        />
                      </div>

                      <div className="border-t border-border pt-3 mt-1">
                        <h4 className="text-xs font-semibold mb-2 text-primary">Data Orang Tua Istri</h4>
                        <div className="grid grid-cols-2 gap-2 md:gap-4">
                          <div className="space-y-1">
                            <Label htmlFor="wife_parent_name" className="text-xs">Nama Orang Tua</Label>
                            <Input
                              id="wife_parent_name"
                              className="h-8 md:h-9 text-xs"
                              value={formData.wife.parent_name}
                              onChange={(e) => setFormData({ ...formData, wife: { ...formData.wife, parent_name: e.target.value } })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="wife_parent_address" className="text-xs">Alamat Orang Tua</Label>
                            <Input
                              id="wife_parent_address"
                              className="h-8 md:h-9 text-xs"
                              value={formData.wife.parent_address}
                              onChange={(e) => setFormData({ ...formData, wife: { ...formData.wife, parent_address: e.target.value } })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="wife_life_status" className="text-xs">Status Hidup</Label>
                        <Select
                          value={formData.wife.life_status}
                          onValueChange={(val) => setFormData({ ...formData, wife: { ...formData.wife, life_status: val } })}
                        >
                          <SelectTrigger className="h-8 md:h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="alive">Hidup</SelectItem>
                            <SelectItem value="deceased">Meninggal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: DATA ANAK */}
              {activeTab === "children" && (
                <div className="space-y-3">
                  {formData.children.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-border rounded-lg">
                      <p className="text-muted-foreground mb-3 text-xs md:text-sm">Belum ada data anak ditambahkan.</p>
                      <Button type="button" onClick={handleAddChild} variant="outline" size="sm" className="text-xs">
                        <Plus className="w-3.5 h-3.5 mr-1.5" /> Tambah Data Anak
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.children.map((child: any, idx: number) => (
                        <div key={idx} className="p-3 border border-border rounded-lg bg-background relative space-y-2">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-primary text-xs">Anak ke-{idx + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveChild(idx)}
                              className="text-red-500 hover:bg-red-500/10 h-6 text-[11px] px-1.5"
                            >
                              <Trash2 className="w-3 h-3 mr-0.5" /> Hapus
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">NIK</Label>
                              <Input
                                className="h-8 text-xs font-mono"
                                placeholder="NIK Anak"
                                value={child.nik || ""}
                                onChange={(e) => handleChildChange(idx, "nik", e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Nama <span className="text-red-500">*</span></Label>
                              <Input
                                className="h-8 text-xs"
                                placeholder="Nama anak"
                                value={child.full_name || ""}
                                onChange={(e) => handleChildChange(idx, "full_name", e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Kelamin</Label>
                              <Select
                                value={child.gender || ""}
                                onValueChange={(val) => handleChildChange(idx, "gender", val)}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="L">L</SelectItem>
                                  <SelectItem value="P">P</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Tempat Lahir</Label>
                              <Input
                                className="h-8 text-xs"
                                value={child.birth_place || ""}
                                onChange={(e) => handleChildChange(idx, "birth_place", e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Tgl Lahir</Label>
                              <Input
                                type="date"
                                className="h-8 text-xs"
                                value={child.birth_date || ""}
                                onChange={(e) => handleChildChange(idx, "birth_date", e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Pendidikan</Label>
                            <Input
                              className="h-8 text-xs"
                              placeholder="Pendidikan anak"
                              value={child.education || ""}
                              onChange={(e) => handleChildChange(idx, "education", e.target.value)}
                            />
                          </div>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddChild}
                        className="w-full border-dashed py-3 text-xs text-muted-foreground hover:text-primary"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" /> Tambah Data Anak Lainnya
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-3 md:p-4 border-t border-border flex justify-between items-center bg-muted/20">
              <div className="flex gap-2">
                {activeTab !== "husband" && (
                  <Button variant="outline" size="sm" onClick={() => setActiveTab(activeTab === "children" ? "wife" : "husband")}>
                    Sebelumnya
                  </Button>
                )}
                {activeTab !== "children" && (
                  <Button variant="outline" size="sm" onClick={() => setActiveTab(activeTab === "husband" ? "wife" : "children")}>
                    Selanjutnya
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={closeModal} disabled={isLoading}>
                  Batal
                </Button>
                <Button size="sm" onClick={handleOpenSaveConfirm} disabled={isLoading} className="bg-primary text-black hover:bg-primary/80">
                  {isLoading ? "Menyimpan..." : "Simpan Data Keluarga"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pop Up Konfirmasi Hapus Data */}
      {familyToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Konfirmasi Hapus Data</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Apakah Anda yakin ingin menghapus data keluarga <span className="text-foreground font-semibold">&ldquo;{familyToDelete.head?.full_name || "Keluarga Ini"}&rdquo;</span>? Seluruh data anggota keluarga terkait (istri & anak) akan terhapus secara permanen dari sistem.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setFamilyToDelete(null)}
                disabled={isDeleting}
                className="text-muted-foreground text-sm"
              >
                Batal
              </Button>
              <Button 
                type="button" 
                onClick={executeDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm font-medium"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus Data"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pop Up Konfirmasi Simpan / Edit Data */}
      {showSaveConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {editingFamily ? "Konfirmasi Perbarui Data" : "Konfirmasi Simpan Data"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Pastikan seluruh data sudah sesuai.</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Apakah Anda yakin ingin {editingFamily ? "memperbarui" : "menyimpan"} data keluarga <span className="text-foreground font-semibold">&ldquo;{formData.husband.full_name}&rdquo;</span>? Data yang tersimpan akan langsung diperbarui di dalam sistem.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setShowSaveConfirm(false)}
                disabled={isLoading}
                className="text-muted-foreground text-sm"
              >
                Periksa Kembali
              </Button>
              <Button 
                type="button" 
                onClick={executeSave}
                disabled={isLoading}
                className="bg-primary text-black hover:bg-primary/85 text-sm font-semibold"
              >
                {isLoading ? "Menyimpan..." : editingFamily ? "Ya, Perbarui Data" : "Ya, Simpan Data"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
