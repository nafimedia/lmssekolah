import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building2,
  UserCheck,
  MonitorCheck,
  UserCheck2,
  GraduationCap,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  Inbox,
  FileSpreadsheet,
  FileCheck,
  Award,
  ArrowRight,
} from "lucide-react";
import { MysqlDataService, KamadExecutiveMetrics } from "@/services/mysqlDataService";
import { exportToExcelXml } from "@/utils/excelExporter";
import { normalizeRombelName } from "@/utils/classNormalization";
import { toast } from "sonner";

interface KamadDashboardViewProps {
  userName: string;
  role: string;
  stats: any;
  currentDayName: string;
  formattedTime: string;
  setActiveTab?: (key: string) => void;
}

export function KamadDashboardView({
  userName,
  role,
  stats,
  currentDayName,
  formattedTime,
  setActiveTab,
}: KamadDashboardViewProps) {
  const [nilaiRombelData, setNilaiRombelData] = useState<any[]>([]);
  const [kehadiranSiswaData, setKehadiranSiswaData] = useState<any[]>([]);
  const [kehadiranGuruData, setKehadiranGuruData] = useState<any[]>([]);
  const [supervisiWaka, setSupervisiWaka] = useState<any>({
    totalMaterials: 0,
    verifiedCount: 0,
    pendingCount: 0,
    percentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    MysqlDataService.getKamadExecutiveMetrics()
      .then((metrics: KamadExecutiveMetrics) => {
        if (!isMounted) return;
        setNilaiRombelData(metrics.nilaiRombel || []);
        setKehadiranSiswaData(metrics.presensiSiswa || []);
        setKehadiranGuruData(metrics.presensiGuru || []);
        if (metrics.supervisiWaka) {
          setSupervisiWaka(metrics.supervisiWaka);
        }
      })
      .catch((err) => {
        console.warn("Gagal memuat metrik eksekutif Kamad:", err);
        if (!isMounted) return;
        setNilaiRombelData([]);
        setKehadiranSiswaData([]);
        setKehadiranGuruData([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleExportExecutiveReport = () => {
    const headers = ["Kategori Indikator", "Rincian Capaian", "Nilai / Jumlah", "Persentase / Status"];
    const rows: (string | number)[][] = [
      ["Statistik Madrasah", "Total Pengguna Terdaftar", `${stats.totalUsers || 0} Akun`, "Aktif"],
      ["Statistik Madrasah", "Total Siswa Aktif", `${stats.siswaCount || 0} Siswa`, "Aktif"],
      ["Statistik Madrasah", "Guru & Staf GTK", `${stats.guruStafCount || 0} Orang`, "Aktif"],
      ["Statistik Madrasah", "Total Kelas", `${stats.totalRombel || 0} Kelas`, "TA 2026/2027"],
      ["Supervisi Waka", "Perangkat Disahkan Waka", `${supervisiWaka.verifiedCount} dari ${supervisiWaka.totalMaterials} Berkas`, `${supervisiWaka.percentage}% Tuntas`],
      ["Supervisi Waka", "Perangkat Menunggu Telaah", `${supervisiWaka.pendingCount} Berkas`, "Dalam Proses"],
    ];

    nilaiRombelData.forEach((item) => {
      rows.push(["Akademik Kelas", `Rata-rata ${normalizeRombelName(item.rombel)}`, `${item.avg} / 100`, item.status]);
    });

    kehadiranSiswaData.forEach((item) => {
      rows.push(["Presensi Siswa", item.label, item.count, `${item.percentage}%`]);
    });

    kehadiranGuruData.forEach((item) => {
      rows.push(["Presensi Guru & GTK", item.label, item.count, `${item.percentage}%`]);
    });

    exportToExcelXml("Laporan_Eksekutif_Kepala_Madrasah", "Laporan_Kamad", headers, rows);
    toast.success("Laporan Eksekutif Kepala Madrasah Berhasil Diunduh!");
  };

  const [activeKbmCount, setActiveKbmCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    async function fetchLiveKbmSessions() {
      try {
        const sessions = await MysqlDataService.getActiveKbmSessions();
        if (!isMounted) return;
        const liveCount = (sessions || []).filter((s: any) => s.status === "SEDANG_BERLANGSUNG").length;
        setActiveKbmCount(liveCount);
      } catch (e) {}
    }

    fetchLiveKbmSessions();
    const handleFocus = () => {
      fetchLiveKbmSessions();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-200 font-sans">
      {/* Header Elegan & Berwibawa */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Dashboard Kepala Madrasah
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Selamat Datang, <span className="font-medium text-foreground">{userName}</span> · {currentDayName}, {formattedTime.replace(" WIB WIB", " WIB").replace(" WIB", "")} WIB
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportExecutiveReport}
            className="h-8 border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium text-xs gap-1.5 shadow-2xs"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Unduh Laporan Eksekutif
          </Button>
        </div>
      </div>

      {/* Baris Pintasan Cepat (Sleek & Minimalis) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0 mr-1">
          Akses Cepat:
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2.5 rounded-lg text-xs font-semibold gap-1.5 border-border hover:border-rose-500/40 hover:bg-rose-500/5 text-foreground shrink-0 shadow-2xs"
          onClick={() => setActiveTab?.("monitoring_kbm_live")}
        >
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          Pantau KBM
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2.5 rounded-lg text-xs font-semibold gap-1.5 border-border hover:border-teal-500/40 hover:bg-teal-500/5 text-foreground shrink-0 shadow-2xs"
          onClick={() => setActiveTab?.("sdm_gtk")}
        >
          <Users className="h-3.5 w-3.5 text-teal-600" />
          Kinerja GTK
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2.5 rounded-lg text-xs font-semibold gap-1.5 border-border hover:border-emerald-500/40 hover:bg-emerald-500/5 text-foreground shrink-0 shadow-2xs"
          onClick={() => setActiveTab?.("nilai")}
        >
          <BarChart3 className="h-3.5 w-3.5 text-emerald-600" />
          Leger Nilai
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2.5 rounded-lg text-xs font-semibold gap-1.5 border-border hover:border-blue-500/40 hover:bg-blue-500/5 text-foreground shrink-0 shadow-2xs"
          onClick={() => setActiveTab?.("jadwal")}
        >
          <CalendarCheck className="h-3.5 w-3.5 text-blue-600" />
          Jadwal Pelajaran
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2.5 rounded-lg text-xs font-semibold gap-1.5 border-border hover:border-amber-500/40 hover:bg-amber-500/5 text-foreground shrink-0 shadow-2xs"
          onClick={() => setActiveTab?.("apresiasi_guru")}
        >
          <Award className="h-3.5 w-3.5 text-amber-600" />
          Pembinaan Guru
        </Button>
      </div>

      {/* 4 Kartu Metrik Utama Eksekutif (~42px Compact Strip) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-muted/30 border border-border/80 rounded-xl p-2 text-xs">
        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Siswa Aktif</p>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{stats.siswaCount} Siswa</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-teal-500/15 text-teal-600 flex items-center justify-center shrink-0">
            <GraduationCap className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Guru & Staf GTK</p>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{stats.guruStafCount} Orang</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-rose-500/15 text-rose-600 flex items-center justify-center shrink-0">
            <MonitorCheck className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">KBM Berlangsung</p>
            <p className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 leading-tight mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              {activeKbmCount} Sesi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-purple-500/15 text-purple-600 flex items-center justify-center shrink-0">
            <FileCheck className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Supervisi Perangkat</p>
            <p className="text-sm font-bold text-purple-600 dark:text-purple-400 leading-tight mt-0.5">
              {supervisiWaka.verifiedCount}/{supervisiWaka.totalMaterials} ({supervisiWaka.percentage}%)
            </p>
          </div>
        </div>
      </div>

      {/* 3 Executive Monitoring Charts (Empty state when no data exists) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART 1: Rata-Rata Nilai Siswa per Rombel */}
        <Card className="border-border shadow-xs lg:col-span-1 bg-card">
          <CardHeader className="p-4 pb-3 border-b border-border">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Rata-Rata Nilai Siswa</span>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-[10px] font-medium px-2 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 gap-1 shrink-0"
                onClick={() => setActiveTab?.("nilai")}
              >
                Leger Lengkap <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            <CardDescription className="text-xs">
              Capaian rata-rata akademik pembelajaran per rombel.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {nilaiRombelData.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-1.5">
                <Inbox className="h-6 w-6 text-muted-foreground/40 mx-auto" />
                <div className="font-semibold text-foreground">Belum Ada Data Nilai Terdaftar</div>
                <p className="text-[11px]">Sistem tidak menemukan masukan nilai siswa dari Guru.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {nilaiRombelData.map((item) => (
                  <div key={item.rombel} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-foreground font-bold">{item.rombel}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono font-extrabold">{item.avg} / 100</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden flex items-center">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all`}
                        style={{ width: `${item.avg}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* CHART 2: Kehadiran Siswa Realtime */}
        <Card className="border-border shadow-xs lg:col-span-1 bg-card">
          <CardHeader className="p-4 pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" /> Grafik Kehadiran Siswa
              </CardTitle>
              <Badge variant="outline" className="text-[10px] border-teal-500/30 text-teal-600 font-bold">
                Hari Ini
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Rekapitulasi presensi harian siswa terhubung KBM Live.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {kehadiranSiswaData.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-1.5">
                <Inbox className="h-6 w-6 text-muted-foreground/40 mx-auto" />
                <div className="font-semibold text-foreground">Belum Ada Presensi Siswa</div>
                <p className="text-[11px]">Belum ada rekam presensi harian siswa yang dikirimkan Wali Kelas / Guru Pengampu.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                  <div className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">Tingkat Kehadiran Siswa Hari Ini</div>
                  <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {kehadiranSiswaData[0]?.percentage || 0}% Hadir
                  </div>
                </div>

                <div className="space-y-3">
                  {kehadiranSiswaData.map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-foreground">{item.label}</span>
                        <span className="font-mono font-bold text-foreground">{item.count} ({item.percentage}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all`}
                          style={{ width: `${Math.max(item.percentage, 0)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CHART 3: Kehadiran Guru & GTK */}
        <Card className="border-border shadow-xs lg:col-span-1 bg-card">
          <CardHeader className="p-4 pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <UserCheck2 className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Grafik Kehadiran Guru & Staf GTK
              </CardTitle>
              <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-600 font-bold">
                Presensi GTK
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Monitoring kehadiran jam tatap muka Guru Pengampu KBM.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {kehadiranGuruData.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-1.5">
                <Inbox className="h-6 w-6 text-muted-foreground/40 mx-auto" />
                <div className="font-semibold text-foreground">Belum Ada Presensi Guru</div>
                <p className="text-[11px]">Belum ada rekam kehadiran mengajar jam KBM guru yang tercatat hari ini.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
                  <div className="text-xs text-blue-700 dark:text-blue-300 font-semibold">Kehadiran Guru Mengajar Hari Ini</div>
                  <div className="text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                    {kehadiranGuruData[0]?.percentage || 0}% Hadir
                  </div>
                </div>

                <div className="space-y-3">
                  {kehadiranGuruData.map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-foreground">{item.label}</span>
                        <span className="font-mono font-bold text-foreground">{item.count} ({item.percentage}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all`}
                          style={{ width: `${Math.max(item.percentage, 0)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
