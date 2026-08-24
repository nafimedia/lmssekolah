import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Sparkles, Inbox } from "lucide-react";
import { UserAchievementRow } from "@/services/mysqlDataService";

interface AchievementsCardProps {
  dbAchievements: UserAchievementRow[];
}

export function AchievementsCard({ dbAchievements }: AchievementsCardProps) {
  return (
    <Card className="border-border shadow-sm bg-card">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" /> Portofolio Lencana & Prestasi Akademik
        </CardTitle>
        <CardDescription className="text-xs">
          Daftar penghargaan resmi, kejuaraan, dan lencana prestasi yang tercatat pada database MTsN 2 Cilacap.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {dbAchievements.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-1.5">
            <Inbox className="h-6 w-6 text-muted-foreground/40 mx-auto" />
            <div className="font-semibold text-foreground">Belum Ada Lencana & Prestasi Terdaftar</div>
            <p className="text-[11px]">Database belum mencatat portofolio prestasi atau lencana penghargaan resmi. Tampilan dikosongkan secara jujur.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dbAchievements.map((ach) => (
              <div key={ach.id} className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2 hover:bg-emerald-500/10 transition">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🌟</span>
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                    {ach.category || "Prestasi DB"}
                  </Badge>
                </div>
                <div className="font-bold text-xs text-foreground leading-snug">{ach.title}</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{ach.issuer || "Tercatat resmi di database MySQL"}</p>
              </div>
            ))}
          </div>
        )}

        <div className="p-3 bg-muted/30 rounded-xl border border-border flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 font-semibold">
            <Sparkles className="h-4 w-4 text-amber-500" /> Portofolio terverifikasi resmi oleh Sistem Informasi MTsN 2 Cilacap.
          </span>
          <Badge className="bg-amber-500 text-slate-950 font-bold text-[10px]">✔ E-Portofolio Verifikasi</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
