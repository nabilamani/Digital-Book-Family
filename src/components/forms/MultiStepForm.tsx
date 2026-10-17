"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fullFormSchema, FullFormValues } from "@/lib/validations/form-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { submitPersonForm } from "@/actions/person-actions";
import { uploadPhoto } from "@/actions/upload-actions";
import imageCompression from "browser-image-compression";
import { Loader2, Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle2, User, Heart, Mars, Venus } from "lucide-react";
import { useRouter } from "next/navigation";

export function MultiStepForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [primaryPhoto, setPrimaryPhoto] = useState<File | null>(null);
  const [spousePhoto, setSpousePhoto] = useState<File | null>(null);
  const [primaryPhotoPreview, setPrimaryPhotoPreview] = useState<string | null>(null);
  const [spousePhotoPreview, setSpousePhotoPreview] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    return () => {
      if (primaryPhotoPreview) URL.revokeObjectURL(primaryPhotoPreview);
      if (spousePhotoPreview) URL.revokeObjectURL(spousePhotoPreview);
    };
  }, [primaryPhotoPreview, spousePhotoPreview]);

  const form = useForm<FullFormValues>({
    resolver: zodResolver(fullFormSchema) as any,
    defaultValues: {
      primary: {
        role: "suami",
        nik: "",
        full_name: "",
        family_status: "",
        life_status: "alive",
        birth_place: "",
        birth_date: "",
        education: "",
        occupation: "",
        phone: "",
        email: "",
        address: "",
        parent_name: "",
        parent_address: "",
      },
      spouse: {
        has_spouse: false,
        full_name: "",
        family_status: "",
        life_status: "alive",
        birth_place: "",
        birth_date: "",
        education: "",
        occupation: "",
        phone: "",
        email: "",
        address: "",
        parent_name: "",
        parent_address: "",
      },
      children: [],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "children",
  });

  const primaryRole = form.watch("primary.role") || "suami";
  const hasSpouse = form.watch("spouse.has_spouse");

  const primaryLabel = primaryRole === "suami" ? "Suami" : "Istri";
  const spouseLabel = primaryRole === "suami" ? "Istri" : "Suami";

  const handleNext = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await form.trigger("primary");
    } else if (step === 2) {
      if (form.getValues("spouse.has_spouse")) {
        isValid = await form.trigger("spouse");
        
        // Manual validation if they check has_spouse but don't fill full_name
        if (isValid && !form.getValues("spouse.full_name")?.trim()) {
          form.setError("spouse.full_name", { 
            type: "manual", 
            message: `Nama ${spouseLabel.toLowerCase()} harus diisi jika opsi pasangan diaktifkan` 
          });
          isValid = false;
        }
      } else {
        isValid = true;
      }
    }
    
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "primary" | "spouse") => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (type === "primary") {
        if (primaryPhotoPreview) URL.revokeObjectURL(primaryPhotoPreview);
        setPrimaryPhotoPreview(previewUrl);
      } else {
        if (spousePhotoPreview) URL.revokeObjectURL(spousePhotoPreview);
        setSpousePhotoPreview(previewUrl);
      }

      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        if (type === "primary") setPrimaryPhoto(compressedFile);
        else setSpousePhoto(compressedFile);
        toast.success(`Foto ${type === "primary" ? primaryLabel : spouseLabel} berhasil diproses.`);
      } catch (error) {
        console.error(error);
        toast.error("Gagal memproses foto.");
      }
    }
  };

  const handleRemovePhoto = (type: "primary" | "spouse") => {
    if (type === "primary") {
      if (primaryPhotoPreview) URL.revokeObjectURL(primaryPhotoPreview);
      setPrimaryPhoto(null);
      setPrimaryPhotoPreview(null);
    } else {
      if (spousePhotoPreview) URL.revokeObjectURL(spousePhotoPreview);
      setSpousePhoto(null);
      setSpousePhotoPreview(null);
    }
  };

  const onSubmit = async (data: FullFormValues) => {
    setIsSubmitting(true);
    toast.loading("Menyimpan data keluarga...");

    try {
      let primaryPhotoPath = null;
      let spousePhotoPath = null;

      if (primaryPhoto) {
        const formData = new FormData();
        formData.append("file", primaryPhoto);
        const uploadResult = await uploadPhoto(formData);
        if (uploadResult.success) primaryPhotoPath = uploadResult.path || null;
      }

      if (spousePhoto && data.spouse.has_spouse) {
        const formData = new FormData();
        formData.append("file", spousePhoto);
        const uploadResult = await uploadPhoto(formData);
        if (uploadResult.success) spousePhotoPath = uploadResult.path || null;
      }

      const result = await submitPersonForm(data, primaryPhotoPath, spousePhotoPath);
      
      if (result.success) {
        toast.dismiss();
        toast.success("Data berhasil disimpan!");
        router.push("/form/success");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Terjadi kesalahan: " + (error as Error).message);
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-card border-border shadow-lg">
      <CardHeader className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-1 md:mb-2">
          <CardTitle className="text-xl md:text-2xl text-primary font-bold">Buku Induk Keluarga</CardTitle>
          <span className="text-xs md:text-sm text-muted-foreground font-mono bg-background px-2.5 py-0.5 md:px-3 md:py-1 rounded-full border border-border">
            Step {step} / 3
          </span>
        </div>
        <CardDescription className="text-xs md:text-base">
          {step === 1 && "Data Utama (Garis Keturunan Keluarga Besar)"}
          {step === 2 && `Data ${spouseLabel} (Pasangan)`}
          {step === 3 && "Data Anak-Anak"}
        </CardDescription>
        
        <div className="w-full h-1.5 md:h-2 bg-background rounded-full mt-3 md:mt-4 overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6 pt-2 md:pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
          
          {/* STEP 1: DATA UTAMA (KELUARGA BESAR) */}
          {step === 1 && (
            <div className="space-y-3.5 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 text-xs sm:text-sm">
              
              {/* OPSI STATUS SUAMI / ISTRI */}
              <div className="p-3 sm:p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-2">
                <div className="flex items-start sm:items-center justify-between gap-2">
                  <Label className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1 leading-tight pt-0.5 sm:pt-0">
                    <span>Status Pernikahan (Anggota Utama)</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-[10px] sm:text-xs font-mono uppercase bg-primary/15 text-primary border border-primary/30 px-2.5 py-0.5 rounded-full font-semibold whitespace-nowrap shrink-0">
                    Keluarga Besar
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Tentukan peran anggota dari keluarga besar ini (apakah Suami atau Istri). Data pasangan yang bukan dari keluarga utama akan diisi pada langkah berikutnya.
                </p>
                
                <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-1">
                  <button
                    type="button"
                    onClick={() => form.setValue("primary.role", "suami")}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 sm:px-3 rounded-lg border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                      primaryRole === "suami"
                        ? "border-primary bg-primary text-black font-semibold shadow-sm ring-2 ring-primary/20"
                        : "border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Mars className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${primaryRole === "suami" ? "text-black" : "text-blue-500"}`} />
                    <span className="text-[11px] sm:text-xs whitespace-nowrap font-medium">
                      Suami <span className="opacity-75 font-normal">(Laki-laki)</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => form.setValue("primary.role", "istri")}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 sm:px-3 rounded-lg border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                      primaryRole === "istri"
                        ? "border-primary bg-primary text-black font-semibold shadow-sm ring-2 ring-primary/20"
                        : "border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Venus className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${primaryRole === "istri" ? "text-black" : "text-pink-500"}`} />
                    <span className="text-[11px] sm:text-xs whitespace-nowrap font-medium">
                      Istri <span className="opacity-75 font-normal">(Perempuan)</span>
                    </span>
                  </button>
                </div>
              </div>

              {/* Foto Profil */}
              <div className="space-y-1.5">
                <Label htmlFor="primary_photo" className="text-xs font-medium">
                  Foto Profil {primaryLabel}
                </Label>
                {primaryPhotoPreview ? (
                  <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-background">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden border border-border shrink-0 bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={primaryPhotoPreview} 
                        alt={`Preview Foto ${primaryLabel}`} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold truncate text-foreground">
                          {primaryPhoto?.name || `Foto ${primaryLabel} Terpilih`}
                        </span>
                        <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0">
                          Siap Unggah
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {primaryPhoto ? `${(primaryPhoto.size / 1024).toFixed(0)} KB (terkompresi)` : "Foto terpilih"}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <label 
                          htmlFor="primary_photo_change" 
                          className="text-xs text-primary hover:underline cursor-pointer font-medium"
                        >
                          Ganti Foto
                        </label>
                        <input 
                          id="primary_photo_change" 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handlePhotoChange(e, "primary")} 
                          className="hidden" 
                        />
                        <span className="text-muted-foreground text-xs">•</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemovePhoto("primary")} 
                          className="text-xs text-destructive hover:underline font-medium"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Input 
                    id="primary_photo" 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handlePhotoChange(e, "primary")} 
                    className="bg-background text-muted-foreground file:bg-primary file:text-black file:border-0 file:rounded-md file:px-2.5 file:py-0.5 file:mr-2 file:font-semibold text-xs h-9" 
                  />
                )}
              </div>

              {/* Status Keluarga & Status Hidup */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                <div className="space-y-1">
                  <Label htmlFor="primary_family_status" className="text-xs font-medium">
                    Status Keluarga <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="primary_family_status" 
                    placeholder="Contoh: Anak, Cucu, Cicit" 
                    {...form.register("primary.family_status")} 
                    className={`h-9 text-xs ${form.formState.errors.primary?.family_status ? "border-destructive" : ""}`} 
                  />
                  {form.formState.errors.primary?.family_status && (
                    <p className="text-[11px] text-destructive">{form.formState.errors.primary.family_status.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="primary_life_status" className="text-xs font-medium">Status Hidup</Label>
                  <Select 
                    value={form.watch("primary.life_status") || "alive"} 
                    onValueChange={(val) => form.setValue("primary.life_status", val as "alive" | "deceased")}
                  >
                    <SelectTrigger id="primary_life_status" className="h-9 text-xs">
                      <SelectValue placeholder="Pilih">
                        {(form.watch("primary.life_status") || "alive") === "alive" ? "Hidup" : "Meninggal"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alive">Hidup</SelectItem>
                      <SelectItem value="deceased">Meninggal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Nama Lengkap */}
              <div className="space-y-1">
                <Label htmlFor="primary_name" className="text-xs font-medium">
                  Nama Lengkap {primaryLabel} <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="primary_name" 
                  placeholder="Nama sesuai identitas" 
                  {...form.register("primary.full_name")}
                  className={`h-9 text-xs ${form.formState.errors.primary?.full_name ? "border-destructive" : ""}`}
                />
                {form.formState.errors.primary?.full_name && (
                  <p className="text-[11px] text-destructive">{form.formState.errors.primary.full_name.message}</p>
                )}
              </div>

              {/* Tempat & Tanggal Lahir */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                <div className="space-y-1">
                  <Label htmlFor="primary_birth_place" className="text-xs font-medium">Tempat Lahir</Label>
                  <Input id="primary_birth_place" className="h-9 text-xs" {...form.register("primary.birth_place")} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="primary_birth_date" className="text-xs font-medium">Tanggal Lahir</Label>
                  <Input id="primary_birth_date" type="date" className="h-9 text-xs [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:invert cursor-pointer" {...form.register("primary.birth_date")} />
                </div>
              </div>

              {/* Pendidikan & Pekerjaan */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                <div className="space-y-1">
                  <Label htmlFor="primary_education" className="text-xs font-medium">Pendidikan</Label>
                  <Input id="primary_education" className="h-9 text-xs" {...form.register("primary.education")} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="primary_occupation" className="text-xs font-medium">Pekerjaan</Label>
                  <Input id="primary_occupation" className="h-9 text-xs" {...form.register("primary.occupation")} />
                </div>
              </div>

              {/* No. Telp & Email */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                <div className="space-y-1">
                  <Label htmlFor="primary_phone" className="text-xs font-medium">No. Telp/HP</Label>
                  <Input id="primary_phone" className="h-9 text-xs" {...form.register("primary.phone")} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="primary_email" className="text-xs font-medium">E-mail</Label>
                  <Input id="primary_email" type="email" className="h-9 text-xs" {...form.register("primary.email")} />
                </div>
              </div>

              {/* Alamat Rumah */}
              <div className="space-y-1">
                <Label htmlFor="primary_address" className="text-xs font-medium">Alamat Rumah</Label>
                <Input id="primary_address" className="h-9 text-xs" {...form.register("primary.address")} />
              </div>

              {/* Data Orang Tua Silsilah Utama */}
              <div className="border-t border-border pt-3 mt-1 space-y-2.5">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-primary">
                    Data Orang Tua {primaryLabel} (Silsilah Utama)
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Nama orang tua dari anggota garis keturunan keluarga besar.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="primary_parent_name" className="text-xs font-medium">Nama Orang Tua (Ayah / Ibu)</Label>
                    <Input 
                      id="primary_parent_name" 
                      className="h-9 text-xs" 
                      placeholder="Contoh: Nama Ayah / Ibu kandung" 
                      {...form.register("primary.parent_name")} 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="primary_parent_address" className="text-xs font-medium">Alamat Asal Orang Tua</Label>
                    <Input 
                      id="primary_parent_address" 
                      className="h-9 text-xs" 
                      placeholder="Kota atau alamat orang tua" 
                      {...form.register("primary.parent_address")} 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DATA PASANGAN (BUKAN DARI KELUARGA UTAMA) */}
          {step === 2 && (
            <div className="space-y-3.5 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 text-xs sm:text-sm">
              <div className="flex items-center justify-between border border-border p-3.5 rounded-xl bg-background">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                    <Heart className="w-4 h-4 text-primary" />
                    <span>Data {spouseLabel} (Pasangan)</span>
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Aktifkan jika memiliki data {spouseLabel.toLowerCase()} (pasangan yang bukan dari keluarga utama) untuk dimasukkan.
                  </p>
                </div>
                <Switch 
                  checked={hasSpouse}
                  onCheckedChange={(checked) => form.setValue("spouse.has_spouse", checked)}
                />
              </div>

              {hasSpouse && (
                <div className="space-y-3 pt-2 border-t border-border">
                  {/* Foto Profil Pasangan */}
                  <div className="space-y-1.5">
                    <Label htmlFor="spouse_photo" className="text-xs font-medium">
                      Foto Profil {spouseLabel}
                    </Label>
                    {spousePhotoPreview ? (
                      <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-background">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden border border-border shrink-0 bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={spousePhotoPreview} 
                            alt={`Preview Foto ${spouseLabel}`} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold truncate text-foreground">
                              {spousePhoto?.name || `Foto ${spouseLabel} Terpilih`}
                            </span>
                            <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0">
                              Siap Unggah
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {spousePhoto ? `${(spousePhoto.size / 1024).toFixed(0)} KB (terkompresi)` : "Foto terpilih"}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <label 
                              htmlFor="spouse_photo_change" 
                              className="text-xs text-primary hover:underline cursor-pointer font-medium"
                            >
                              Ganti Foto
                            </label>
                            <input 
                              id="spouse_photo_change" 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handlePhotoChange(e, "spouse")} 
                              className="hidden" 
                            />
                            <span className="text-muted-foreground text-xs">•</span>
                            <button 
                              type="button" 
                              onClick={() => handleRemovePhoto("spouse")} 
                              className="text-xs text-destructive hover:underline font-medium"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Input 
                        id="spouse_photo" 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handlePhotoChange(e, "spouse")} 
                        className="bg-background text-muted-foreground file:bg-primary file:text-black file:border-0 file:rounded-md file:px-2.5 file:py-0.5 file:mr-2 file:font-semibold text-xs h-9" 
                      />
                    )}
                  </div>

                  {/* Status Hubungan & Status Hidup */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="spouse_family_status" className="text-xs font-medium">
                        Status Hubungan / Menantu
                      </Label>
                      <Input 
                        id="spouse_family_status" 
                        className="h-9 text-xs" 
                        placeholder={primaryRole === "suami" ? "Contoh: Istri Menantu / Cucu Menantu" : "Contoh: Suami Menantu / Cucu Menantu"} 
                        {...form.register("spouse.family_status")} 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="spouse_life_status" className="text-xs font-medium">Status Hidup</Label>
                      <Select 
                        value={form.watch("spouse.life_status") || "alive"} 
                        onValueChange={(val) => form.setValue("spouse.life_status", val as "alive" | "deceased")}
                      >
                        <SelectTrigger id="spouse_life_status" className="h-9 text-xs">
                          <SelectValue placeholder="Pilih">
                            {(form.watch("spouse.life_status") || "alive") === "alive" ? "Hidup" : "Meninggal"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alive">Hidup</SelectItem>
                          <SelectItem value="deceased">Meninggal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Nama Lengkap Pasangan */}
                  <div className="space-y-1">
                    <Label htmlFor="spouse_name" className="text-xs font-medium">
                      Nama Lengkap {spouseLabel} <span className="text-destructive">*</span>
                    </Label>
                    <Input 
                      id="spouse_name" 
                      placeholder={`Nama lengkap ${spouseLabel.toLowerCase()} sesuai identitas`}
                      className={`h-9 text-xs ${form.formState.errors.spouse?.full_name ? "border-destructive" : ""}`}
                      {...form.register("spouse.full_name")}
                    />
                    {form.formState.errors.spouse?.full_name && (
                      <p className="text-[11px] text-destructive">{form.formState.errors.spouse.full_name.message}</p>
                    )}
                  </div>

                  {/* Tempat & Tanggal Lahir */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="spouse_birth_place" className="text-xs font-medium">Tempat Lahir</Label>
                      <Input id="spouse_birth_place" className="h-9 text-xs" {...form.register("spouse.birth_place")} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="spouse_birth_date" className="text-xs font-medium">Tanggal Lahir</Label>
                      <Input id="spouse_birth_date" type="date" className="h-9 text-xs [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:invert cursor-pointer" {...form.register("spouse.birth_date")} />
                    </div>
                  </div>

                  {/* Pendidikan & Pekerjaan */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="spouse_education" className="text-xs font-medium">Pendidikan</Label>
                      <Input id="spouse_education" className="h-9 text-xs" {...form.register("spouse.education")} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="spouse_occupation" className="text-xs font-medium">Pekerjaan</Label>
                      <Input id="spouse_occupation" className="h-9 text-xs" {...form.register("spouse.occupation")} />
                    </div>
                  </div>

                  {/* No. Telp & Email */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="spouse_phone" className="text-xs font-medium">No. Telp/HP</Label>
                      <Input id="spouse_phone" className="h-9 text-xs" {...form.register("spouse.phone")} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="spouse_email" className="text-xs font-medium">E-mail</Label>
                      <Input id="spouse_email" type="email" className="h-9 text-xs" {...form.register("spouse.email")} />
                    </div>
                  </div>

                  {/* Alamat Rumah */}
                  <div className="space-y-1">
                    <Label htmlFor="spouse_address" className="text-xs font-medium">Alamat Rumah</Label>
                    <Input id="spouse_address" className="h-9 text-xs" {...form.register("spouse.address")} />
                  </div>

                  {/* Data Orang Tua Pasangan (Non-Silsilah Utama) */}
                  <div className="border-t border-border pt-3 mt-1 space-y-2.5">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-semibold text-primary">
                        Data Orang Tua {spouseLabel} (Pasangan / Besan)
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        Nama orang tua dari pasangan (yang bukan dari keluarga utama).
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="spouse_parent_name" className="text-xs font-medium">Nama Orang Tua Pasangan</Label>
                        <Input 
                          id="spouse_parent_name" 
                          className="h-9 text-xs" 
                          placeholder="Contoh: Nama Ayah / Ibu mertua" 
                          {...form.register("spouse.parent_name")} 
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="spouse_parent_address" className="text-xs font-medium">Alamat Asal Orang Tua Pasangan</Label>
                        <Input 
                          id="spouse_parent_address" 
                          className="h-9 text-xs" 
                          placeholder="Kota atau alamat orang tua pasangan" 
                          {...form.register("spouse.parent_address")} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: CHILDREN */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 text-xs sm:text-sm">
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-3.5 border border-border rounded-xl bg-background relative space-y-2.5">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-primary text-xs">Data Anak ke-{index + 1}</h4>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:bg-destructive/10 h-7 text-xs px-2"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Nama Anak <span className="text-destructive">*</span></Label>
                        <Input 
                          placeholder="Nama anak" 
                          {...form.register(`children.${index}.full_name`)} 
                          className={`h-9 text-xs ${form.formState.errors.children?.[index]?.full_name ? "border-destructive" : ""}`} 
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Jenis Kelamin <span className="text-destructive">*</span></Label>
                        <Select 
                          onValueChange={(val) => form.setValue(`children.${index}.gender`, val as "L" | "P")} 
                          value={form.watch(`children.${index}.gender`) || ""}
                        >
                          <SelectTrigger className={`h-9 text-xs ${form.formState.errors.children?.[index]?.gender ? "border-destructive" : ""}`}>
                            <SelectValue placeholder="L/P">
                              {form.watch(`children.${index}.gender`) === "L" ? "Laki-laki (L)" : form.watch(`children.${index}.gender`) === "P" ? "Perempuan (P)" : ""}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="L">Laki-laki (L)</SelectItem>
                            <SelectItem value="P">Perempuan (P)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Tempat Lahir</Label>
                        <Input className="h-9 text-xs" {...form.register(`children.${index}.birth_place`)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Tanggal Lahir</Label>
                        <Input className="h-9 text-xs [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:invert cursor-pointer" type="date" {...form.register(`children.${index}.birth_date`)} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Pendidikan Sekarang/Terakhir</Label>
                      <Input className="h-9 text-xs" {...form.register(`children.${index}.education`)} />
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full border-dashed border py-3 text-xs text-muted-foreground hover:text-primary hover:border-primary/50" 
                onClick={() => append({ nik: "", full_name: "", gender: undefined as unknown as "L" | "P", life_status: "alive", birth_place: "", birth_date: "", education: "" })}
              >
                <Plus className="w-4 h-4 mr-1.5" /> Tambah Data Anak
              </Button>
            </div>
          )}

        </form>
      </CardContent>

      <CardFooter className="flex justify-between border-t border-border pt-6 mt-2">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={handlePrev}
          disabled={step === 1 || isSubmitting}
          className="text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Sebelumnya
        </Button>

        {step < 3 ? (
          <Button 
            type="button" 
            onClick={handleNext}
            className="bg-primary text-black hover:bg-primary/85"
          >
            Selanjutnya <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button 
            type="button" 
            onClick={() => setShowConfirmation(true)}
            disabled={isSubmitting}
            className="bg-secondary text-white hover:bg-secondary/85"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
            ) : (
              <><CheckCircle2 className="w-4 h-4 mr-2" /> Selesai & Simpan</>
            )}
          </Button>
        )}
      </CardFooter>

      {/* Confirmation Popup */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Konfirmasi Penyimpanan</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Pastikan data sudah benar sebelum disimpan.</p>
              </div>
            </div>

            <div className="rounded-lg bg-background p-3.5 border border-border/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Anggota Utama ({primaryLabel}):</span>
                <span className="font-semibold text-foreground">{form.getValues("primary.full_name") || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status Keluarga:</span>
                <span className="font-medium text-foreground">{form.getValues("primary.family_status") || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pasangan ({spouseLabel}):</span>
                <span className="font-medium text-foreground">
                  {hasSpouse ? form.getValues("spouse.full_name") || "(Belum diisi)" : "Tidak dimasukkan"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jumlah Anak:</span>
                <span className="font-medium text-foreground">{fields.length} Anak</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Data yang Anda masukkan akan tersimpan dan direkap sebagai bagian dari <span className="text-foreground font-medium">Buku Induk Keluarga</span>. Pastikan seluruh informasi telah diisi dengan benar untuk pencatatan silsilah keluarga.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setShowConfirmation(false)}
                className="text-muted-foreground text-xs"
              >
                Periksa Kembali
              </Button>
              <Button 
                type="button" 
                onClick={() => {
                  setShowConfirmation(false);
                  form.handleSubmit(onSubmit)();
                }}
                disabled={isSubmitting}
                className="bg-secondary text-white hover:bg-secondary/85 text-xs font-semibold"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Ya, Simpan Data
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
