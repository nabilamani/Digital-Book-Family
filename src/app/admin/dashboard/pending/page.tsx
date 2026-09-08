import { fetchAdminPendingPersons } from "@/actions/admin-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, User } from "lucide-react";

export default async function AdminPendingPage() {
  const rawPending = await fetchAdminPendingPersons();
  const pendingPersons: any[] = rawPending || [];

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Pending Persons</h1>
      <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-8">
        Daftar anggota keluarga yang disebut oleh orang lain tetapi belum mendaftar sendiri.
      </p>

      {pendingPersons.length === 0 ? (
        <div className="text-center py-10 md:py-16">
          <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-muted rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
          </div>
          <p className="text-sm md:text-base text-muted-foreground">Tidak ada pending person saat ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {pendingPersons.map((pp) => (
            <Card key={pp.id} className="bg-card border-secondary/20 hover:border-secondary/50 transition-colors">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm md:text-base">{pp.name}</p>
                    <p className="text-xs text-secondary capitalize">{pp.relationship_type}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  {pp.gender && <p>Gender: {pp.gender}</p>}
                  <p>
                    Dicatat oleh:{" "}
                    <span className="text-foreground font-medium">
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
