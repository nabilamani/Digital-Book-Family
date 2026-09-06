"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "generate-a-long-random-secret";
const ADMIN_COOKIE = "admin_session";

export async function verifyAdminSecret(secret: string): Promise<{ success: boolean }> {
  if (secret === ADMIN_SECRET) {
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE, "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });
    return { success: true };
  }
  return { success: false };
}

export async function checkAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE);
  return session?.value === "authenticated";
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

export async function fetchAdminStats() {
  const supabase: any = await createClient();

  const [persons, pending, families] = await Promise.all([
    supabase.from("persons").select("id", { count: "exact", head: true }),
    supabase.from("pending_persons").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("families").select("id", { count: "exact", head: true }),
  ]);

  return {
    totalPersons: persons.count ?? 0,
    totalPending: pending.count ?? 0,
    totalFamilies: families.count ?? 0,
  };
}

export async function fetchAdminFamilies() {
  try {
    const supabase: any = await createClient();

    const [personsResult, relationshipsResult] = await Promise.all([
      supabase.from("persons").select("*").order("created_at", { ascending: false }),
      supabase.from("relationships").select("*").eq("status", "active"),
    ]);

    const persons: any[] = personsResult.data ?? [];
    const relationships: any[] = relationshipsResult.data ?? [];
    const personMap = new Map(persons.map((p) => [p.id, p]));

    // Find Heads of Family (Male or anyone who isn't a child or wife in active relationships)
    const heads = persons.filter((p) => {
      const isChild = relationships.some(
        (r) => r.relationship_type === "child" && r.related_person_id === p.id
      );
      if (isChild) return false;

      const isWife = relationships.some((r) => {
        if (r.relationship_type === "spouse" && r.related_person_id === p.id) {
          const husband = personMap.get(r.person_id);
          return husband && (husband.gender === "L" || husband.gender === "Laki-laki");
        }
        return false;
      });
      if (isWife) return false;

      return true;
    });

    const families = heads.map((head) => {
      let wife = null;
      const isMale = head.gender === "L" || head.gender === "Laki-laki";

      if (isMale) {
        const spouseRel = relationships.find(
          (r) => r.person_id === head.id && r.relationship_type === "spouse"
        );
        if (spouseRel) {
          wife = personMap.get(spouseRel.related_person_id) || null;
        }
      }

      const childrenRels = relationships.filter(
        (r) => r.person_id === head.id && r.relationship_type === "child"
      );
      const children = childrenRels
        .map((r) => personMap.get(r.related_person_id))
        .filter(Boolean);

      return { head, wife, children };
    });

    return families;
  } catch (error: any) {
    console.error("Admin fetch families error:", error);
    return [];
  }
}

export async function createAdminFamily(data: any) {
  try {
    const supabase: any = await createClient();

    // 1. Insert Husband (Kepala Keluarga)
    const { data: husbandRecord, error: husbandError } = await supabase
      .from("persons")
      .insert({
        nik: data.husband.nik || null,
        full_name: data.husband.full_name,
        family_status: data.husband.family_status,
        gender: "Laki-laki",
        birth_place: data.husband.birth_place || null,
        birth_date: data.husband.birth_date || null,
        education: data.husband.education || null,
        occupation: data.husband.occupation || null,
        phone: data.husband.phone || null,
        email: data.husband.email || null,
        address: data.husband.address || null,
        life_status: data.husband.life_status || "alive",
        data_status: "verified",
      })
      .select("id")
      .single();

    if (husbandError || !husbandRecord) {
      return { success: false, error: husbandError?.message || "Gagal menyimpan Kepala Keluarga" };
    }

    const husbandId = husbandRecord.id;
    let wifeId: string | null = null;

    // 2. Insert Wife
    if (data.wife?.has_wife && data.wife?.full_name) {
      const { data: wifeRecord, error: wifeError } = await supabase
        .from("persons")
        .insert({
          nik: data.wife.nik || null,
          full_name: data.wife.full_name,
          family_status: data.wife.family_status || null,
          gender: "Perempuan",
          birth_place: data.wife.birth_place || null,
          birth_date: data.wife.birth_date || null,
          education: data.wife.education || null,
          occupation: data.wife.occupation || null,
          phone: data.wife.phone || null,
          email: data.wife.email || null,
          address: data.wife.address || null,
          parent_name: data.wife.parent_name || null,
          parent_address: data.wife.parent_address || null,
          life_status: data.wife.life_status || "alive",
          data_status: "verified",
        })
        .select("id")
        .single();

      if (!wifeError && wifeRecord) {
        wifeId = wifeRecord.id;
        await supabase.from("relationships").insert([
          { person_id: husbandId, related_person_id: wifeId, relationship_type: "spouse", created_by: husbandId },
          { person_id: wifeId, related_person_id: husbandId, relationship_type: "spouse", created_by: husbandId },
        ]);
      }
    }

    // 3. Insert Children
    if (data.children && data.children.length > 0) {
      for (const child of data.children) {
        if (!child.full_name) continue;
        const { data: childRecord, error: childError } = await supabase
          .from("persons")
          .insert({
            nik: child.nik || null,
            full_name: child.full_name,
            gender: child.gender === "L" ? "Laki-laki" : "Perempuan",
            birth_place: child.birth_place || null,
            birth_date: child.birth_date || null,
            education: child.education || null,
            life_status: child.life_status || "alive",
            data_status: "verified",
          })
          .select("id")
          .single();

        if (!childError && childRecord) {
          const childId = childRecord.id;
          const relsToInsert = [
            { person_id: husbandId, related_person_id: childId, relationship_type: "child", created_by: husbandId },
            { person_id: childId, related_person_id: husbandId, relationship_type: "parent", created_by: husbandId },
          ];

          if (wifeId) {
            relsToInsert.push(
              { person_id: wifeId, related_person_id: childId, relationship_type: "child", created_by: husbandId },
              { person_id: childId, related_person_id: wifeId, relationship_type: "parent", created_by: husbandId }
            );
          }

          await supabase.from("relationships").insert(relsToInsert);
        }
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("createAdminFamily error:", error);
    return { success: false, error: error.message || "Terjadi kesalahan server" };
  }
}

export async function updateAdminFamily(
  headId: string,
  data: any,
  existingWifeId?: string | null,
  existingChildIds: string[] = []
) {
  try {
    const supabase: any = await createClient();

    // 1. Update Husband
    const { error: husbandError } = await supabase
      .from("persons")
      .update({
        nik: data.husband.nik || null,
        full_name: data.husband.full_name,
        family_status: data.husband.family_status,
        birth_place: data.husband.birth_place || null,
        birth_date: data.husband.birth_date || null,
        education: data.husband.education || null,
        occupation: data.husband.occupation || null,
        phone: data.husband.phone || null,
        email: data.husband.email || null,
        address: data.husband.address || null,
        life_status: data.husband.life_status || "alive",
        updated_at: new Date().toISOString(),
      })
      .eq("id", headId);

    if (husbandError) {
      return { success: false, error: husbandError.message };
    }

    let wifeId = existingWifeId || null;

    // 2. Handle Wife
    if (data.wife?.has_wife && data.wife?.full_name) {
      if (wifeId) {
        // Update Wife
        await supabase
          .from("persons")
          .update({
            nik: data.wife.nik || null,
            full_name: data.wife.full_name,
            family_status: data.wife.family_status || null,
            birth_place: data.wife.birth_place || null,
            birth_date: data.wife.birth_date || null,
            education: data.wife.education || null,
            occupation: data.wife.occupation || null,
            phone: data.wife.phone || null,
            email: data.wife.email || null,
            address: data.wife.address || null,
            parent_name: data.wife.parent_name || null,
            parent_address: data.wife.parent_address || null,
            life_status: data.wife.life_status || "alive",
            updated_at: new Date().toISOString(),
          })
          .eq("id", wifeId);
      } else {
        // Insert Wife
        const { data: wifeRecord } = await supabase
          .from("persons")
          .insert({
            nik: data.wife.nik || null,
            full_name: data.wife.full_name,
            family_status: data.wife.family_status || null,
            gender: "Perempuan",
            birth_place: data.wife.birth_place || null,
            birth_date: data.wife.birth_date || null,
            education: data.wife.education || null,
            occupation: data.wife.occupation || null,
            phone: data.wife.phone || null,
            email: data.wife.email || null,
            address: data.wife.address || null,
            parent_name: data.wife.parent_name || null,
            parent_address: data.wife.parent_address || null,
            life_status: data.wife.life_status || "alive",
            data_status: "verified",
          })
          .select("id")
          .single();

        if (wifeRecord) {
          wifeId = wifeRecord.id;
          await supabase.from("relationships").insert([
            { person_id: headId, related_person_id: wifeId, relationship_type: "spouse", created_by: headId },
            { person_id: wifeId, related_person_id: headId, relationship_type: "spouse", created_by: headId },
          ]);
        }
      }
    } else if (wifeId) {
      // Wife removed
      await supabase.from("relationships").delete().or(`person_id.eq.${wifeId},related_person_id.eq.${wifeId}`);
      await supabase.from("persons").delete().eq("id", wifeId);
      wifeId = null;
    }

    // 3. Handle Children
    // For simplicity, delete old child relationships and children persons, then re-insert
    if (existingChildIds.length > 0) {
      for (const childId of existingChildIds) {
        await supabase.from("relationships").delete().or(`person_id.eq.${childId},related_person_id.eq.${childId}`);
        await supabase.from("persons").delete().eq("id", childId);
      }
    }

    if (data.children && data.children.length > 0) {
      for (const child of data.children) {
        if (!child.full_name) continue;
        const { data: childRecord } = await supabase
          .from("persons")
          .insert({
            nik: child.nik || null,
            full_name: child.full_name,
            gender: child.gender === "L" ? "Laki-laki" : "Perempuan",
            birth_place: child.birth_place || null,
            birth_date: child.birth_date || null,
            education: child.education || null,
            life_status: child.life_status || "alive",
            data_status: "verified",
          })
          .select("id")
          .single();

        if (childRecord) {
          const childId = childRecord.id;
          const relsToInsert = [
            { person_id: headId, related_person_id: childId, relationship_type: "child", created_by: headId },
            { person_id: childId, related_person_id: headId, relationship_type: "parent", created_by: headId },
          ];

          if (wifeId) {
            relsToInsert.push(
              { person_id: wifeId, related_person_id: childId, relationship_type: "child", created_by: headId },
              { person_id: childId, related_person_id: wifeId, relationship_type: "parent", created_by: headId }
            );
          }

          await supabase.from("relationships").insert(relsToInsert);
        }
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("updateAdminFamily error:", error);
    return { success: false, error: error.message || "Gagal memperbarui data keluarga" };
  }
}

export async function deleteAdminFamily(headId: string, wifeId?: string | null, childIds: string[] = []) {
  try {
    const supabase: any = await createClient();
    const allIds = [headId, wifeId, ...childIds].filter(Boolean) as string[];

    for (const id of allIds) {
      await supabase.from("relationships").delete().or(`person_id.eq.${id},related_person_id.eq.${id}`);
      await supabase.from("persons").delete().eq("id", id);
    }

    return { success: true };
  } catch (error: any) {
    console.error("deleteAdminFamily error:", error);
    return { success: false, error: error.message || "Gagal menghapus data keluarga" };
  }
}

export async function fetchAdminPendingPersons() {
  const supabase: any = await createClient();
  const { data, error } = await supabase
    .from("pending_persons")
    .select("*, creator:persons!pending_persons_created_by_person_id_fkey(id, full_name)")
    .order("created_at", { ascending: false });

  if (error) console.error("Admin fetch pending persons error:", error);
  return data ?? [];
}

export async function approvePendingPerson(id: string) {
  const supabase: any = await createClient();
  const { error } = await supabase
    .from("pending_persons")
    .update({ status: "linked", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function rejectPendingPerson(id: string) {
  const supabase: any = await createClient();
  const { error } = await supabase
    .from("pending_persons")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}


