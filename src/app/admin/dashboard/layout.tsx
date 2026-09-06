import { checkAdminSession, logoutAdmin } from "@/actions/admin-actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Clock, LogOut, Home } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    redirect("/admin");
  }

  return (
    <div className="flex w-full min-h-[calc(100vh-92px)]">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-6 hidden md:flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground mb-6">Admin Panel</h2>
          <nav className="space-y-1">
            <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link href="/admin/dashboard/families" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Users className="w-4 h-4" /> Keluarga
            </Link>
            <Link href="/admin/dashboard/pending" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Clock className="w-4 h-4" /> Pending
            </Link>
          </nav>
        </div>

        <div className="space-y-2">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground text-sm">
              <Home className="w-4 h-4 mr-2" /> Kembali ke Situs
            </Button>
          </Link>
          <form action={async () => {
            "use server";
            await logoutAdmin();
            redirect("/admin");
          }}>
            <Button type="submit" variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 text-sm">
              <LogOut className="w-4 h-4 mr-2" /> Keluar
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
