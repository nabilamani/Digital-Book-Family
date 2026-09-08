import { fetchPersonById } from "@/actions/family-actions";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, MapPin, Briefcase, GraduationCap, Phone, Mail, Calendar, Heart, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface MemberPageProps {
  params: Promise<{ id: string }>;
}

export default async function MemberPage({ params }: MemberPageProps) {
  const { id } = await params;
  const { person: rawPerson, relationships: rawRels, pendingPersons: rawPending, error } = await fetchPersonById(id);

  const person: any = rawPerson;
  const relationships: any[] = rawRels || [];
  const pendingPersons: any[] = rawPending || [];

  if (!person || error) {
    notFound();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const photoUrl = person.photo_path
    ? `${supabaseUrl}/storage/v1/object/public/photos/${person.photo_path}`
    : null;

  const isDeceased = person.life_status === "deceased";
  const isMale = person.gender === "Laki-laki";

  return (
    <div className="w-full px-4 py-6 md:px-12 md:py-12 xl:px-[128px]">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-8 mb-6 md:mb-10 text-center sm:text-left">
          {/* Photo */}
          <div className="w-28 h-28 md:w-40 md:h-40 rounded-xl overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center border-2 border-border">
            {photoUrl ? (
              <img src={photoUrl} alt={person.full_name} className="w-full h-full object-cover" />
            ) : (
              <div
                className={`w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center ${
                  isMale ? "bg-blue-500/20 text-blue-400" : "bg-pink-500/20 text-pink-400"
                }`}
              >
                <User className="w-8 h-8 md:w-10 md:h-10" />
              </div>
            )}
          </div>

          {/* Name & Quick Info */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-4xl font-bold text-foreground">{person.full_name}</h1>
            {person.nickname && (
              <p className="text-sm md:text-lg text-muted-foreground mt-0.5 md:mt-1">&quot;{person.nickname}&quot;</p>
            )}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 md:gap-3 mt-3 md:mt-4">
              {person.gender && (
                <span className={`inline-flex items-center gap-1 text-xs md:text-sm px-2.5 py-0.5 md:px-3 md:py-1 rounded-full ${
                  isMale ? "bg-blue-500/10 text-blue-400" : "bg-pink-500/10 text-pink-400"
                }`}>
                  {person.gender}
                </span>
              )}
              {isDeceased && (
                <span className="inline-flex items-center gap-1 text-xs md:text-sm px-2.5 py-0.5 md:px-3 md:py-1 rounded-full bg-muted text-muted-foreground">
                  Almarhum/ah
                </span>
              )}
              {person.data_status && (
                <span className={`inline-flex items-center text-xs md:text-sm px-2.5 py-0.5 md:px-3 md:py-1 rounded-full ${
                  person.data_status === "verified" ? "bg-primary/10 text-primary" :
                  person.data_status === "submitted" ? "bg-yellow-500/10 text-yellow-400" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {person.data_status}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Personal Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Informasi Pribadi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {person.birth_place && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground text-xs">Tempat Lahir</p>
                    <p className="text-foreground">{person.birth_place}</p>
                  </div>
                </div>
              )}
              {person.birth_date && (
                <div className="flex items-start gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground text-xs">Tanggal Lahir</p>
                    <p className="text-foreground">{new Date(person.birth_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                </div>
              )}
              {person.death_date && (
                <div className="flex items-start gap-3 text-sm">
                  <Heart className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground text-xs">Tanggal Meninggal</p>
                    <p className="text-foreground">{new Date(person.death_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                </div>
              )}
              {person.education && (
                <div className="flex items-start gap-3 text-sm">
                  <GraduationCap className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground text-xs">Pendidikan</p>
                    <p className="text-foreground">{person.education}</p>
                  </div>
                </div>
              )}
              {person.occupation && (
                <div className="flex items-start gap-3 text-sm">
                  <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground text-xs">Pekerjaan</p>
                    <p className="text-foreground">{person.occupation}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" /> Kontak & Alamat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {person.phone && (
                <div className="flex items-start gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground text-xs">Telepon</p>
                    <p className="text-foreground">{person.phone}</p>
                  </div>
                </div>
              )}
              {person.email && (
                <div className="flex items-start gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground text-xs">Email</p>
                    <p className="text-foreground">{person.email}</p>
                  </div>
                </div>
              )}
              {person.address && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground text-xs">Alamat</p>
                    <p className="text-foreground">{person.address}</p>
                    {(person.city || person.province) && (
                      <p className="text-muted-foreground">{[person.city, person.province].filter(Boolean).join(", ")}</p>
                    )}
                  </div>
                </div>
              )}
              {!person.phone && !person.email && !person.address && (
                <p className="text-sm text-muted-foreground italic">Belum ada informasi kontak.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Relationships */}
        <Card className="bg-card border-border mb-10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Relasi Keluarga
            </CardTitle>
          </CardHeader>
          <CardContent>
            {relationships.length === 0 && pendingPersons.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Belum ada relasi keluarga tercatat.</p>
            ) : (
              <div className="space-y-3">
                {relationships.map((rel) => (
                  <div key={rel.id} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {(rel as Record<string, unknown>).related_person ? ((rel as Record<string, unknown>).related_person as Record<string, string>).full_name : "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">{rel.relationship_type}</p>
                      </div>
                    </div>
                    <Link href={`/member/${rel.related_person_id}`}>
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-xs">
                        Lihat Profil
                      </Button>
                    </Link>
                  </div>
                ))}
                {pendingPersons.map((pp) => (
                  <div key={pp.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/5 border border-secondary/20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{pp.name}</p>
                        <p className="text-xs text-secondary capitalize">{pp.relationship_type} · Pending</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/book">
            <Button variant="outline" className="border-border text-muted-foreground hover:text-foreground">
              ← Kembali ke Daftar Anggota
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
