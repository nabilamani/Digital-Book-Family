import { fetchPersonsAndRelationships } from "@/actions/family-actions";
import { Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FamilyTableRow } from "./FamilyTableRow";

export default async function FamilyListPage() {
  const { persons: rawPersons, relationships: rawRels } = await fetchPersonsAndRelationships();
  const persons: any[] = rawPersons || [];
  const relationships: any[] = rawRels || [];

  // Create a mapping of all persons by ID
  const personMap = new Map(persons.map((p: any) => [p.id, p]));

  // Find Heads of Family
  const heads = persons.filter((p: any) => {
    const isChild = relationships.some(
      (r: any) => r.relationship_type === "child" && r.related_person_id === p.id
    );
    if (isChild) return false;

    const isWife = relationships.some((r: any) => {
      if (r.relationship_type === "spouse" && r.related_person_id === p.id) {
        const husband = personMap.get(r.person_id) as any;
        return husband && (husband.gender === "L" || husband.gender === "Laki-laki");
      }
      return false;
    });
    if (isWife) return false;

    return true;
  });

  // Build family objects
  const families = heads.map((head: any) => {
    let wife = null;
    const isMale = head.gender === "L" || head.gender === "Laki-laki";
    
    if (isMale) {
      const spouseRel = relationships.find(
        (r: any) => r.person_id === head.id && r.relationship_type === "spouse"
      );
      if (spouseRel) {
        wife = personMap.get(spouseRel.related_person_id) || null;
      }
    }

    const childrenRels = relationships.filter(
      (r: any) => r.person_id === head.id && r.relationship_type === "child"
    );
    const children = childrenRels
      .map((r: any) => personMap.get(r.related_person_id))
      .filter(Boolean);

    return { head, wife, children };
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
              Daftar Kepala Keluarga dan detail anggota keluarganya.
            </p>
          </div>
        </div>
        <Link href="/form" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-primary text-black hover:bg-primary/85 rounded-full px-6 py-2">
            Tambah Data
          </Button>
        </Link>
      </div>

      {/* Mobile Card List (< md) */}
      <div className="block md:hidden space-y-3">
        {families.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground bg-card rounded-lg border border-border text-sm">
            Belum ada data anggota keluarga.
          </div>
        ) : (
          families.map((family) => (
            <FamilyTableRow key={family.head.id} family={family} isMobileCard />
          ))
        )}
      </div>

      {/* Desktop Table (md+) */}
      <div className="hidden md:block rounded-md border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Nama Kepala Keluarga</th>
              <th className="px-6 py-4 font-medium">Status Keluarga</th>
              <th className="px-6 py-4 font-medium">Nama Istri</th>
              <th className="px-6 py-4 font-medium">Alamat</th>
              <th className="px-6 py-4 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {families.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  Belum ada data anggota keluarga.
                </td>
              </tr>
            ) : (
              families.map((family) => (
                <FamilyTableRow key={family.head.id} family={family} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
