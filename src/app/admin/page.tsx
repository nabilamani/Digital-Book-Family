import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { checkAdminSession } from "@/actions/admin-actions";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const isAdmin = await checkAdminSession();
  if (isAdmin) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="w-full min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-184px)] flex items-center justify-center px-4 py-6 md:px-6 md:py-12">
      <AdminLoginForm />
    </div>
  );
}
