import { fetchAdminStats } from "@/actions/admin-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Home } from "lucide-react";

export default async function AdminDashboardPage() {
  const stats = await fetchAdminStats();

  const statCards = [
    {
      title: "Total Anggota",
      value: stats.totalPersons,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Pending Person",
      value: stats.totalPending,
      icon: Clock,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      title: "Keluarga Terdaftar",
      value: stats.totalFamilies,
      icon: Home,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">Ringkasan data keluarga besar.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
