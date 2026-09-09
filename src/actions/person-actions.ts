"use server";

import { createClient } from "@/lib/supabase/server";
import { FullFormValues } from "@/lib/validations/form-schema";

export async function submitPersonForm(
  data: FullFormValues, 
  husbandPhotoPath: string | null,
  wifePhotoPath: string | null
) {
  const supabase: any = await createClient();

  try {
    // 1. Insert Husband (Data Pribadi)
    const { data: husbandRecord, error: husbandError } = await supabase
      .from("persons")
      .insert({
        nik: data.husband.nik,
        full_name: data.husband.full_name,
        family_status: data.husband.family_status,
        life_status: data.husband.life_status || "alive",
        gender: "Laki-laki", // Implicit for Husband
        birth_place: data.husband.birth_place || null,
        birth_date: data.husband.birth_date || null,
        education: data.husband.education || null,
        occupation: data.husband.occupation || null,
        phone: data.husband.phone || null,
        email: data.husband.email || null,
        address: data.husband.address || null,
        photo_path: husbandPhotoPath,
        data_status: "submitted",
      })
      .select("id, edit_token")
      .single();

    if (husbandError) {
      console.error("Error inserting husband:", husbandError);
      throw new Error(`Gagal menyimpan data suami: ${husbandError.message || JSON.stringify(husbandError)}`);
    }

    const husbandId = husbandRecord.id;
    let wifeId = null;

    // 2. Insert Wife (Data Istri)
    if (data.wife.has_wife && data.wife.full_name) {
      const { data: wifeRecord, error: wifeError } = await supabase
        .from("persons")
        .insert({
          nik: null, // As per physical form
          full_name: data.wife.full_name,
          family_status: data.wife.family_status || null,
          life_status: data.wife.life_status || "alive",
          gender: "Perempuan", // Implicit for Wife
          birth_place: data.wife.birth_place || null,
          birth_date: data.wife.birth_date || null,
          education: data.wife.education || null,
          occupation: data.wife.occupation || null,
          phone: data.wife.phone || null,
          email: data.wife.email || null,
          address: data.wife.address || null,
          parent_name: data.wife.parent_name || null,
          parent_address: data.wife.parent_address || null,
          photo_path: wifePhotoPath,
          data_status: "submitted",
        })
        .select("id")
        .single();

      if (wifeError) {
        console.error("Error inserting wife:", wifeError);
      } else {
        wifeId = wifeRecord.id;

        // Insert Spouse Relationship
        await supabase.from("relationships").insert([
          { person_id: husbandId, related_person_id: wifeId, relationship_type: "spouse", created_by: husbandId },
          { person_id: wifeId, related_person_id: husbandId, relationship_type: "spouse", created_by: husbandId }
        ]);
      }
    }

    // 3. Insert Children (Anak-Anak)
    if (data.children && data.children.length > 0) {
      for (const child of data.children) {
        const { data: childRecord, error: childError } = await supabase
          .from("persons")
          .insert({
            nik: child.nik,
            full_name: child.full_name,
            gender: child.gender === "L" ? "Laki-laki" : "Perempuan",
            life_status: child.life_status || "alive",
            birth_place: child.birth_place || null,
            birth_date: child.birth_date || null,
            education: child.education || null,
            data_status: "submitted",
          })
          .select("id")
          .single();

        if (!childError && childRecord) {
          const childId = childRecord.id;
          
          // Insert Parent-Child relationships
          const relationshipsToInsert = [
            { person_id: husbandId, related_person_id: childId, relationship_type: "child", created_by: husbandId },
            { person_id: childId, related_person_id: husbandId, relationship_type: "parent", created_by: husbandId }
          ];

          if (wifeId) {
            relationshipsToInsert.push({ person_id: wifeId, related_person_id: childId, relationship_type: "child", created_by: husbandId });
            relationshipsToInsert.push({ person_id: childId, related_person_id: wifeId, relationship_type: "parent", created_by: husbandId });
          }

          await supabase.from("relationships").insert(relationshipsToInsert);
        } else {
          console.error("Error inserting child:", childError);
        }
      }
    }

    return { success: true, editToken: husbandRecord.edit_token };
  } catch (error) {
    console.error(error);
    return { success: false, error: (error as Error).message };
  }
}
