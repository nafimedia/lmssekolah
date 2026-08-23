import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Trophy, BookOpen, CalendarClock, ArrowRight, CheckCircle2 } from "lucide-react";

interface SiswaDashboardViewProps {
  userName: string;
  currentDayName: string;
  formattedTime: string;
  setActiveTab?: (key: string) => void;
}

export function SiswaDashboardView({ userName, currentDayName, formattedTime, setActiveTab }: SiswaDashboardViewProps) {
  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-emerald-600" /> Dashboard Siswa MTsN 2 Cilacap
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Selamat Belajar, {userName} · Kelas VIII A (Rombel 8A) · {currentDayName}, {formattedTime} WIB
          </p>
        </div>

        <Badge className="bg-emerald-600 text-white font-extrabold text-xs px-3 py-1 self-start sm:self-auto">
          📍 Status Presensi Hari Ini: HADIR
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
              <span>Kehadiran Presensi Saya</span>
              <CheckCircle2 className="h-4 w-4" />
            </CardDescription>
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-slate-100">
              95.2% (Disiplin)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 dark:text-slate-400">
            20 Hari Hadir · 1 Hari Izin · 0 Alpa
          </CardContent>
        </Card>

        <Card className="border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-between">
              <span>Tugas & LKPD Belum Selesai</span>
              <BookOpen className="h-4 w-4" />
            </CardDescription>
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-slate-100">
              2 Tugas Digital
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 dark:text-slate-400">
            Matematika & Bahasa Arab (Tenggat Besok)
          </CardContent>
        </Card>

        <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center justify-between">
              <span>Poin Prestasi & Lencana</span>
              <Trophy className="h-4 w-4" />
            </CardDescription>
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-slate-100">
              1.250 Poin (Top 3)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 dark:text-slate-400">
            3 Lencana Penghargaan Kejuaraan
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
        <CardHeader className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-emerald-600" /> Jadwal Belajar Kelas VIII A Hari Ini
          </CardTitle>
          <Button size="sm" variant="ghost" className="text-xs font-bold text-emerald-600 gap-1" onClick={() => setActiveTab?.("jadwal")}>
            Jadwal Lengkap <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
            <div>
              <div className="font-bold text-xs">07.30 - 09.00 WIB · Al Qur&apos;an Hadis (SAYONO, S.Pd., M.Pd.)</div>
              <div className="text-[11px] text-slate-500">Ruang Kelas VIII-A (Lantai 2)</div>
            </div>
            <Badge className="bg-emerald-600 text-white text-[10px]">Sedang Berlangsung</Badge>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
            <div>
              <div className="font-bold text-xs">10.00 - 11.30 WIB · Matematika Aljabar (SOBIYATI, S.Pd)</div>
              <div className="text-[11px] text-slate-500">Ruang Kelas VIII-A (Lantai 2)</div>
            </div>
            <Badge variant="outline" className="text-[10px]">Berikutnya</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
