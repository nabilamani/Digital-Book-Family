import { fetchPersonsAndRelationships } from "@/actions/family-actions";
import { Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FamilyListClient } from "./FamilyListClient";

export default async function FamilyListPage() {
  const { persons: rawPersons, relationships: rawRels } = await fetchPersonsAndRelationships();
  const persons: any[] = rawPersons || [];
  const relationships: any[] = rawRels || [];

  // Create a mapping of all persons by ID
  const personMap = new Map(persons.map((p: any) => [p.id, p]));

  // Find Heads of Family (Anggota Utama yang mewakili keluarga besar)
  const heads = persons.filter((p: any) => {
    const isChild = relationships.some(
      (r: any) => r.relationship_type === "child" && r.related_person_id === p.id
    );
    if (isChild) return false;

    // Check if person is secondary spouse (pasangan yang bukan anggota utama keluarga besar)
    const spouseRels = relationships.filter(
      (r: any) => r.relationship_type === "spouse" && r.person_id === p.id
    );

    for (const rel of spouseRels) {
      const spouse = personMap.get(rel.related_person_id) as any;
      if (!spouse) continue;

      const pStatus = (p.family_status || "").toLowerCase();
      const sStatus = (spouse.family_status || "").toLowerCase();

      // If p is marked as Menantu while spouse is direct descendant, p is secondary
      if (pStatus.includes("menantu") && !sStatus.includes("menantu")) return false;
      if (sStatus.includes("menantu") && !pStatus.includes("menantu")) return true;

      // Check created_by in relationship
      if (rel.created_by) {
        if (rel.created_by === spouse.id && rel.created_by !== p.id) {
          return false;
        }
        if (rel.created_by === p.id) {
          return true;
        }
      }

      // Default fallback: female married to male (unless status indicates otherwise)
      const isPFemale = p.gender === "Perempuan" || p.gender === "P";
      const isSMale = spouse.gender === "Laki-laki" || spouse.gender === "L";
      if (isPFemale && isSMale) {
        return false;
      }
    }

    return true;
  });

  // Build family objects
  const families = heads.map((head: any) => {
    const spouseRel = relationships.find(
      (r: any) => r.person_id === head.id && r.relationship_type === "spouse"
    );
    const spouse = spouseRel ? personMap.get(spouseRel.related_person_id) || null : null;

    const childrenRels = relationships.filter(
      (r: any) => r.person_id === head.id && r.relationship_type === "child"
    );
    const children = childrenRels
      .map((r: any) => personMap.get(r.related_person_id))
      .filter(Boolean);

    return { head, spouse, wife: spouse, children };
  });

  return (
    <div className="w-full px-4 py-6 md:px-12 md:py-12 xl:px-[128px]">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-foreground">Data Keluarga</h1>
            <p className="text-muted-foreground text-xs md:text-base mt-0.5 md:mt-1">
              Daftar Kepala Keluarga, status pencatatan buku kertas, dan detail anggota keluarga.
            </p>
          </div>
        </div>
        <Link href="/form" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-primary text-black hover:bg-primary/85 rounded-full px-6 py-2">
            Tambah Data
          </Button>
        </Link>
      </div>

      {/* Interactive Family List Table with Filter, Search, Checklist & Pagination */}
      <FamilyListClient initialFamilies={families} />
    </div>
  );
}

