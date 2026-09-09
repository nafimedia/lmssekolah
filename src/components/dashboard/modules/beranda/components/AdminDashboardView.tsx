import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Building2, BookOpen, UserCheck, MonitorCheck, ArrowRight, ShieldCheck, Database } from "lucide-react";

interface AdminDashboardViewProps {
  userName: string;
  role: string;
  stats: any;
  currentDayName: string;
  formattedTime: string;
  setActiveTab?: (key: string) => void;
}

export function AdminDashboardView({ userName, role, stats, currentDayName, formattedTime, setActiveTab }: AdminDashboardViewProps) {
  return (
    <div className="space-y-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /> Dashboard Eksekutif & Statistik Madrasah
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Selamat Datang, {userName} ({role.toUpperCase()}) · {currentDayName}, {formattedTime}
          </p>
        </div>

        <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-semibold text-xs px-2.5 py-1 self-start sm:self-auto shadow-2xs">
          ⚡ Sistem Terintegrasi
        </Badge>
      </div>

      {/* Compact Metric Strip (~42px high) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-muted/30 border border-border/80 rounded-xl p-2 text-xs">
        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Total Pengguna</p>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{stats.totalUsers} Akun</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Total Siswa Aktif</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5">{stats.siswaCount} Siswa</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-purple-500/15 text-purple-600 flex items-center justify-center shrink-0">
            <Building2 className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Guru & Staf GTK</p>
            <p className="text-sm font-bold text-purple-600 dark:text-purple-400 leading-tight mt-0.5">{stats.guruStafCount} Orang</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
            <MonitorCheck className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Ujian CBT Aktif</p>
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400 leading-tight mt-0.5">{stats.cbtExamsCount} Sesi</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" /> Pintasan Layanan & Data Madrasah
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center text-xs font-medium gap-1" onClick={() => setActiveTab?.("siakad")}>
              <Database className="h-4 w-4 text-blue-600" /> Data Akademik
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center text-xs font-medium gap-1" onClick={() => setActiveTab?.("users")}>
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Kelola Akun
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center text-xs font-medium gap-1" onClick={() => setActiveTab?.("sdm_gtk")}>
              <Users className="h-4 w-4 text-purple-600" /> Guru & Staf GTK
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-emerald-600" /> Supervisi & Pemeliharaan Sistem
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center text-xs font-medium gap-1 border-rose-500/20 text-rose-600 hover:bg-rose-500/10" onClick={() => setActiveTab?.("monitoring_kbm_live")}>
              <span className="flex items-center gap-1">🔴 Pantau KBM</span>
              <span className="text-[10px] text-muted-foreground font-normal">Supervisi Pembelajaran</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center text-xs font-medium gap-1 border-primary/20 text-primary hover:bg-primary/10" onClick={() => setActiveTab?.("pengaturan")}>
              <span className="flex items-center gap-1">💾 Cadangan Data</span>
              <span className="text-[10px] text-muted-foreground font-normal">Pemeliharaan Sistem</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
