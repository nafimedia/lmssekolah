import { CheckCircle2, ShieldCheck, CalendarDays, Clock, ChevronLeft, ChevronRight, Info, Calendar, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { StudentHeaderBanner } from "@/components/dashboard/components/StudentHeaderBanner";

export interface StudentInfo {
  id: string;
  nisn: string;
  name: string;
  class: string;
  hadir: number;
  izin: number;
  sakit: number;
  alpa: number;
  pct: number;
  status: string;
  today: string;
}

interface PresensiSiswaTabProps {
  studentInfo: StudentInfo;
  currentMonthName: string;
  currentYear: number;
  formattedTime: string;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
  calendarDays: any[];
}

export function PresensiSiswaTab({
  studentInfo,
  currentMonthName,
  currentYear,
  formattedTime,
  goToPrevMonth,
  goToNextMonth,
  goToToday,
  calendarDays,
}: PresensiSiswaTabProps) {
  return (
    <div className="space-y-6">
      <StudentHeaderBanner
        title="Kehadiran & Presensi Saya"
        subtitle="Monitoring rekapitulasi kehadiran harian & sesi mengajar KBM MTsN 2 Cilacap"
        icon={UserCheck}
        studentClass={studentInfo.class || "Kelas VIII A"}
        studentNisn={studentInfo.nisn}
        statusText="Presensi Terverifikasi Wali Kelas"
        statusVariant="success"
      />

      <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-xs text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-2">
        <Info className="h-4 w-4 text-blue-500 shrink-0" />
        <span>Catatan: Siswa tidak melakukan presensi mandiri. Seluruh pencatatan presensi harian dilakukan secara resmi oleh Wali Kelas & Guru Pengampu saat KBM.</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-border bg-card shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0 font-bold">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Total Hadir</div>
              <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{studentInfo.hadir} Hari (95.2%)</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 grid place-items-center shrink-0 font-bold">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Total Izin</div>
              <div className="text-lg font-extrabold text-foreground">{studentInfo.izin} Hari</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0 font-bold">
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Total Sakit</div>
              <div className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{studentInfo.sakit} Hari</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 grid place-items-center shrink-0 font-bold">
              <ShieldCheck className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Tanpa Keterangan (Alpa)</div>
              <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">0 Hari (Disiplin)</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm overflow-hidden bg-card">
        <CardHeader className="bg-muted/40 border-b border-border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Kalender Kehadiran & Presensi Saya ({currentMonthName} {currentYear})
            </CardTitle>
            <CardDescription className="text-xs">
              Visualisasi harian status presensi resmi {studentInfo.name} di MTsN 2 Cilacap.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs gap-1 py-1">
              <Clock className="h-3 w-3 animate-pulse" /> {formattedTime}
            </Badge>
            <div className="flex items-center gap-1 bg-background rounded-lg p-0.5 border border-border">
              <Button size="icon" variant="ghost" className="h-7 w-7 text-xs" onClick={goToPrevMonth} title="Bulan Sebelumnya">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-bold text-xs px-1 font-mono">{currentMonthName} {currentYear}</span>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-xs" onClick={goToNextMonth} title="Bulan Berikutnya">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button size="sm" variant="secondary" className="h-7 text-xs font-semibold px-2.5" onClick={goToToday}>
              Hari Ini
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          <div className="border border-border rounded-xl p-3 bg-muted/20 overflow-x-auto">
            <div className="min-w-[500px]">
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-muted-foreground pb-2 border-b border-border/60">
                <div>Senin</div>
                <div>Selasa</div>
                <div>Rabu</div>
                <div>Kamis</div>
                <div>Jumat</div>
                <div>Sabtu</div>
                <div className="text-red-500">Minggu</div>
              </div>

              <div className="grid grid-cols-7 gap-1 pt-2">
                {calendarDays.map((cell, idx) => {
                  let bgClass = "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300";
                  let badgeIcon = "🟢";
                  let statusText = "Hadir";
                  let note = "Hadir (Pelajaran Efektif)";

                  if (cell.isWeekend) {
                    bgClass = "bg-muted/50 border-border text-muted-foreground/60";
                    badgeIcon = "⚪";
                    statusText = "Libur";
                    note = `Akhir Pekan (${cell.dayOfWeekName})`;
                  } else if (cell.dayNumber === 12 && cell.isCurrentMonth) {
                    bgClass = "bg-blue-500/20 border-blue-500/40 text-blue-700 dark:text-blue-300 font-extrabold ring-1 ring-blue-500/50";
                    badgeIcon = "🔵";
                    statusText = "Izin";
                    note = "Izin Resmi: Duta Kafilah Lomba MTQ Kabupaten";
                  } else if (cell.dayNumber === 18 && cell.isCurrentMonth) {
                    bgClass = "bg-amber-500/20 border-amber-500/40 text-amber-800 dark:text-amber-300 font-extrabold ring-1 ring-amber-500/50";
                    badgeIcon = "🟡";
                    statusText = "Sakit";
                    note = "Sakit Demam (Surat Dokter Terverifikasi)";
                  } else if (!cell.isCurrentMonth) {
                    bgClass = "bg-muted/30 border-border/40 text-muted-foreground/40 opacity-40";
                    badgeIcon = "";
                    statusText = "";
                    note = "Luar Bulan Ini";
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => toast.info(`📅 Presensi Tgl ${cell.dayNumber} ${currentMonthName} ${currentYear}`, { description: note ? `${badgeIcon} Status: ${note}` : undefined })}
                      className={`p-2 rounded-lg border text-center transition cursor-pointer hover:scale-105 ${bgClass} ${
                        cell.isToday ? "ring-2 ring-emerald-500 shadow-md font-extrabold bg-emerald-500/30 text-emerald-900 dark:text-emerald-100" : ""
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] opacity-80">
                        <span className={cell.isToday ? "font-extrabold text-emerald-600 dark:text-emerald-300" : ""}>{cell.dayNumber}</span>
                        <span>{cell.isToday ? "🌟" : badgeIcon}</span>
                      </div>
                      <div className="text-[9px] font-bold truncate mt-1">
                        {cell.isToday ? "Hari Ini" : statusText}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-muted-foreground font-semibold">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1">🟢 <span className="text-foreground">Hadir</span></span>
              <span className="flex items-center gap-1">🔵 <span className="text-foreground">Izin Resmi</span></span>
              <span className="flex items-center gap-1">🟡 <span className="text-foreground">Sakit</span></span>
              <span className="flex items-center gap-1">🔴 <span className="text-foreground">Alpa</span></span>
              <span className="flex items-center gap-1">⚪ <span className="text-foreground">Libur Akhir Pekan (Minggu)</span></span>
            </div>
            <div className="italic text-[10px]">💡 Data presensi resmi dicatat oleh Wali Kelas & Guru Pengampu.</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
