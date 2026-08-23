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
    <div className="space-y-6 text-slate-800 dark:text-slate-200 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" /> Dashboard Eksekutif & Statistik Madrasah
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Selamat Datang, {userName} ({role.toUpperCase()}) · {currentDayName}, {formattedTime} WIB
          </p>
        </div>

        <Badge className="bg-primary text-primary-foreground font-extrabold text-xs px-3 py-1 self-start sm:self-auto">
          ⚡ MySQL Storage Connected
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
              <div className="text-xl font-extrabold text-foreground">{stats.totalUsers} Akun</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0 font-bold">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Total Siswa Active</div>
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.siswaCount} Siswa</div>
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
              <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400">{stats.guruStafCount} Orang</div>
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
              <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{stats.cbtExamsCount} Sesi</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
          <CardHeader className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" /> Pintasan Sistem Master SIAKAD
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center text-xs font-bold gap-1" onClick={() => setActiveTab?.("siakad")}>
              <Users className="h-4 w-4 text-blue-600" /> Data Master SIAKAD
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center text-xs font-bold gap-1" onClick={() => setActiveTab?.("users")}>
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Manajemen User & Role
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
          <CardHeader className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-emerald-600" /> Verifikasi Modul Ajar & Kurikulum
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1 text-xs">
              <div className="font-bold text-foreground">Modul Ajar Kurikulum Merdeka</div>
              <div className="text-muted-foreground">Portal pengesahan berkas PDF dari Guru Pengampu</div>
            </div>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1" onClick={() => setActiveTab?.("modul_ajar")}>
              Buka Modul Ajar <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
