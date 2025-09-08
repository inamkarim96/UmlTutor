"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <h2 className="text-lg font-semibold">Loading...</h2>
            <p className="text-sm text-text-secondary">Verifying your session</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
