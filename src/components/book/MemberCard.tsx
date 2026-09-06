import Link from "next/link";
import { User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MemberCardProps {
  id: string;
  fullName: string;
  nickname: string | null;
  gender: string | null;
  birthDate: string | null;
  occupation: string | null;
  city: string | null;
  photoPath: string | null;
  lifeStatus: string;
}

export function MemberCard({
  id,
  fullName,
  nickname,
  gender,
  birthDate,
  occupation,
  city,
  photoPath,
  lifeStatus,
}: MemberCardProps) {
  const isDeceased = lifeStatus === "deceased";
  const isMale = gender === "Laki-laki";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const photoUrl = photoPath
    ? `${supabaseUrl}/storage/v1/object/public/photos/${photoPath}`
    : null;

  return (
    <Link href={`/member/${id}`}>
      <Card className="group bg-card border-border hover:border-primary/50 transition-all duration-300 overflow-hidden h-full">
        <CardContent className="p-0">
          {/* Photo Area */}
          <div className="relative w-full aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={fullName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isMale
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-pink-500/20 text-pink-400"
                }`}
              >
                <User className="w-8 h-8" />
              </div>
            )}
            {isDeceased && (
              <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                Almarhum/ah
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4">
            <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors truncate">
              {fullName}
            </h3>
            {nickname && (
              <p className="text-sm text-muted-foreground">&quot;{nickname}&quot;</p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
              {birthDate && <span>{new Date(birthDate).getFullYear()}</span>}
              {occupation && (
                <>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                  <span className="truncate">{occupation}</span>
                </>
              )}
              {city && (
                <>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                  <span className="truncate">{city}</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
