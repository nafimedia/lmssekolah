import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Clock,
  Info,
  MapPin,
  Building2,
  CalendarCheck,
  Moon,
} from "lucide-react";
import type { AgendaItem } from "../AgendaKalenderModule";
import { getHijriDate, getPasaranJawa } from "@/utils/hijriJawaHelper";

interface DetailAgendaDialogProps {
  agenda: AgendaItem | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DetailAgendaDialog({
  agenda,
  isOpen,
  onOpenChange,
}: DetailAgendaDialogProps) {
  if (!agenda) return null;

  // Hitung data pasaran dan hijriah dari rawDate jika ada
  let dayName = "";
  let fullDateDisplay = agenda.date || agenda.rawDate;
  let pasaranName = "";
  let hijriStr = agenda.hijriDateStr || "";

  if (agenda.rawDate) {
    const d = new Date(agenda.rawDate);
    if (!isNaN(d.getTime())) {
      dayName = d.toLocaleDateString("id-ID", { weekday: "long" });
      fullDateDisplay = `${dayName}, ${d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}`;
      pasaranName = getPasaranJawa(d);
      if (!hijriStr) {
        const hijri = getHijriDate(d);
        hijriStr = `${hijri.day} ${hijri.monthName} ${hijri.year} H`;
      }
    }
  }

  const isLibur =
    agenda.category === "libur" || agenda.badge?.includes("Libur");
  const isCbt = agenda.category === "cbt";
  const isCuti = agenda.category === "cuti" || agenda.badge?.includes("Cuti");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-border bg-card shadow-xl p-0 overflow-hidden">
        {/* Header dengan latar aksen */}
        <div
          className={`p-5 border-b ${
            isLibur
              ? "bg-red-500/10 border-red-200 dark:border-red-950"
              : isCbt
              ? "bg-blue-500/10 border-blue-200 dark:border-blue-950"
              : "bg-emerald-500/10 border-emerald-200 dark:border-emerald-950"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className={`text-xs font-bold px-2.5 py-0.5 border ${
                isLibur
                  ? "border-red-300 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300"
                  : isCbt
                  ? "border-blue-300 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                  : isCuti
                  ? "border-amber-300 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                  : "border-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
              }`}
            >
              {agenda.badge || "Agenda Kegiatan"}
            </Badge>
            {agenda.isSchoolAgenda ? (
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3" /> Agenda Internal MTsN 2 Cilacap
              </span>
            ) : (
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <CalendarCheck className="h-3 w-3" /> Kalender Resmi Pemerintah RI / Kemenag
              </span>
            )}
          </div>

          <DialogTitle className="text-lg sm:text-xl font-bold text-foreground leading-snug">
            {agenda.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Informasi lengkap penanggalan masehi, hijriah, pasaran jawa, dan catatan agenda.
          </DialogDescription>
        </div>

        {/* Isi Rincian */}
        <div className="p-5 space-y-4">
          {/* Card Waktu & Kalender 3-in-1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-border/80 bg-muted/20 space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Kalender Masehi
              </span>
              <p className="text-sm font-black text-foreground">
                {fullDateDisplay}
              </p>
            </div>

            <div className="p-3 rounded-lg border border-border/80 bg-muted/20 space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                <Moon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                Hijriah & Pasaran Jawa
              </span>
              <p className="text-sm font-black text-foreground">
                {hijriStr || "—"}
                {pasaranName && (
                  <span className="ml-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    ({pasaranName})
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Deskripsi / Keterangan */}
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-primary" /> Keterangan / Deskripsi
            </span>
            <div className="p-3.5 rounded-lg border border-border/60 bg-muted/10 text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal">
              {agenda.desc || "Tidak ada rincian tambahan untuk agenda ini."}
            </div>
          </div>

          {/* Status Penyelenggara */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1 pt-1">
            <span>ID Agenda: <code className="font-mono text-[10px]">{agenda.id}</code></span>
            <span>{agenda.isSchoolAgenda ? "Tersimpan di Real MySQL" : "Standar Nasional Kemenag RI"}</span>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 border-t border-border bg-muted/20 sm:justify-end">
          <Button
            type="button"
            variant="default"
            size="sm"
            className="font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => onOpenChange(false)}
          >
            Tutup Informasi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
