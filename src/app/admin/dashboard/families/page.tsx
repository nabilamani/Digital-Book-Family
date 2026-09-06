import { fetchAdminFamilies } from "@/actions/admin-actions";
import { FamiliesTable } from "@/components/admin/FamiliesTable";

export default async function AdminFamiliesPage() {
  const families = await fetchAdminFamilies();

  return (
    <div>

      <FamiliesTable families={families} />
    </div>
  );
}
