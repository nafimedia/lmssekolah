import { Plus, BookOpen, Trash2, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CatatanSiswaTab } from "./CatatanSiswaTab";

interface JurnalMengajarTabProps {
  journalList: any[];
  onOpenAddModal: () => void;
  onDeleteJurnal: (id: string, title: string) => void;
  activeRombel: string;
  activeMapel: string;
}

export function JurnalMengajarTab({
  journalList,
  onOpenAddModal,
  onDeleteJurnal,
  activeRombel,
  activeMapel,
}: JurnalMengajarTabProps) {
  return (
    <div className="space-y-4">
      {/* 1. Jurnal KBM Harian Card */}
      <Card className="border-border shadow-xs bg-card overflow-hidden">
        {/* Header Bersih & Ringkas (Clean UI Mobile-First) */}
        <div className="p-3 sm:p-4 border-b border-border flex items-center justify-between gap-2 bg-muted/15">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs sm:text-sm font-bold truncate text-foreground">
                  Jurnal Mengajar
                </h3>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-mono font-semibold">
                  {journalList.length}
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground truncate hidden sm:block">
                {activeMapel} · {activeRombel}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            className="h-8 px-2.5 text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            onClick={onOpenAddModal}
            title="Tulis Jurnal KBM Baru"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">+ Tulis Jurnal</span>
            <span className="sm:hidden">+ Jurnal</span>
          </Button>
        </div>

        <CardContent className="p-3 sm:p-4 space-y-3">
          {journalList.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-border rounded-xl bg-muted/20 space-y-2">
              <BookOpen className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <h4 className="font-bold text-xs text-foreground">Belum Ada Catatan Jurnal Sesi Ini</h4>
              <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                Belum ada jurnal mengajar untuk <strong>{activeRombel}</strong> ({activeMapel}).
              </p>
              <Button
                size="sm"
                variant="outline"
                className="text-xs font-semibold mt-1"
                onClick={onOpenAddModal}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Buat Jurnal Baru
              </Button>
            </div>
          ) : (
            journalList.map((j) => (
              <div key={j.id} className="p-3 sm:p-3.5 rounded-xl border border-border bg-card hover:bg-muted/15 transition space-y-2.5">
                <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <Badge variant="outline" className="text-[10px] font-mono font-semibold text-primary py-0 px-2">
                      {j.date || j.tanggal || "Hari Ini"}
                    </Badge>
                    <Badge className="bg-emerald-600 text-white font-semibold text-[10px] py-0 px-2">
                      {j.meeting || j.jam_ke || "Pertemuan KBM"}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground truncate hidden sm:inline">
                      {j.rombel || activeRombel} · {j.mapel || activeMapel}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                    onClick={() => onDeleteJurnal(j.id, j.materi || j.topic || j.title)}
                    title="Hapus Jurnal"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-foreground leading-snug">{j.materi || j.topic || j.title}</h4>
                  {j.tujuan_pembelajaran && (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <Target className="h-3 w-3 text-emerald-600 shrink-0" />
                      <span className="truncate">TP: {j.tujuan_pembelajaran}</span>
                    </p>
                  )}
                </div>

                {/* Notes */}
                {(j.notes || j.catatan) && (
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/70 text-[11px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    <span className="font-bold text-foreground">Catatan:</span> {j.notes || j.catatan}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 2. Catatan & Observasi Siswa KBM (Terintegrasi ke dalam Jurnal Mengajar) */}
      <CatatanSiswaTab activeRombel={activeRombel} activeMapel={activeMapel} />
    </div>
  );
}

