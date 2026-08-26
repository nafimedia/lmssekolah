import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { MysqlDataService } from "@/services/mysqlDataService";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    // Fetch real data from DB
    Promise.all([
      (MysqlDataService as any).getNilaiRekap?.() || Promise.resolve([]),
      (MysqlDataService as any).getAttendanceStats?.() || Promise.resolve(null),
    ])
      .then(([dbNilai, dbPresensi]) => {
        if (!isMounted) return;

        // Process Nilai Rombel Chart Data
        if (dbNilai && dbNilai.length > 0) {
          const mappedNilai = dbNilai.map((item: any) => ({
            rombel: item.rombel_name || item.class_name,
            avg: Number(item.avg_score || 0),
            status: Number(item.avg_score || 0) >= 85 ? "Tuntas Mumtaz" : "Dalam Proses",
            color: "bg-emerald-500",
          }));
          setNilaiRombelData(mappedNilai);
        } else {
          setNilaiRombelData([]);
        }

        // Process Presensi Siswa & Guru Chart Data
        if (dbPresensi && dbPresensi.siswaCount > 0) {
          setKehadiranSiswaData([
            { label: "Hadir KBM Live", percentage: dbPresensi.siswaHadirPct || 0, count: `${dbPresensi.siswaHadirCount || 0} Siswa`, color: "bg-emerald-500" },
            { label: "Izin / Dispensa", percentage: dbPresensi.siswaIzinPct || 0, count: `${dbPresensi.siswaIzinCount || 0} Siswa`, color: "bg-blue-500" },
            { label: "Sakit", percentage: dbPresensi.siswaSakitPct || 0, count: `${dbPresensi.siswaSakitCount || 0} Siswa`, color: "bg-amber-500" },
          ]);
        } else {
          setKehadiranSiswaData([]);
        }

        if (dbPresensi && dbPresensi.guruCount > 0) {
          setKehadiranGuruData([
            { label: "Hadir Mengajar KBM", percentage: dbPresensi.guruHadirPct || 0, count: `${dbPresensi.guruHadirCount || 0} Guru`, color: "bg-emerald-600" },
            { label: "Tugas Luar / Dinas", percentage: dbPresensi.guruDinasPct || 0, count: `${dbPresensi.guruDinasCount || 0} Guru`, color: "bg-blue-600" },
          ]);
        } else {
          setKehadiranGuruData([]);
        }
      })
      .catch(() => {
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
    <div className="space-y-6 text-slate-800 dark:text-slate-200 font-sans">
      {/* Header Banner Kamad */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /> Dashboard Monitoring Eksekutif Kepala Madrasah
          </h1>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Selamat Datang, {userName} (KEPALA MADRASAH) · {currentDayName}, {formattedTime} WIB
          </p>
        </div>

        <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold text-xs px-3 py-1.5 self-start sm:self-auto gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Portal Executive Monitoring Realtime
        </Badge>
      </div>

      {/* Real Stat Cards Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/5 via-card to-card border-blue-500/20 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 grid place-items-center shrink-0 font-bold">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Total Pengguna</div>
              <div className="text-xl font-extrabold text-foreground">{stats.totalUsers} Akun</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/5 via-card to-card border-emerald-500/20 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0 font-bold">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Total Siswa Active</div>
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.siswaCount} Siswa</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-500/5 via-card to-card border-teal-500/20 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 grid place-items-center shrink-0 font-bold">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Guru & Staf GTK</div>
              <div className="text-xl font-extrabold text-teal-600 dark:text-teal-400">{stats.guruStafCount} Orang</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 via-card to-card border-emerald-500/30 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0 font-bold animate-pulse">
              <MonitorCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Sesi KBM Live Aktif</div>
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{activeKbmCount} Sesi Live</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3 Executive Monitoring Charts (Empty state when no data exists) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART 1: Rata-Rata Nilai Siswa per Rombel */}
        <Card className="border-border shadow-xs lg:col-span-1 bg-card">
          <CardHeader className="p-4 pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Chart Rata-Rata Nilai Siswa
              </CardTitle>
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 font-bold">
                TA 2026/2027
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Rata-rata akademik capaian pembelajaran per Rombel MTsN 2 Cilacap.
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
                <CalendarCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" /> Chart Kehadiran Siswa (KBM)
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
                <UserCheck2 className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Chart Kehadiran Guru & GTK
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
