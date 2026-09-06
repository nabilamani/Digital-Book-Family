import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

async function resetDb() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Menghapus semua data lama...");
  // Clear existing relationships and pending persons first to avoid foreign key issues
  await supabase.from("relationships").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("pending_persons").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("persons").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  
  console.log("Semua data berhasil dibersihkan! Aplikasi sekarang kosong.");
}

resetDb().catch(console.error);
