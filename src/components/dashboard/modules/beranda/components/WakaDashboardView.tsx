import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { normalizeRombelName } from "@/utils/classNormalization";

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
            class: normalizeRombelName(item.rombel),
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
    <div className="space-y-4 text-slate-800 dark:text-slate-200 font-sans">
      {/* Header Waka Kurikulum */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> Portal Dashboard Waka Kurikulum
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Selamat Datang, <span className="font-medium text-foreground">{userName}</span> (WAKA KURIKULUM) · {currentDayName}, {formattedTime}
          </p>
        </div>

        <Badge className="bg-primary/15 text-primary border-primary/30 font-medium text-xs px-2.5 py-1 self-start sm:self-auto gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Supervisi & Validasi Kurikulum Aktif
        </Badge>
      </div>

      {/* Horizontal Compact Metric Strip (~42px) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-muted/30 border border-border/80 rounded-xl p-2 text-xs">
        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Perlu Validasi</p>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{pendingPerangkatCount} Dokumen</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <FileCheck className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Telah Disahkan</p>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{verifiedPerangkatCount} Dokumen</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <CalendarClock className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Jadwal Sesi KBM</p>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{totalJadwalCount} Sesi</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Users className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Guru Pengampu</p>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{stats.guruStafCount} Pendidik</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Pintasan Operasional Waka & Chart Capaian Akademik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pintasan Operasional Kurikulum */}
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="p-3.5 py-2.5 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-primary" /> Pintasan Pengelolaan Kurikulum
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-10 flex items-center justify-start px-2.5 text-xs font-semibold gap-2 border-amber-500/30 hover:bg-amber-500/10 text-foreground"
              onClick={() => setActiveTab?.("perangkat_pembelajaran")}
            >
              <FileCheck className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span className="truncate">Validasi Perangkat</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-10 flex items-center justify-start px-2.5 text-xs font-semibold gap-2 border-emerald-500/30 hover:bg-emerald-500/10 text-foreground"
              onClick={() => setActiveTab?.("modul_ajar")}
            >
              <BookMarked className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Bahan Ajar</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-10 flex items-center justify-start px-2.5 text-xs font-semibold gap-2 border-blue-500/30 hover:bg-blue-500/10 text-foreground"
              onClick={() => setActiveTab?.("jadwal")}
            >
              <CalendarClock className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span className="truncate">Jadwal KBM</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-10 flex items-center justify-start px-2.5 text-xs font-semibold gap-2 border-purple-500/30 hover:bg-purple-500/10 text-foreground"
              onClick={() => setActiveTab?.("sdm_gtk")}
            >
              <Users className="h-3.5 w-3.5 text-purple-600 shrink-0" />
              <span className="truncate">Beban Guru</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-10 flex items-center justify-start px-2.5 text-xs font-semibold gap-2 border-rose-500/30 hover:bg-rose-500/10 text-foreground"
              onClick={() => setActiveTab?.("monitoring_kbm_live")}
            >
              <Radio className="h-3.5 w-3.5 text-rose-600 shrink-0" />
              <span className="truncate">Live KBM</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-10 flex items-center justify-start px-2.5 text-xs font-semibold gap-2 border-teal-500/30 hover:bg-teal-500/10 text-foreground"
              onClick={() => setActiveTab?.("nilai")}
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-teal-600 shrink-0" />
              <span className="truncate">Laporan Nilai</span>
            </Button>
          </CardContent>
        </Card>

        {/* Chart Capaian Akademik Rombel */}
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="p-3.5 py-2.5 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-primary" /> Capaian Akademik Antar Kelas
            </CardTitle>
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
