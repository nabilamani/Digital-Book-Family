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
    <div className="w-full px-6 md:px-12 xl:px-[128px] py-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Data Keluarga</h1>
            <p className="text-muted-foreground text-base mt-1">
              Daftar Kepala Keluarga dan detail anggota keluarganya.
            </p>
          </div>
        </div>
        <Link href="/form">
          <Button className="bg-primary text-black hover:bg-primary/85 rounded-full px-6 py-2">
            Tambah Data
          </Button>
        </Link>
      </div>

      <div className="rounded-md border border-border bg-card overflow-x-auto">
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
