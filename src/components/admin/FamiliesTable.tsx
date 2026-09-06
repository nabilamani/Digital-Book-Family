"use client";

import { useState, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Search, Edit2, Trash2, Plus, X, ChevronDown, ChevronUp, Users, User, Heart, Baby } from "lucide-react";
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

  const handleSave = async () => {
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

  const handleDelete = async (family: any) => {
    const headName = family.head?.full_name || "Keluarga ini";
    if (confirm(`Apakah Anda yakin ingin menghapus data keluarga ${headName}? Seluruh data anggota keluarga terkait akan terhapus.`)) {
      const headId = family.head.id;
      const wifeId = family.wife?.id || null;
      const childIds = (family.children || []).map((c: any) => c.id);

      const res = await deleteAdminFamily(headId, wifeId, childIds);
      if (res.success) {
        toast.success("Data keluarga berhasil dihapus");
        router.refresh();
      } else {
        toast.error(res.error || "Gagal menghapus data keluarga");
      }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari kepala keluarga / istri / alamat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm bg-background"
          />
        </div>
        <Button onClick={openModalForNew} className="bg-primary text-black hover:bg-primary/85 shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Tambah Keluarga
        </Button>
      </div>

      {/* Main Table */}
      <div className="rounded-lg border border-border bg-card overflow-x-auto shadow-sm">
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
                          <Button variant="ghost" size="icon" title="Hapus" onClick={() => handleDelete(family)}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-card w-full max-w-3xl max-h-[90vh] rounded-lg shadow-xl border border-border flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">{editingFamily ? "Edit Data Keluarga" : "Tambah Data Keluarga Baru"}</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-border bg-background px-4 pt-2 gap-2">
              <Button
                variant={activeTab === "husband" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("husband")}
                className="rounded-b-none"
              >
                1. Kepala Keluarga
              </Button>
              <Button
                variant={activeTab === "wife" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("wife")}
                className="rounded-b-none"
              >
                2. Data Istri
              </Button>
              <Button
                variant={activeTab === "children" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("children")}
                className="rounded-b-none"
              >
                3. Data Anak ({formData.children.length})
              </Button>
            </div>

            {/* Form Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* TAB 1: KEPALA KELUARGA */}
              {activeTab === "husband" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="husband_nik">NIK / Nomor Identik <span className="text-xs text-muted-foreground">(Untuk Relasi Keluarga)</span></Label>
                      <Input
                        id="husband_nik"
                        placeholder="Contoh: 337123000..."
                        value={formData.husband.nik}
                        onChange={(e) => setFormData({ ...formData, husband: { ...formData.husband, nik: e.target.value } })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="husband_family_status">Status Keluarga <span className="text-red-500">*</span></Label>
                      <Input
                        id="husband_family_status"
                        placeholder="Contoh: Kepala Keluarga / Cucu"
                        value={formData.husband.family_status}
                        onChange={(e) => setFormData({ ...formData, husband: { ...formData.husband, family_status: e.target.value } })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="husband_full_name">Nama Lengkap <span className="text-red-500">*</span></Label>
                    <Input
                      id="husband_full_name"
                      placeholder="Nama lengkap sesuai identitas"
                      value={formData.husband.full_name}
                      onChange={(e) => setFormData({ ...formData, husband: { ...formData.husband, full_name: e.target.value } })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="husband_birth_place">Tempat Lahir</Label>
                      <Input
                        id="husband_birth_place"
                        value={formData.husband.birth_place}
                        onChange={(e) => setFormData({ ...formData, husband: { ...formData.husband, birth_place: e.target.value } })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="husband_birth_date">Tanggal Lahir</Label>
                      <Input
                        id="husband_birth_date"
                        type="date"
                        value={formData.husband.birth_date}
                        onChange={(e) => setFormData({ ...formData, husband: { ...formData.husband, birth_date: e.target.value } })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="husband_education">Pendidikan</Label>
                      <Input
                        id="husband_education"
                        value={formData.husband.education}
                        onChange={(e) => setFormData({ ...formData, husband: { ...formData.husband, education: e.target.value } })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="husband_occupation">Pekerjaan</Label>
                      <Input
                        id="husband_occupation"
                        value={formData.husband.occupation}
                        onChange={(e) => setFormData({ ...formData, husband: { ...formData.husband, occupation: e.target.value } })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="husband_phone">No. Telp/HP</Label>
                      <Input
                        id="husband_phone"
                        value={formData.husband.phone}
                        onChange={(e) => setFormData({ ...formData, husband: { ...formData.husband, phone: e.target.value } })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="husband_email">E-mail</Label>
                      <Input
                        id="husband_email"
                        type="email"
                        value={formData.husband.email}
                        onChange={(e) => setFormData({ ...formData, husband: { ...formData.husband, email: e.target.value } })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="husband_address">Alamat Rumah</Label>
                    <Input
                      id="husband_address"
                      value={formData.husband.address}
                      onChange={(e) => setFormData({ ...formData, husband: { ...formData.husband, address: e.target.value } })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="husband_life_status">Status Hidup</Label>
                    <Select
                      value={formData.husband.life_status}
                      onValueChange={(val) => setFormData({ ...formData, husband: { ...formData.husband, life_status: val } })}
                    >
                      <SelectTrigger>
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between border border-border p-4 rounded-lg bg-background mb-4">
                    <div>
                      <Label className="text-base">Data Istri</Label>
                      <p className="text-xs text-muted-foreground">Aktifkan jika keluarga ini memiliki data Istri.</p>
                    </div>
                    <Switch
                      checked={formData.wife.has_wife}
                      onCheckedChange={(checked) => setFormData({ ...formData, wife: { ...formData.wife, has_wife: checked } })}
                    />
                  </div>

                  {formData.wife.has_wife && (
                    <div className="space-y-4 pt-2 border-t border-border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="wife_nik">NIK / Nomor Identik Istri</Label>
                          <Input
                            id="wife_nik"
                            value={formData.wife.nik}
                            onChange={(e) => setFormData({ ...formData, wife: { ...formData.wife, nik: e.target.value } })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="wife_family_status">Status Keluarga</Label>
                          <Input
                            id="wife_family_status"
                            placeholder="Contoh: Cucu Menantu"
                            value={formData.wife.family_status}
                            onChange={(e) => setFormData({ ...formData, wife: { ...formData.wife, family_status: e.target.value } })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="wife_full_name">Nama Lengkap Istri <span className="text-red-500">*</span></Label>
                        <Input
                          id="wife_full_name"
                          value={formData.wife.full_name}
                          onChange={(e) => setFormData({ ...formData, wife: { ...formData.wife, full_name: e.target.value } })}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="wife_birth_place">Tempat Lahir</Label>
                          <Input
                            id="wife_birth_place"
                            value={formData.wife.birth_place}
                            onChange={(e) => setFormData({ ...formData, wife: { ...formData.wife, birth_place: e.target.value } })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="wife_birth_date">Tanggal Lahir</Label>
                          <Input
                            id="wife_birth_date"
                            type="date"
                            value={formData.wife.birth_date}
                            onChange={(e) => setFormData({ ...formData, wife: { ...formData.wife, birth_date: e.target.value } })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="wife_education">Pendidikan</Label>
                          <Input
                            id="wife_education"
                            value={formData.wife.education}
                            onChange={(e) => setFormData({ ...formData, wife: { ...formData.wife, education: e.target.value } })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="wife_occupation">Pekerjaan</Label>
                          <Input
                            id="wife_occupation"
                            value={formData.wife.occupation}
                            onChange={(e) => setFormData({ ...formData, wife: { ...formData.wife, occupation: e.target.value } })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="wife_phone">No. Telp/HP</Label>
                          <Input
                            id="wife_phone"
                            value={formData.wife.phone}
                            onChange={(e) => setFormData({ ...formData, wife: { ...formData.wife, phone: e.target.value } })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="wife_email">E-mail</Label>
                          <Input
                            id="wife_email"
                            type="email"
                            value={formData.wife.email}
                            onChange={(e) => setFormData({ ...formData, wife: { ...formData.wife, email: e.target.value } })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="wife_address">Alamat Rumah</Label>
                        <Input
                          id="wife_address"
                          value={formData.wife.address}
                          onChange={(e) => setFormData({ ...formData, wife: { ...formData.wife, address: e.target.value } })}
                        />
                      </div>

                      <div className="border-t border-border pt-4 mt-2">
                        <h4 className="text-sm font-medium mb-3 text-primary">Data Orang Tua Istri</h4>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="wife_parent_name">Nama Orang Tua</Label>
                            <Input
                              id="wife_parent_name"
                              value={formData.wife.parent_name}
                              onChange={(e) => setFormData({ ...formData, wife: { ...formData.wife, parent_name: e.target.value } })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="wife_parent_address">Alamat Orang Tua</Label>
                            <Input
                              id="wife_parent_address"
                              value={formData.wife.parent_address}
                              onChange={(e) => setFormData({ ...formData, wife: { ...formData.wife, parent_address: e.target.value } })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="wife_life_status">Status Hidup</Label>
                        <Select
                          value={formData.wife.life_status}
                          onValueChange={(val) => setFormData({ ...formData, wife: { ...formData.wife, life_status: val } })}
                        >
                          <SelectTrigger>
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
                <div className="space-y-4">
                  {formData.children.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-border rounded-lg">
                      <p className="text-muted-foreground mb-4">Belum ada data anak ditambahkan.</p>
                      <Button type="button" onClick={handleAddChild} variant="outline">
                        <Plus className="w-4 h-4 mr-2" /> Tambah Data Anak
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.children.map((child: any, idx: number) => (
                        <div key={idx} className="p-4 border border-border rounded-lg bg-background relative space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-primary text-sm">Anak ke-{idx + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveChild(idx)}
                              className="text-red-500 hover:bg-red-500/10 h-7 text-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">NIK / No. Identik</Label>
                              <Input
                                className="h-9 text-xs font-mono"
                                placeholder="NIK Anak"
                                value={child.nik || ""}
                                onChange={(e) => handleChildChange(idx, "nik", e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Nama Lengkap <span className="text-red-500">*</span></Label>
                              <Input
                                className="h-9 text-xs"
                                placeholder="Nama anak"
                                value={child.full_name || ""}
                                onChange={(e) => handleChildChange(idx, "full_name", e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Jenis Kelamin</Label>
                              <Select
                                value={child.gender}
                                onValueChange={(val) => handleChildChange(idx, "gender", val)}
                              >
                                <SelectTrigger className="h-9 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="L">Laki-laki (L)</SelectItem>
                                  <SelectItem value="P">Perempuan (P)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Tempat Lahir</Label>
                              <Input
                                className="h-9 text-xs"
                                value={child.birth_place || ""}
                                onChange={(e) => handleChildChange(idx, "birth_place", e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Tanggal Lahir</Label>
                              <Input
                                type="date"
                                className="h-9 text-xs"
                                value={child.birth_date || ""}
                                onChange={(e) => handleChildChange(idx, "birth_date", e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Pendidikan</Label>
                            <Input
                              className="h-9 text-xs"
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
                        className="w-full border-dashed py-4 text-xs text-muted-foreground hover:text-primary"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Tambah Data Anak Lainnya
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-border flex justify-between items-center bg-muted/20">
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
                <Button size="sm" onClick={handleSave} disabled={isLoading} className="bg-primary text-black hover:bg-primary/80">
                  {isLoading ? "Menyimpan..." : "Simpan Data Keluarga"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
