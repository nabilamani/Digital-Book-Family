"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyAdminSecret } from "@/actions/admin-actions";
import { toast } from "sonner";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await verifyAdminSecret(secret);

    if (result.success) {
      toast.success("Berhasil masuk sebagai Admin.");
      router.push("/admin/dashboard");
    } else {
      toast.error("Secret salah. Akses ditolak.");
    }

    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-card border-border shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
        <CardDescription>Masukkan Admin Secret untuk mengakses dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-secret">Admin Secret</Label>
            <Input
              id="admin-secret"
              type="password"
              placeholder="Masukkan secret..."
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || !secret}
            className="w-full bg-primary text-black hover:bg-primary/85 font-semibold"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memverifikasi...</>
            ) : (
              "Masuk"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
