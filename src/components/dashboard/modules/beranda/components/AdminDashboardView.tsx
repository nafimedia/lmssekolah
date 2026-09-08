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
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" /> Dashboard Eksekutif & Statistik Madrasah
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Selamat Datang, {userName} ({role.toUpperCase()}) · {currentDayName}, {formattedTime} WIB
          </p>
        </div>

        <Badge className="bg-primary text-primary-foreground font-medium text-xs px-3 py-1 self-start sm:self-auto">
          ⚡ Sistem Terintegrasi
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-border bg-card shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 grid place-items-center shrink-0 font-bold">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Total Pengguna</div>
              <div className="text-xl font-bold text-foreground">{stats.totalUsers} Akun</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0 font-bold">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Total Siswa Aktif</div>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.siswaCount} Siswa</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 grid place-items-center shrink-0 font-bold">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Guru & Staf GTK</div>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats.guruStafCount} Orang</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0 font-bold">
              <MonitorCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Ujian CBT Aktif</div>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats.cbtExamsCount} Sesi</div>
            </div>
          </CardContent>
        </Card>
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
