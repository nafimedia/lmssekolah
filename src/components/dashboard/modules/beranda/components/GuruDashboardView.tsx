import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, CheckSquare, LineChart, BookOpen, Bot, ArrowRight, PencilLine } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface GuruDashboardViewProps {
  userName: string;
  currentDayName: string;
  formattedTime: string;
  setActiveTab?: (key: string) => void;
}

export function GuruDashboardView({ userName, currentDayName, formattedTime, setActiveTab }: GuruDashboardViewProps) {
  const [selectedJadwalModal, setSelectedJadwalModal] = useState<any>(null);
  const [selectedTugasModal, setSelectedTugasModal] = useState<any>(null);
  const [selectedCapaianModal, setSelectedCapaianModal] = useState<any>(null);

  const jadwalHariIni = [
    { jam: "07.30 - 09.00 WIB", rombel: "Rombel 8A", mapel: "Al Qur'an Hadis", status: "AKTIF", room: "Ruang VIII-A (Lantai 2)" },
    { jam: "10.00 - 11.30 WIB", rombel: "Rombel 8B", mapel: "Al Qur'an Hadis", status: "NANTI", room: "Ruang VIII-B (Lantai 2)" },
  ];

  const tugasPerluDiperiksa = [
    { id: "t1", title: "LKPD 1 - Hafalan Surat Al-Fajr", class: "Rombel 8A", total: 32, submitted: 30, pendingGrading: 5 },
    { id: "t2", title: "Asesmen Formatif Mad Silah", class: "Rombel 8B", total: 30, submitted: 28, pendingGrading: 8 },
  ];

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Dashboard Guru Pengampu
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Selamat Datang, {userName} · {currentDayName}, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} ({formattedTime} WIB)
          </p>
        </div>

        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-sm self-start sm:self-auto"
          onClick={() => setActiveTab?.("ruang_mengajar")}
        >
          <PencilLine className="h-4 w-4" /> Masuk Ruang Mengajar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 hover:border-emerald-500/60 transition cursor-pointer"
          onClick={() => setSelectedJadwalModal(jadwalHariIni[0])}
        >
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
              <span>Jadwal Mengajar Hari Ini</span>
              <CalendarClock className="h-4 w-4" />
            </CardDescription>
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-slate-100">
              2 Sesi KBM
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <div className="font-bold text-slate-800 dark:text-slate-200">Rombel 8A & 8B (Al Qur&apos;an Hadis)</div>
            <div>Sesi aktif: 07.30 - 09.00 WIB</div>
          </CardContent>
        </Card>

        <Card
          className="border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20 hover:border-blue-500/60 transition cursor-pointer"
          onClick={() => setSelectedTugasModal(tugasPerluDiperiksa[0])}
        >
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-between">
              <span>Tugas & LKPD Perlu Diperiksa</span>
              <CheckSquare className="h-4 w-4" />
            </CardDescription>
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-slate-100">
              13 Berkas
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <div className="font-bold text-slate-800 dark:text-slate-200">5 dari Rombel 8A · 8 dari Rombel 8B</div>
            <div>Perlu penilaian & koreksi nilai harian</div>
          </CardContent>
        </Card>

        <Card
          className="border-purple-500/30 bg-purple-50/50 dark:bg-purple-950/20 hover:border-purple-500/60 transition cursor-pointer"
          onClick={() => setSelectedCapaianModal({ materi: "Hukum Bacaan Mad", r8a: "92%", r8b: "88%" })}
        >
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center justify-between">
              <span>Capaian Materi Kurikulum</span>
              <LineChart className="h-4 w-4" />
            </CardDescription>
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-slate-100">
              90% Tuntas
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <div className="font-bold text-slate-800 dark:text-slate-200">Pertemuan 16 dari 18 Sesi</div>
            <div>Siap untuk Ujian Asesmen Sumatif (CBT)</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
            <CardHeader className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-emerald-600" /> Agenda KBM & Jadwal Hari Ini
              </CardTitle>
              <Button size="sm" variant="ghost" className="text-xs font-bold text-emerald-600 gap-1" onClick={() => setActiveTab?.("jadwal")}>
                Lihat Jadwal <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {jadwalHariIni.map((j, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{j.mapel} ({j.rombel})</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">⏰ {j.jam} · 📍 {j.room}</div>
                  </div>
                  <Badge className={j.status === "AKTIF" ? "bg-emerald-600 text-white font-bold text-xs" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs"}>
                    {j.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-slate-200 dark:border-slate-800 shadow-xs bg-slate-900 text-white">
            <CardHeader className="p-4 border-b border-slate-800">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Bot className="h-4 w-4 text-emerald-400" /> Asisten AI Guru MTsN 2
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Butuh bantuan menyusun Modul Ajar PDF atau Bank Soal CBT? Asisten AI siap membantu secara instan!
              </p>
              <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5" onClick={() => setActiveTab?.("asisten_ai")}>
                ✨ Buka Asisten AI Pembelajaran
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!selectedJadwalModal} onOpenChange={() => setSelectedJadwalModal(null)}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-emerald-600" /> Detail Sesi Mengajar
            </DialogTitle>
            <DialogDescription className="text-xs">
              Sesi: {selectedJadwalModal?.jam} · {selectedJadwalModal?.rombel}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-xs py-2">
            <div>Mata Pelajaran: <strong>{selectedJadwalModal?.mapel}</strong></div>
            <div>Ruang Kelas: <strong>{selectedJadwalModal?.room}</strong></div>
            <div>Status KBM: <strong className="text-emerald-600">{selectedJadwalModal?.status}</strong></div>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={() => setSelectedJadwalModal(null)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
