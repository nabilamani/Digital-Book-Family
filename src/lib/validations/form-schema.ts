import * as z from "zod";

export const primaryPersonSchema = z.object({
  role: z.enum(["suami", "istri"], {
    message: "Pilih status suami atau istri",
  }).default("suami"),
  nik: z.string().optional(),
  full_name: z.string().min(2, "Nama lengkap harus diisi"),
  family_status: z.string().min(1, "Status keluarga harus diisi"), // e.g. "Cucu", "Anak"
  life_status: z.enum(["alive", "deceased"]).default("alive"),
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

export const spouseSchema = z.object({
  has_spouse: z.boolean().default(false),
  full_name: z.string().optional(),
  family_status: z.string().optional(), // e.g. "Cucu Menantu", "Menantu"
  life_status: z.enum(["alive", "deceased"]).default("alive"),
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
  life_status: z.enum(["alive", "deceased"]).default("alive"),
  birth_place: z.string().optional(),
  birth_date: z.string().optional(),
  education: z.string().optional(),
});

export const fullFormSchema = z.object({
  primary: primaryPersonSchema,
  spouse: spouseSchema,
  children: z.array(childSchema).optional(),
});

export type PrimaryPersonValues = z.infer<typeof primaryPersonSchema>;
export type SpouseValues = z.infer<typeof spouseSchema>;
export type ChildValues = z.infer<typeof childSchema>;
export type FullFormValues = z.infer<typeof fullFormSchema>;

// Backward compatibility aliases
export const husbandSchema = primaryPersonSchema;
export const wifeSchema = spouseSchema;
export type HusbandValues = PrimaryPersonValues;
export type WifeValues = SpouseValues;

