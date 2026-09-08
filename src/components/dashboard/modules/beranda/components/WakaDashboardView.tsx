import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  CalendarClock,
  Radio,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Users,
  Award,
  BarChart3,
  Building2,
  FileCheck,
  AlertTriangle,
  Inbox,
  BookMarked,
  ArrowRight,
} from "lucide-react";
import { MysqlDataService } from "@/services/mysqlDataService";

interface WakaDashboardViewProps {
  userName: string;
  role: string;
  stats: any;
  currentDayName: string;
  formattedTime: string;
  setActiveTab?: (key: string) => void;
}

export function WakaDashboardView({
  userName,
  role,
  stats,
  currentDayName,
  formattedTime,
  setActiveTab,
}: WakaDashboardViewProps) {
  const [pendingPerangkatCount, setPendingPerangkatCount] = useState<number>(0);
  const [verifiedPerangkatCount, setVerifiedPerangkatCount] = useState<number>(0);
  const [totalJadwalCount, setTotalJadwalCount] = useState<number>(0);
  const [nilaiRombelData, setNilaiRombelData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      MysqlDataService.getMaterials().catch(() => []),
      MysqlDataService.getJadwalPelajaran().catch(() => []),
      MysqlDataService.getKamadExecutiveMetrics().catch(() => ({ nilaiRombel: [] })),
    ])
      .then(([materials, schedules, metrics]) => {
        if (!isMounted) return;

        // Hitung dokumen perangkat & modul ajar menunggu verifikasi waka
        const pending = (materials || []).filter((m: any) => {
          const st = (m.status || "").toLowerCase();
          return st.includes("menunggu") || st.includes("pending") || st.includes("revisi");
        }).length;
        const verified = (materials || []).filter((m: any) => {
          const st = (m.status || "").toLowerCase();
          return st.includes("terverifikasi") || st.includes("disahkan");
        }).length;

        setPendingPerangkatCount(pending);
        setVerifiedPerangkatCount(verified);
        setTotalJadwalCount((schedules || []).length);

        if (metrics.nilaiRombel && metrics.nilaiRombel.length > 0) {
          const mapped = metrics.nilaiRombel.map((item: any) => ({
            class: item.rombel,
            avg: Number(item.avg || 0),
            color: item.color || "bg-emerald-500",
          }));
          setNilaiRombelData(mapped);
        } else {
          setNilaiRombelData([]);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200 font-sans">
      {/* Header Waka Kurikulum */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> Portal Dashboard Waka Kurikulum
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Selamat Datang, <span className="font-medium text-foreground">{userName}</span> (WAKA KURIKULUM) · {currentDayName}, {formattedTime} WIB
          </p>
        </div>

        <Badge className="bg-primary/15 text-primary border-primary/30 font-medium text-xs px-3 py-1.5 self-start sm:self-auto gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Supervisi & Validasi Kurikulum Aktif
        </Badge>
      </div>

      {/* Stat Cards Overview Kurikulum */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-500/5 via-card to-card border-amber-500/25 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0 font-bold">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Perlu Validasi</div>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {pendingPerangkatCount} Dokumen
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/5 via-card to-card border-emerald-500/25 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0 font-bold">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Telah Disahkan</div>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {verifiedPerangkatCount} Dokumen
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/5 via-card to-card border-blue-500/25 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 grid place-items-center shrink-0 font-bold">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Jadwal Sesi KBM</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {totalJadwalCount} Sesi
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/5 via-card to-card border-purple-500/25 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 grid place-items-center shrink-0 font-bold">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Guru Pengampu KBM</div>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {stats.guruStafCount} Pendidik
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Pintasan Operasional Waka & Chart Capaian Akademik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pintasan Operasional Kurikulum */}
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" /> Pintasan Pengelolaan Kurikulum
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Akses cepat validasi dan supervisi pembelajaran madrasah.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <Button
              variant="outline"
              className="h-16 flex flex-col items-center justify-center text-xs font-bold gap-1 border-amber-500/30 hover:bg-amber-500/10 text-foreground"
              onClick={() => setActiveTab?.("perangkat_pembelajaran")}
            >
              <FileCheck className="h-4 w-4 text-amber-600" /> Validasi Perangkat
            </Button>
            <Button
              variant="outline"
              className="h-16 flex flex-col items-center justify-center text-xs font-bold gap-1 border-emerald-500/30 hover:bg-emerald-500/10 text-foreground"
              onClick={() => setActiveTab?.("modul_ajar")}
            >
              <BookMarked className="h-4 w-4 text-emerald-600" /> Validasi Bahan Ajar
            </Button>
            <Button
              variant="outline"
              className="h-16 flex flex-col items-center justify-center text-xs font-bold gap-1 border-blue-500/30 hover:bg-blue-500/10 text-foreground"
              onClick={() => setActiveTab?.("jadwal")}
            >
              <CalendarClock className="h-4 w-4 text-blue-600" /> Jadwal Pelajaran
            </Button>
            <Button
              variant="outline"
              className="h-16 flex flex-col items-center justify-center text-xs font-bold gap-1 border-purple-500/30 hover:bg-purple-500/10 text-foreground"
              onClick={() => setActiveTab?.("sdm_gtk")}
            >
              <Users className="h-4 w-4 text-purple-600" /> Beban Mengajar Guru
            </Button>
            <Button
              variant="outline"
              className="h-16 flex flex-col items-center justify-center text-xs font-bold gap-1 border-rose-500/30 hover:bg-rose-500/10 text-foreground"
              onClick={() => setActiveTab?.("monitoring_kbm_live")}
            >
              <Radio className="h-4 w-4 text-rose-600" /> Pantau KBM Langsung
            </Button>
            <Button
              variant="outline"
              className="h-16 flex flex-col items-center justify-center text-xs font-bold gap-1 border-teal-500/30 hover:bg-teal-500/10 text-foreground"
              onClick={() => setActiveTab?.("nilai")}
            >
              <FileSpreadsheet className="h-4 w-4 text-teal-600" /> Laporan Nilai
            </Button>
          </CardContent>
        </Card>

        {/* Chart Capaian Akademik Rombel */}
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="p-4 pb-3 border-b border-border flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Capaian Akademik Antar Rombel
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Grafik perbandingan nilai rata-rata tiap rombel.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs font-bold text-primary hover:bg-primary/10 px-2 gap-1"
                onClick={() => setActiveTab?.("nilai")}
              >
                Detail Nilai <ArrowRight className="h-3 w-3" />
              </Button>
              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary font-bold">
                Data Terkini
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {nilaiRombelData.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-1.5">
                <Inbox className="h-6 w-6 text-muted-foreground/40 mx-auto" />
                <div className="font-semibold text-foreground">Belum Ada Data Capaian Terdaftar</div>
                <p className="text-[11px]">Belum ada nilai yang dimasukkan oleh Guru Pengampu.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {nilaiRombelData.map((item) => (
                  <div key={item.class} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-foreground">{item.class}</span>
                      <span className="text-primary font-mono font-bold">{item.avg} / 100</span>
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
