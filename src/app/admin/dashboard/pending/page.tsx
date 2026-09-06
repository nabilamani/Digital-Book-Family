import { fetchAdminPendingPersons } from "@/actions/admin-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, User } from "lucide-react";

export default async function AdminPendingPage() {
  const rawPending = await fetchAdminPendingPersons();
  const pendingPersons: any[] = rawPending || [];

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Pending Persons</h1>
      <p className="text-muted-foreground mb-8">
        Daftar anggota keluarga yang disebut oleh orang lain tetapi belum mendaftar sendiri.
      </p>

      {pendingPersons.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Tidak ada pending person saat ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingPersons.map((pp) => (
            <Card key={pp.id} className="bg-card border-secondary/20 hover:border-secondary/50 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{pp.name}</p>
                    <p className="text-xs text-secondary capitalize">{pp.relationship_type}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  {pp.gender && <p>Gender: {pp.gender}</p>}
                  <p>
                    Dicatat oleh:{" "}
                    <span className="text-foreground">
                      {(pp as Record<string, unknown>).creator
                        ? ((pp as Record<string, unknown>).creator as Record<string, string>).full_name
                        : "Tidak diketahui"}
                    </span>
                  </p>
                  <p>Tanggal: {new Date(pp.created_at).toLocaleDateString("id-ID")}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
