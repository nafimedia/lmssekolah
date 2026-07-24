import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import logoAsset from "@/assets/logo-mtsn2.png.asset.json";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      let isAdmin = data.user.email?.toLowerCase() === "admin@mail.com";
      if (!isAdmin) {
        const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
        isAdmin = !!roles?.some((r) => r.role === "admin");
      }
      throw redirect({ to: (isAdmin ? "/admin" : "/dashboard") as any });
    }
  },
  head: () => ({
    meta: [
      { title: "LMS MTsN 2 Cilacap — Portal Pembelajaran" },
      { name: "description", content: "Portal Learning Management System resmi MTs Negeri 2 Cilacap." },
      { property: "og:title", content: "LMS MTsN 2 Cilacap" },
      { property: "og:description", content: "Portal pembelajaran digital MTsN 2 Cilacap." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <img src={logoAsset.url} alt="Logo MTsN 2 Cilacap" className="h-24 w-24 mx-auto rounded-full bg-white/95 p-2 shadow" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">LMS MTsN 2 Cilacap</h1>
          <p className="mt-2 text-muted-foreground">Portal pembelajaran digital untuk siswa, guru, dan monitoring.</p>
        </div>
        <Button asChild size="lg" className="w-full">
          <Link to="/auth">Masuk / Daftar</Link>
        </Button>
      </div>
    </main>
  );
}