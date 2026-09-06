import * as z from "zod";

export const husbandSchema = z.object({
  nik: z.string().optional(),
  full_name: z.string().min(2, "Nama lengkap harus diisi"),
  family_status: z.string().min(1, "Status keluarga harus diisi"), // e.g. "Cucu"
  birth_place: z.string().optional(),
  birth_date: z.string().optional(),
  education: z.string().optional(),
  occupation: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  address: z.string().optional(),
});

export const wifeSchema = z.object({
  has_wife: z.boolean().default(false),
  full_name: z.string().optional(),
  family_status: z.string().optional(), // e.g. "Cucu Menantu"
  birth_place: z.string().optional(),
  birth_date: z.string().optional(),
  education: z.string().optional(),
  occupation: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  address: z.string().optional(),
  parent_name: z.string().optional(),
  parent_address: z.string().optional(),
});

export const childSchema = z.object({
  nik: z.string().optional(),
  full_name: z.string().min(2, "Nama harus diisi"),
  gender: z.enum(["L", "P"], { message: "Pilih jenis kelamin" }),
  birth_place: z.string().optional(),
  birth_date: z.string().optional(),
  education: z.string().optional(),
});

export const fullFormSchema = z.object({
  husband: husbandSchema,
  wife: wifeSchema,
  children: z.array(childSchema).optional(),
});

export type HusbandValues = z.infer<typeof husbandSchema>;
export type WifeValues = z.infer<typeof wifeSchema>;
export type ChildValues = z.infer<typeof childSchema>;
export type FullFormValues = z.infer<typeof fullFormSchema>;
