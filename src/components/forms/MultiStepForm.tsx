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
import { Loader2, Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function MultiStepForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [husbandPhoto, setHusbandPhoto] = useState<File | null>(null);
  const [wifePhoto, setWifePhoto] = useState<File | null>(null);
  const [husbandPhotoPreview, setHusbandPhotoPreview] = useState<string | null>(null);
  const [wifePhotoPreview, setWifePhotoPreview] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    return () => {
      if (husbandPhotoPreview) URL.revokeObjectURL(husbandPhotoPreview);
      if (wifePhotoPreview) URL.revokeObjectURL(wifePhotoPreview);
    };
  }, [husbandPhotoPreview, wifePhotoPreview]);

  const form = useForm<FullFormValues>({
    resolver: zodResolver(fullFormSchema) as any,
    defaultValues: {
      husband: {
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
      },
      wife: {
        has_wife: false,
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

  const handleNext = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await form.trigger("husband");
    } else if (step === 2) {
      if (form.getValues("wife.has_wife")) {
        // Only validate specific wife fields if has_wife is true
        // Since we don't have min() requirements for wife in zod (all optional for now, except conditionally),
        // we might just trigger the whole object. Let's trigger all wife fields.
        isValid = await form.trigger("wife");
        
        // Manual validation if they check has_wife but don't fill name
        if (isValid && !form.getValues("wife.full_name")) {
          form.setError("wife.full_name", { type: "manual", message: "Nama istri harus diisi jika dicentang" });
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

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "husband" | "wife") => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (type === "husband") {
        if (husbandPhotoPreview) URL.revokeObjectURL(husbandPhotoPreview);
        setHusbandPhotoPreview(previewUrl);
      } else {
        if (wifePhotoPreview) URL.revokeObjectURL(wifePhotoPreview);
        setWifePhotoPreview(previewUrl);
      }

      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        if (type === "husband") setHusbandPhoto(compressedFile);
        else setWifePhoto(compressedFile);
        toast.success(`Foto ${type === "husband" ? "Suami" : "Istri"} berhasil diproses.`);
      } catch (error) {
        console.error(error);
        toast.error("Gagal memproses foto.");
      }
    }
  };

  const handleRemovePhoto = (type: "husband" | "wife") => {
    if (type === "husband") {
      if (husbandPhotoPreview) URL.revokeObjectURL(husbandPhotoPreview);
      setHusbandPhoto(null);
      setHusbandPhotoPreview(null);
    } else {
      if (wifePhotoPreview) URL.revokeObjectURL(wifePhotoPreview);
      setWifePhoto(null);
      setWifePhotoPreview(null);
    }
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    toast.loading("Menyimpan data keluarga...");

    try {
      let husbandPhotoPath = null;
      let wifePhotoPath = null;

      if (husbandPhoto) {
        const formData = new FormData();
        formData.append("file", husbandPhoto);
        const uploadResult = await uploadPhoto(formData);
        if (uploadResult.success) husbandPhotoPath = uploadResult.path || null;
      }

      if (wifePhoto && data.wife.has_wife) {
        const formData = new FormData();
        formData.append("file", wifePhoto);
        const uploadResult = await uploadPhoto(formData);
        if (uploadResult.success) wifePhotoPath = uploadResult.path || null;
      }

      const result = await submitPersonForm(data, husbandPhotoPath, wifePhotoPath);
      
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

  const hasWife = form.watch("wife.has_wife");

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
          {step === 1 && "Data Pribadi (Silsilah Utama)"}
          {step === 2 && "Data Istri (Pasangan)"}
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
          
          {/* STEP 1: HUSBAND DATA */}
          {step === 1 && (
            <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 text-xs sm:text-sm">
              {/* Foto Profil */}
              <div className="space-y-1.5">
                <Label htmlFor="husband_photo" className="text-xs font-medium">Foto Profil</Label>
                {husbandPhotoPreview ? (
                  <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-background">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden border border-border shrink-0 bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={husbandPhotoPreview} 
                        alt="Preview Foto Suami" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold truncate text-foreground">
                          {husbandPhoto?.name || "Foto Suami Terpilih"}
                        </span>
                        <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0">
                          Siap Unggah
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {husbandPhoto ? `${(husbandPhoto.size / 1024).toFixed(0)} KB (terkompresi)` : "Foto terpilih"}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <label 
                          htmlFor="husband_photo_change" 
                          className="text-xs text-primary hover:underline cursor-pointer font-medium"
                        >
                          Ganti Foto
                        </label>
                        <input 
                          id="husband_photo_change" 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handlePhotoChange(e, "husband")} 
                          className="hidden" 
                        />
                        <span className="text-muted-foreground text-xs">•</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemovePhoto("husband")} 
                          className="text-xs text-destructive hover:underline font-medium"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Input 
                    id="husband_photo" 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handlePhotoChange(e, "husband")} 
                    className="bg-background text-muted-foreground file:bg-primary file:text-black file:border-0 file:rounded-md file:px-2.5 file:py-0.5 file:mr-2 file:font-semibold text-xs h-9" 
                  />
                )}
              </div>

              {/* Status Keluarga & Status Hidup */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                <div className="space-y-1">
                  <Label htmlFor="husband_family_status" className="text-xs font-medium">Status Keluarga <span className="text-destructive">*</span></Label>
                  <Input 
                    id="husband_family_status" 
                    placeholder="Contoh: Cucu" 
                    {...form.register("husband.family_status")} 
                    className={`h-9 text-xs ${form.formState.errors.husband?.family_status ? "border-destructive" : ""}`} 
                  />
                  {form.formState.errors.husband?.family_status && (
                    <p className="text-[11px] text-destructive">{form.formState.errors.husband.family_status.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="husband_life_status" className="text-xs font-medium">Status Hidup</Label>
                  <Select 
                    value={form.watch("husband.life_status") || "alive"} 
                    onValueChange={(val) => form.setValue("husband.life_status", val as "alive" | "deceased")}
                  >
                    <SelectTrigger id="husband_life_status" className="h-9 text-xs">
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alive">Hidup</SelectItem>
                      <SelectItem value="deceased">Meninggal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="husband_name" className="text-xs font-medium">Nama Lengkap <span className="text-destructive">*</span></Label>
                <Input 
                  id="husband_name" 
                  placeholder="Nama sesuai identitas" 
                  {...form.register("husband.full_name")}
                  className={`h-9 text-xs ${form.formState.errors.husband?.full_name ? "border-destructive" : ""}`}
                />
                {form.formState.errors.husband?.full_name && (
                  <p className="text-[11px] text-destructive">{form.formState.errors.husband.full_name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                <div className="space-y-1">
                  <Label htmlFor="husband_birth_place" className="text-xs font-medium">Tempat Lahir</Label>
                  <Input id="husband_birth_place" className="h-9 text-xs" {...form.register("husband.birth_place")} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="husband_birth_date" className="text-xs font-medium">Tanggal Lahir</Label>
                  <Input id="husband_birth_date" type="date" className="h-9 text-xs" {...form.register("husband.birth_date")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                <div className="space-y-1">
                  <Label htmlFor="husband_education" className="text-xs font-medium">Pendidikan</Label>
                  <Input id="husband_education" className="h-9 text-xs" {...form.register("husband.education")} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="husband_occupation" className="text-xs font-medium">Pekerjaan</Label>
                  <Input id="husband_occupation" className="h-9 text-xs" {...form.register("husband.occupation")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                <div className="space-y-1">
                  <Label htmlFor="husband_phone" className="text-xs font-medium">No. Telp/HP</Label>
                  <Input id="husband_phone" className="h-9 text-xs" {...form.register("husband.phone")} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="husband_email" className="text-xs font-medium">E-mail</Label>
                  <Input id="husband_email" type="email" className="h-9 text-xs" {...form.register("husband.email")} />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="husband_address" className="text-xs font-medium">Alamat Rumah</Label>
                <Input id="husband_address" className="h-9 text-xs" {...form.register("husband.address")} />
              </div>
            </div>
          )}

          {/* STEP 2: WIFE DATA */}
          {step === 2 && (
            <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 text-xs sm:text-sm">
              <div className="flex items-center justify-between border border-border p-3 rounded-lg bg-background">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Data Istri</Label>
                  <p className="text-[11px] text-muted-foreground">Aktifkan jika memiliki data istri untuk dimasukkan.</p>
                </div>
                <Switch 
                  checked={hasWife}
                  onCheckedChange={(checked) => form.setValue("wife.has_wife", checked)}
                />
              </div>

              {hasWife && (
                <div className="space-y-3 pt-2 border-t border-border">
                  {/* Foto Profil Istri */}
                  <div className="space-y-1.5">
                    <Label htmlFor="wife_photo" className="text-xs font-medium">Foto Profil</Label>
                    {wifePhotoPreview ? (
                      <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-background">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden border border-border shrink-0 bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={wifePhotoPreview} 
                            alt="Preview Foto Istri" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold truncate text-foreground">
                              {wifePhoto?.name || "Foto Istri Terpilih"}
                            </span>
                            <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0">
                              Siap Unggah
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {wifePhoto ? `${(wifePhoto.size / 1024).toFixed(0)} KB (terkompresi)` : "Foto terpilih"}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <label 
                              htmlFor="wife_photo_change" 
                              className="text-xs text-primary hover:underline cursor-pointer font-medium"
                            >
                              Ganti Foto
                            </label>
                            <input 
                              id="wife_photo_change" 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handlePhotoChange(e, "wife")} 
                              className="hidden" 
                            />
                            <span className="text-muted-foreground text-xs">•</span>
                            <button 
                              type="button" 
                              onClick={() => handleRemovePhoto("wife")} 
                              className="text-xs text-destructive hover:underline font-medium"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Input 
                        id="wife_photo" 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handlePhotoChange(e, "wife")} 
                        className="bg-background text-muted-foreground file:bg-primary file:text-black file:border-0 file:rounded-md file:px-2.5 file:py-0.5 file:mr-2 file:font-semibold text-xs h-9" 
                      />
                    )}
                  </div>

                  {/* Status Keluarga & Status Hidup Istri */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="wife_family_status" className="text-xs font-medium">Status Keluarga</Label>
                      <Input id="wife_family_status" className="h-9 text-xs" placeholder="Contoh: Cucu Menantu" {...form.register("wife.family_status")} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="wife_life_status" className="text-xs font-medium">Status Hidup</Label>
                      <Select 
                        value={form.watch("wife.life_status") || "alive"} 
                        onValueChange={(val) => form.setValue("wife.life_status", val as "alive" | "deceased")}
                      >
                        <SelectTrigger id="wife_life_status" className="h-9 text-xs">
                          <SelectValue placeholder="Pilih" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alive">Hidup</SelectItem>
                          <SelectItem value="deceased">Meninggal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="wife_name" className="text-xs font-medium">Nama Lengkap <span className="text-destructive">*</span></Label>
                    <Input 
                      id="wife_name" 
                      className={`h-9 text-xs ${form.formState.errors.wife?.full_name ? "border-destructive" : ""}`}
                      {...form.register("wife.full_name")}
                    />
                    {form.formState.errors.wife?.full_name && (
                      <p className="text-[11px] text-destructive">{form.formState.errors.wife.full_name.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="wife_birth_place" className="text-xs font-medium">Tempat Lahir</Label>
                      <Input id="wife_birth_place" className="h-9 text-xs" {...form.register("wife.birth_place")} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="wife_birth_date" className="text-xs font-medium">Tanggal Lahir</Label>
                      <Input id="wife_birth_date" type="date" className="h-9 text-xs" {...form.register("wife.birth_date")} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="wife_education" className="text-xs font-medium">Pendidikan</Label>
                      <Input id="wife_education" className="h-9 text-xs" {...form.register("wife.education")} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="wife_occupation" className="text-xs font-medium">Pekerjaan</Label>
                      <Input id="wife_occupation" className="h-9 text-xs" {...form.register("wife.occupation")} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="wife_phone" className="text-xs font-medium">No. Telp/HP</Label>
                      <Input id="wife_phone" className="h-9 text-xs" {...form.register("wife.phone")} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="wife_email" className="text-xs font-medium">E-mail</Label>
                      <Input id="wife_email" type="email" className="h-9 text-xs" {...form.register("wife.email")} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="wife_address" className="text-xs font-medium">Alamat Rumah</Label>
                    <Input id="wife_address" className="h-9 text-xs" {...form.register("wife.address")} />
                  </div>
                  

                  {/* <div className="border-t border-border pt-3 mt-1">
                    <h4 className="text-xs font-semibold mb-2 text-primary">Data Orang Tua Istri</h4>
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="wife_parent_name" className="text-xs font-medium">Nama Orang Tua</Label>
                        <Input id="wife_parent_name" className="h-9 text-xs" {...form.register("wife.parent_name")} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="wife_parent_address" className="text-xs font-medium">Alamat Orang Tua</Label>
                        <Input id="wife_parent_address" className="h-9 text-xs" {...form.register("wife.parent_address")} />
                      </div>
                    </div>
                  </div> */}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: CHILDREN */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 text-xs sm:text-sm">
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-3 border border-border rounded-lg bg-background relative space-y-2.5">
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
                            <SelectValue placeholder="L/P" />
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
                        <Input className="h-9 text-xs" type="date" {...form.register(`children.${index}.birth_date`)} />
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
            <p className="text-sm text-muted-foreground leading-relaxed">
              Data yang Anda masukkan akan tersimpan dan direkap sebagai bagian dari <span className="text-foreground font-medium">Buku Induk Keluarga</span>. Pastikan seluruh informasi telah diisi dengan benar karena data ini akan digunakan untuk pencatatan silsilah keluarga.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setShowConfirmation(false)}
                className="text-muted-foreground text-sm"
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
                className="bg-secondary text-white hover:bg-secondary/85 text-sm"
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
