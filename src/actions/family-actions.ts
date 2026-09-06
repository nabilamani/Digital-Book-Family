"use server";

import { createClient } from "@/lib/supabase/server";

export async function fetchPersonsAndRelationships() {
  try {
    const supabase = await createClient();

    const [personsResult, relationshipsResult, pendingResult] = await Promise.all([
      supabase.from("persons").select("*").order("created_at", { ascending: true }),
      supabase.from("relationships").select("*").eq("status", "active"),
      supabase.from("pending_persons").select("*").eq("status", "pending"),
    ]);

    return {
      persons: personsResult.data ?? [],
      relationships: relationshipsResult.data ?? [],
      pendingPersons: pendingResult.data ?? [],
    };
  } catch (error: any) {
    console.error("Exception in fetchPersonsAndRelationships:", error.message || error);
    return { persons: [], relationships: [], pendingPersons: [] };
  }
}

const MOCK_PERSONS: any[] = [];

export async function fetchAllPersons() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("persons")
      .select("*")
      .order("full_name", { ascending: true });

    if (error) {
      console.warn("Supabase fetch notice:", error.message || error);
      return MOCK_PERSONS;
    }
    return data && data.length > 0 ? data : MOCK_PERSONS;
  } catch (err: any) {
    console.warn("Using fallback family data (Supabase connection offline/unreachable).");
    return MOCK_PERSONS;
  }
}

export async function fetchPersonById(id: string) {
  try {
    const supabase = await createClient();

    const [personResult, relsResult, pendingResult] = await Promise.all([
      supabase.from("persons").select("*").eq("id", id).single(),
      supabase.from("relationships").select("*, related_person:persons!relationships_related_person_id_fkey(id, full_name, photo_path, gender)").eq("person_id", id).eq("status", "active"),
      supabase.from("pending_persons").select("*").eq("created_by_person_id", id),
    ]);

    return {
      person: personResult.data,
      relationships: relsResult.data ?? [],
      pendingPersons: pendingResult.data ?? [],
      error: personResult.error?.message,
    };
  } catch (error: any) {
    console.error("Exception in fetchPersonById:", error.message || error);
    return { person: null, relationships: [], pendingPersons: [], error: error.message };
  }
}

export async function fetchPersonByEditToken(token: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("persons")
      .select("*")
      .eq("edit_token", token)
      .single();

    if (error) return { person: null, error: error.message };
    return { person: data, error: null };
  } catch (error: any) {
    console.error("Exception in fetchPersonByEditToken:", error.message || error);
    return { person: null, error: error.message };
  }
}
