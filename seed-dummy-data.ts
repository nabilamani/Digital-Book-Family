import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load environment variables manually from .env.local
const envPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

async function run() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Menghapus data lama...");
  // Clear existing relationships and pending persons first to avoid foreign key issues
  await supabase.from("relationships").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("pending_persons").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("persons").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  
  console.log("Data lama berhasil dihapus.");
  console.log("Membuat data dummy baru...");

  // Helper to insert person
  async function insertPerson(data: any) {
    const { data: inserted, error } = await supabase
      .from("persons")
      .insert({ ...data, data_status: "verified" })
      .select("id")
      .single();
    
    if (error) {
      console.error("Error inserting person:", data.full_name, error.message);
      throw error;
    }
    return inserted.id;
  }

  // Helper to insert relationship
  async function insertRel(personId: string, relatedPersonId: string, type: string) {
    const { error } = await supabase.from("relationships").insert({
      person_id: personId,
      related_person_id: relatedPersonId,
      relationship_type: type,
      status: "active"
    });
    if (error) {
      console.error("Error inserting relationship:", error.message);
    }
  }

  try {
    // 1. Kakek & Nenek (Generasi 1)
    const idSaeno = await insertPerson({
      full_name: "Saeno",
      gender: "Laki-laki",
      life_status: "deceased",
      nik: "111111"
    });
    const idWati = await insertPerson({
      full_name: "Wati",
      gender: "Perempuan",
      life_status: "deceased",
      nik: "111112"
    });
    await insertRel(idSaeno, idWati, "spouse");

    // 2. Ayah & Ibu (Generasi 2)
    const idSuyadi = await insertPerson({
      full_name: "Suyadi",
      gender: "Laki-laki",
      life_status: "deceased",
      nik: "222221"
    });
    const idMugini = await insertPerson({
      full_name: "Mugini",
      gender: "Perempuan",
      life_status: "deceased",
      nik: "222222"
    });
    await insertRel(idSuyadi, idMugini, "spouse");
    
    // Suyadi adalah anak dari Saeno & Wati
    await insertRel(idSaeno, idSuyadi, "child");
    await insertRel(idWati, idSuyadi, "child");

    // 3. Anak-anak (Generasi 3)
    const idAndriyanto = await insertPerson({
      full_name: "Andriyanto",
      gender: "Laki-laki",
      life_status: "alive",
      nik: "333331"
    });
    const idFitria = await insertPerson({
      full_name: "Fitria Handayani",
      gender: "Perempuan",
      life_status: "alive",
      nik: "333332"
    });
    const idAri = await insertPerson({
      full_name: "Ari Kusnanto",
      gender: "Laki-laki",
      life_status: "alive",
      nik: "333333"
    });
    const idTriUmi = await insertPerson({
      full_name: "Tri Umi Saadah",
      gender: "Perempuan",
      life_status: "alive",
      nik: "333334"
    });
    const idAris = await insertPerson({
      full_name: "Aris Susanto",
      gender: "Laki-laki",
      life_status: "alive",
      nik: "333335"
    });

    // Set parents for Gen 3
    const gen3Ids = [idAndriyanto, idFitria, idAri, idTriUmi, idAris];
    for (const childId of gen3Ids) {
      await insertRel(idSuyadi, childId, "child");
      await insertRel(idMugini, childId, "child");
    }

    // 4. Cucu-cucu (Generasi 4)
    const idIyan = await insertPerson({
      full_name: "Iyan",
      gender: "Laki-laki",
      life_status: "alive",
      nik: "444441"
    });
    // Iyan adalah anak dari Ari Kusnanto
    await insertRel(idAri, idIyan, "child");

    const idUwais = await insertPerson({
      full_name: "M Uwais Al Fatih",
      gender: "Laki-laki",
      life_status: "alive",
      nik: "444442"
    });
    // Uwais adalah anak dari Aris Susanto
    await insertRel(idAris, idUwais, "child");

    console.log("Data dummy berhasil di-seed!");

  } catch (err) {
    console.error("Proses seeding gagal:", err);
  }
}

run();
