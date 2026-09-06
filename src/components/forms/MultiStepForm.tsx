"use client";

import { useState } from "react";
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

  const form = useForm<FullFormValues>({
    resolver: zodResolver(fullFormSchema) as any,
    defaultValues: {
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
      },
      wife: {
        has_wife: false,
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
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        if (type === "husband") setHusbandPhoto(compressedFile);
        else setWifePhoto(compressedFile);
        toast.success(`Foto ${type === "husband" ? "Suami" : "Istri"} berhasil dikompresi.`);
      } catch (error) {
        console.error(error);
        toast.error("Gagal memproses foto.");
      }
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
      
      if (result.success && result.editToken) {
        toast.dismiss();
        toast.success("Data berhasil disimpan!");
        router.push(`/form/success?token=${result.editToken}`);
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
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-2xl text-primary font-bold">Buku Induk Keluarga</CardTitle>
          <span className="text-sm text-muted-foreground font-mono bg-background px-3 py-1 rounded-full border border-border">
            Step {step} / 3
          </span>
        </div>
        <CardDescription className="text-base">
          {step === 1 && "Data Pribadi (Silsilah Utama)"}
          {step === 2 && "Data Istri (Pasangan)"}
          {step === 3 && "Data Anak-Anak"}
        </CardDescription>
        
        <div className="w-full h-2 bg-background rounded-full mt-4 overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* STEP 1: HUSBAND DATA */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2 mb-6">
                <Label htmlFor="husband_photo">Foto Profil <span className="text-destructive">*</span></Label>
                <Input 
                  id="husband_photo" 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handlePhotoChange(e, "husband")}
                  className="bg-background text-muted-foreground file:bg-primary file:text-black file:border-0 file:rounded-md file:px-4 file:py-1 file:mr-4 file:font-semibold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="husband_family_status">Status Keluarga <span className="text-destructive">*</span></Label>
                <Input 
                  id="husband_family_status" 
                  placeholder="Contoh: Cucu" 
                  {...form.register("husband.family_status")}
                  className={form.formState.errors.husband?.family_status ? "border-destructive" : ""}
                />
                {form.formState.errors.husband?.family_status && (
                  <p className="text-sm text-destructive">{form.formState.errors.husband.family_status.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="husband_name">Nama Lengkap <span className="text-destructive">*</span></Label>
                <Input 
                  id="husband_name" 
                  placeholder="Nama sesuai identitas" 
                  {...form.register("husband.full_name")}
                  className={form.formState.errors.husband?.full_name ? "border-destructive" : ""}
                />
                {form.formState.errors.husband?.full_name && (
                  <p className="text-sm text-destructive">{form.formState.errors.husband.full_name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="husband_birth_place">Tempat Lahir</Label>
                  <Input id="husband_birth_place" {...form.register("husband.birth_place")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="husband_birth_date">Tanggal Lahir</Label>
                  <Input id="husband_birth_date" type="date" {...form.register("husband.birth_date")} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="husband_education">Pendidikan</Label>
                  <Input id="husband_education" {...form.register("husband.education")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="husband_occupation">Pekerjaan</Label>
                  <Input id="husband_occupation" {...form.register("husband.occupation")} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="husband_phone">No. Telp/HP</Label>
                  <Input id="husband_phone" {...form.register("husband.phone")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="husband_email">E-mail</Label>
                  <Input id="husband_email" type="email" {...form.register("husband.email")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="husband_address">Alamat Rumah</Label>
                <Input id="husband_address" {...form.register("husband.address")} />
              </div>
            </div>
          )}

          {/* STEP 2: WIFE DATA */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between border border-border p-4 rounded-lg bg-background">
                <div className="space-y-0.5">
                  <Label className="text-base">Data Istri</Label>
                  <p className="text-sm text-muted-foreground">Aktifkan jika memiliki data istri untuk dimasukkan.</p>
                </div>
                <Switch 
                  checked={hasWife}
                  onCheckedChange={(checked) => form.setValue("wife.has_wife", checked)}
                />
              </div>

              {hasWife && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="space-y-2 mb-6">
                    <Label htmlFor="wife_photo">Foto Profil <span className="text-destructive">*</span></Label>
                    <Input 
                      id="wife_photo" 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handlePhotoChange(e, "wife")}
                      className="bg-background text-muted-foreground file:bg-primary file:text-black file:border-0 file:rounded-md file:px-4 file:py-1 file:mr-4 file:font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wife_name">Nama Lengkap <span className="text-destructive">*</span></Label>
                    <Input 
                      id="wife_name" 
                      {...form.register("wife.full_name")}
                      className={form.formState.errors.wife?.full_name ? "border-destructive" : ""}
                    />
                    {form.formState.errors.wife?.full_name && (
                      <p className="text-sm text-destructive">{form.formState.errors.wife.full_name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wife_family_status">Status Keluarga</Label>
                    <Input id="wife_family_status" placeholder="Contoh: Cucu Menantu" {...form.register("wife.family_status")} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="wife_birth_place">Tempat Lahir</Label>
                      <Input id="wife_birth_place" {...form.register("wife.birth_place")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wife_birth_date">Tanggal Lahir</Label>
                      <Input id="wife_birth_date" type="date" {...form.register("wife.birth_date")} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="wife_education">Pendidikan</Label>
                      <Input id="wife_education" {...form.register("wife.education")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wife_occupation">Pekerjaan</Label>
                      <Input id="wife_occupation" {...form.register("wife.occupation")} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="wife_phone">No. Telp/HP</Label>
                      <Input id="wife_phone" {...form.register("wife.phone")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wife_email">E-mail</Label>
                      <Input id="wife_email" type="email" {...form.register("wife.email")} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wife_address">Alamat Rumah</Label>
                    <Input id="wife_address" {...form.register("wife.address")} />
                  </div>

                  <div className="border-t border-border pt-4 mt-2">
                    <h4 className="text-sm font-medium mb-4 text-primary">Data Orang Tua Istri</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="wife_parent_name">Nama Orang Tua</Label>
                        <Input id="wife_parent_name" {...form.register("wife.parent_name")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wife_parent_address">Alamat Rumah (Orang Tua)</Label>
                        <Input id="wife_parent_address" {...form.register("wife.parent_address")} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: CHILDREN */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-6">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 border border-border rounded-lg bg-background relative space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-primary">Data Anak ke-{index + 1}</h4>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:bg-destructive/10 h-8"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Hapus
                      </Button>
                    </div>

                    <div className="space-y-2 mb-4">
                      <Label>Nama <span className="text-destructive">*</span></Label>
                      <Input 
                        placeholder="Nama anak" 
                        {...form.register(`children.${index}.full_name`)} 
                        className={form.formState.errors.children?.[index]?.full_name ? "border-destructive" : ""}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Jenis Kelamin <span className="text-destructive">*</span></Label>
                        <Select 
                          onValueChange={(val) => form.setValue(`children.${index}.gender`, val as "L" | "P")}
                          value={form.watch(`children.${index}.gender`)}
                        >
                          <SelectTrigger className={form.formState.errors.children?.[index]?.gender ? "border-destructive" : ""}>
                            <SelectValue placeholder="L/P" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="L">Laki-laki (L)</SelectItem>
                            <SelectItem value="P">Perempuan (P)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label>Tempat Lahir</Label>
                          <Input {...form.register(`children.${index}.birth_place`)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Tanggal Lahir</Label>
                          <Input type="date" {...form.register(`children.${index}.birth_date`)} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Pendidikan Sekarang/Terakhir</Label>
                      <Input {...form.register(`children.${index}.education`)} />
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full border-dashed border-2 py-6 text-muted-foreground hover:text-primary hover:border-primary/50"
                onClick={() => append({ nik: "", full_name: "", gender: undefined as unknown as "L" | "P", birth_place: "", birth_date: "", education: "" })}
              >
                <Plus className="w-5 h-5 mr-2" /> Tambah Data Anak
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
            onClick={form.handleSubmit(onSubmit)}
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
    </Card>
  );
}
