import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { checkAdminSession } from "@/actions/admin-actions";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const isAdmin = await checkAdminSession();
  if (isAdmin) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="w-full min-h-[calc(100vh-184px)] flex items-center justify-center px-6 py-12">
      <AdminLoginForm />
    </div>
  );
}
