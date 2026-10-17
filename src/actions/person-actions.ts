"use server";

import { createClient } from "@/lib/supabase/server";
import { FullFormValues } from "@/lib/validations/form-schema";

export async function submitPersonForm(
  data: FullFormValues, 
  primaryPhotoPath: string | null,
  spousePhotoPath: string | null
) {
  const supabase: any = await createClient();

  try {
    const isPrimaryHusband = data.primary.role === "suami";
    const primaryGender = isPrimaryHusband ? "Laki-laki" : "Perempuan";
    const spouseGender = isPrimaryHusband ? "Perempuan" : "Laki-laki";

    // 1. Insert Primary Person (Data Utama Silsilah Keluarga Besar)
    const { data: primaryRecord, error: primaryError } = await supabase
      .from("persons")
      .insert({
        nik: data.primary.nik || null,
        full_name: data.primary.full_name,
        family_status: data.primary.family_status,
        life_status: data.primary.life_status || "alive",
        gender: primaryGender,
        birth_place: data.primary.birth_place || null,
        birth_date: data.primary.birth_date || null,
        education: data.primary.education || null,
        occupation: data.primary.occupation || null,
        phone: data.primary.phone || null,
        email: data.primary.email || null,
        address: data.primary.address || null,
        parent_name: data.primary.parent_name || null,
        parent_address: data.primary.parent_address || null,
        photo_path: primaryPhotoPath,
        data_status: "submitted",
      })
      .select("id, edit_token")
      .single();

    if (primaryError) {
      console.error("Error inserting primary person:", primaryError);
      throw new Error(`Gagal menyimpan data utama: ${primaryError.message || JSON.stringify(primaryError)}`);
    }

    const primaryId = primaryRecord.id;
    let spouseId = null;

    // 2. Insert Spouse (Data Pasangan Non-Keluarga Utama)
    if (data.spouse.has_spouse && data.spouse.full_name) {
      const defaultSpouseStatus = isPrimaryHusband ? "Istri" : "Suami";
      const { data: spouseRecord, error: spouseError } = await supabase
        .from("persons")
        .insert({
          nik: null,
          full_name: data.spouse.full_name,
          family_status: data.spouse.family_status || defaultSpouseStatus,
          life_status: data.spouse.life_status || "alive",
          gender: spouseGender,
          birth_place: data.spouse.birth_place || null,
          birth_date: data.spouse.birth_date || null,
          education: data.spouse.education || null,
          occupation: data.spouse.occupation || null,
          phone: data.spouse.phone || null,
          email: data.spouse.email || null,
          address: data.spouse.address || null,
          parent_name: data.spouse.parent_name || null,
          parent_address: data.spouse.parent_address || null,
          photo_path: spousePhotoPath,
          data_status: "submitted",
        })
        .select("id")
        .single();

      if (spouseError) {
        console.error("Error inserting spouse:", spouseError);
      } else {
        spouseId = spouseRecord.id;

        // Insert Spouse Relationship
        await supabase.from("relationships").insert([
          { person_id: primaryId, related_person_id: spouseId, relationship_type: "spouse", created_by: primaryId },
          { person_id: spouseId, related_person_id: primaryId, relationship_type: "spouse", created_by: primaryId }
        ]);
      }
    }

    // 3. Insert Children (Anak-Anak)
    if (data.children && data.children.length > 0) {
      for (const child of data.children) {
        const { data: childRecord, error: childError } = await supabase
          .from("persons")
          .insert({
            nik: child.nik || null,
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
            { person_id: primaryId, related_person_id: childId, relationship_type: "child", created_by: primaryId },
            { person_id: childId, related_person_id: primaryId, relationship_type: "parent", created_by: primaryId }
          ];

          if (spouseId) {
            relationshipsToInsert.push({ person_id: spouseId, related_person_id: childId, relationship_type: "child", created_by: primaryId });
            relationshipsToInsert.push({ person_id: childId, related_person_id: spouseId, relationship_type: "parent", created_by: primaryId });
          }

          await supabase.from("relationships").insert(relationshipsToInsert);
        } else {
          console.error("Error inserting child:", childError);
        }
      }
    }

    return { success: true, editToken: primaryRecord.edit_token };
  } catch (error) {
    console.error(error);
    return { success: false, error: (error as Error).message };
  }
}
