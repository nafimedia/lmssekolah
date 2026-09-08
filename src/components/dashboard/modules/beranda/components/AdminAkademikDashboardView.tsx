import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building2,
  BookOpen,
  UserCheck,
  MonitorCheck,
  ShieldCheck,
  Database,
  BarChart3,
  BookMarked,
  Inbox,
  CheckCircle2,
  CalendarClock,
  Radio,
  FileSpreadsheet,
} from "lucide-react";
import { MysqlDataService } from "@/services/mysqlDataService";

interface AdminAkademikDashboardViewProps {
  userName: string;
  role: string;
  stats: any;
  currentDayName: string;
  formattedTime: string;
  setActiveTab?: (key: string) => void;
}

export function AdminAkademikDashboardView({
  userName,
  role,
  stats,
  currentDayName,
  formattedTime,
  setActiveTab,
}: AdminAkademikDashboardViewProps) {
  const [nilaiAkademikData, setNilaiAkademikData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    MysqlDataService.getKamadExecutiveMetrics()
      .then((metrics) => {
        if (!isMounted) return;
        if (metrics.nilaiRombel && metrics.nilaiRombel.length > 0) {
          const mapped = metrics.nilaiRombel.map((item: any) => ({
            class: item.rombel,
            avg: Number(item.avg || 0),
            color: item.color || "bg-emerald-500",
          }));
          setNilaiAkademikData(mapped);
        } else {
          setNilaiAkademikData([]);
        }
      })
      .catch(() => {
        if (isMounted) setNilaiAkademikData([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200 font-sans">
      {/* Header Admin Akademik */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> Portal Dashboard Admin Akademik
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Selamat Datang, <span className="font-medium text-foreground">{userName}</span> (ADMIN AKADEMIK) · {currentDayName}, {formattedTime} WIB
          </p>
        </div>

        <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-medium text-xs px-3 py-1.5 self-start sm:self-auto gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Portal Akademik Aktif
        </Badge>
      </div>

      {/* Stat Cards Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/5 via-card to-card border-blue-500/20 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 grid place-items-center shrink-0 font-bold">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Total Pengguna</div>
              <div className="text-xl font-bold text-foreground">{stats.totalUsers} Akun</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/5 via-card to-card border-emerald-500/20 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0 font-bold">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Total Siswa Aktif</div>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.siswaCount} Siswa</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-500/5 via-card to-card border-teal-500/20 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 grid place-items-center shrink-0 font-bold">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Guru & Staf GTK</div>
              <div className="text-xl font-bold text-teal-600 dark:text-teal-400">{stats.guruStafCount} Orang</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/5 via-card to-card border-amber-500/20 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0 font-bold">
              <MonitorCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Ujian CBT Aktif</div>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats.cbtExamsCount} Sesi</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Pintasan Operasional Akademik & Chart Nilai */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pintasan Operasional */}
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Pintasan Operasional Akademik
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center text-xs font-bold gap-1 border-emerald-500/30 hover:bg-emerald-500/10" onClick={() => setActiveTab?.("siakad")}>
              <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Data Akademik
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center text-xs font-bold gap-1 border-blue-500/30 hover:bg-blue-500/10" onClick={() => setActiveTab?.("jadwal")}>
              <CalendarClock className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Jadwal Pelajaran
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center text-xs font-bold gap-1 border-rose-500/30 hover:bg-rose-500/10" onClick={() => setActiveTab?.("monitoring_kbm_live")}>
              <Radio className="h-4 w-4 text-rose-600 dark:text-rose-400" /> Pantau KBM
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center text-xs font-bold gap-1 border-amber-500/30 hover:bg-amber-500/10" onClick={() => setActiveTab?.("nilai")}>
              <FileSpreadsheet className="h-4 w-4 text-amber-600 dark:text-amber-400" /> Rekap Nilai & Rapor
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center text-xs font-bold gap-1 border-teal-500/30 hover:bg-teal-500/10" onClick={() => setActiveTab?.("perangkat_pembelajaran")}>
              <BookOpen className="h-4 w-4 text-teal-600 dark:text-teal-400" /> Perangkat Mapel
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center text-xs font-bold gap-1 border-purple-500/30 hover:bg-purple-500/10" onClick={() => setActiveTab?.("users")}>
              <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Data Pengguna
            </Button>
          </CardContent>
        </Card>

        {/* Chart Nilai Akademik Siswa */}
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="p-4 pb-3 border-b border-border flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Grafik Capaian Kelas / Rombel
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Monitoring grafik nilai rata-rata per Rombel MTsN 2 Cilacap.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="h-7 text-xs font-bold text-emerald-600 hover:bg-emerald-500/10 px-2 gap-1" onClick={() => setActiveTab?.("nilai")}>
                Buka Leger Nilai →
              </Button>
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 font-bold">
                Data Terkini
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {nilaiAkademikData.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-1.5">
                <Inbox className="h-6 w-6 text-muted-foreground/40 mx-auto" />
                <div className="font-semibold text-foreground">Belum Ada Data Nilai Terdaftar</div>
                <p className="text-[11px]">Belum ada nilai yang dimasukkan oleh Guru Pengampu.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {nilaiAkademikData.map((item) => (
                  <div key={item.class} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-foreground">{item.class}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{item.avg} / 100</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.avg}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
