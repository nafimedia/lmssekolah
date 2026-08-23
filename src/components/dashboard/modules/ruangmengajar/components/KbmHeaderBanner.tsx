import { useState } from "react";
import { Play, CheckCircle2, Clock, Calendar, Users, DoorOpen, Sparkles, CheckSquare, XCircle, BookOpen, Video, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface KbmHeaderBannerProps {
  activeRombel: string;
  activeMapel: string;
  activeTab?: string;
  onSelectTab?: (tab: "jurnal" | "presensi" | "materi" | "aktivitas" | "catatan_siswa" | "riwayat") => void;
  onStartSession?: () => void;
}

export function KbmHeaderBanner({ activeRombel, activeMapel, activeTab, onSelectTab, onStartSession }: KbmHeaderBannerProps) {
  const [isSessionLive, setIsSessionLive] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const handleToggleSession = () => {
    if (!isSessionLive && !sessionCompleted) {
      setIsSessionLive(true);
      toast.success(`🟢 Sesi KBM ${activeRombel} (${activeMapel}) RESMI DIMULAI! Selamat mengajar!`);
    } else if (isSessionLive) {
      setIsSessionLive(false);
      setSessionCompleted(true);
      toast.success(`🏁 Sesi KBM ${activeRombel} (${activeMapel}) RESMI DISELESAIKAN! Rekap KBM tersimpan.`);
    } else {
      setSessionCompleted(false);
      setIsSessionLive(true);
      toast.info(`Sesi KBM ${activeRombel} dibuka kembali.`);
    }
  };

  return (
    <Card className={`border-2 transition-all shadow-md ${
      isSessionLive
        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
        : sessionCompleted
        ? "border-blue-500/50 bg-blue-50/30 dark:bg-blue-950/20"
        : "border-primary/40 bg-card"
    }`}>
      <CardContent className="p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className={`font-extrabold text-xs px-3 py-1 gap-1.5 ${
                isSessionLive
                  ? "bg-emerald-600 text-white animate-pulse"
                  : sessionCompleted
                  ? "bg-blue-600 text-white"
                  : "bg-amber-600 text-white"
              }`}>
                {isSessionLive && <><Sparkles className="h-3.5 w-3.5" /> SESI KBM BERLANGSUNG (LIVE)</>}
                {sessionCompleted && <><CheckCircle2 className="h-3.5 w-3.5" /> SESI KBM SELESAI</>}
                {!isSessionLive && !sessionCompleted && <><Clock className="h-3.5 w-3.5" /> KBM SIAP DIMULAI</>}
              </Badge>

              <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1 font-mono">
                <Calendar className="h-3.5 w-3.5 text-primary" /> Senin, 24 Agustus 2026 · Jam ke-1–2 (07.30 - 09.00 WIB)
              </span>
            </div>

            <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
              <DoorOpen className="h-5 w-5 text-primary" /> {activeRombel} — {activeMapel}
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              30 Siswa Terdaftar · Ruang VII-A (Lantai 1) · Kurikulum Merdeka MTsN 2 Cilacap
            </p>
          </div>

          <Button
            size="lg"
            className={`font-black text-xs gap-2 px-6 py-3 shadow-md transition-all ${
              isSessionLive
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : sessionCompleted
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
            onClick={handleToggleSession}
          >
            {isSessionLive ? (
              <>
                <CheckCircle2 className="h-5 w-5" /> Selesaikan Sesi KBM
              </>
            ) : sessionCompleted ? (
              <>
                <Sparkles className="h-5 w-5" /> Buka Sesi KBM Kembali
              </>
            ) : (
              <>
                <Play className="h-5 w-5 fill-current" /> Mulai Sesi Mengajar Harian
              </>
            )}
          </Button>
        </div>

        {/* Guided 3-Step Workflow Bar */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
            Alur Terpandu Sesi KBM Harian:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => onSelectTab?.("presensi")}
              className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                activeTab === "presensi"
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-xs"
                  : "border-border bg-background hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <span className="font-bold text-xs block text-foreground">Langkah 1: Presensi Siswa</span>
                  <span className="text-[10px] text-muted-foreground">Isi kehadiran kelas (28/30 Hadir)</span>
                </div>
              </div>
              <Badge className="bg-emerald-600 text-white text-[9px] font-bold">✓ Hadir</Badge>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab?.("materi")}
              className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                activeTab === "materi" || activeTab === "aktivitas"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-xs"
                  : "border-border bg-background hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <span className="font-bold text-xs block text-foreground">Langkah 2: Materi & LKPD</span>
                  <span className="text-[10px] text-muted-foreground">Buka bahan ajar hari ini</span>
                </div>
              </div>
              <Badge className="bg-blue-600 text-white text-[9px] font-bold">2 Ready</Badge>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab?.("jurnal")}
              className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                activeTab === "jurnal"
                  ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 shadow-xs"
                  : "border-border bg-background hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <span className="font-bold text-xs block text-foreground">Langkah 3: Jurnal & Refleksi</span>
                  <span className="text-[10px] text-muted-foreground">Simpan ringkasan KBM</span>
                </div>
              </div>
              <Badge className="bg-amber-600 text-white text-[9px] font-bold">✓ Terisi</Badge>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
