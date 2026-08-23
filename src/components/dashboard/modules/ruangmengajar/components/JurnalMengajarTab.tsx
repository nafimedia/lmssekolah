import { Plus, BookOpen, Trash2, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    <Card className="border-border shadow-sm bg-card">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> Jurnal KBM & Sesi Mengajar Terstruktur
          </CardTitle>
          <CardDescription className="text-xs">
            Catatan resmi tatap muka {activeRombel} ({activeMapel}) — Pokok bahasan, TP, alur kegiatan, dan tindak lanjut.
          </CardDescription>
        </div>
        <Button size="sm" className="bg-primary text-primary-foreground font-bold text-xs gap-1" onClick={onOpenAddModal}>
          <Plus className="h-4 w-4" /> Tulis Jurnal KBM Sesi Ini
        </Button>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {journalList.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-border rounded-xl bg-muted/20 space-y-2">
            <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <h4 className="font-bold text-xs text-foreground">Belum Ada Catatan Jurnal KBM Sesi Ini</h4>
            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
              Belum ada jurnal mengajar tersimpan di database untuk {activeRombel} ({activeMapel}). Klik tombol <strong>"Tulis Jurnal KBM Sesi Ini"</strong> di atas untuk mencatat jurnal baru.
            </p>
          </div>
        ) : (
          journalList.map((j) => (
            <div key={j.id} className="p-4 rounded-xl border border-border bg-card hover:bg-muted/20 transition space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px] font-mono font-bold text-primary">
                    {j.date || j.tanggal || "24 Agustus 2026"}
                  </Badge>
                  <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                    {j.meeting || j.jam_ke || "Pertemuan KBM"}
                  </Badge>
                  <span className="text-xs font-bold text-foreground">{j.rombel || activeRombel} · {j.mapel || activeMapel}</span>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 shrink-0 self-end sm:self-center"
                  onClick={() => onDeleteJurnal(j.id, j.materi || j.topic || j.title)}
                  title="Hapus Jurnal"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-extrabold text-sm text-foreground">{j.materi || j.topic || j.title}</h4>
                {j.tujuan_pembelajaran && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-emerald-600" />
                    <span>TP: {j.tujuan_pembelajaran}</span>
                  </p>
                )}
              </div>

              {/* Notes */}
              {(j.notes || j.catatan) && (
                <div className="p-3 rounded-lg bg-muted/40 border border-border/70 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <span className="font-bold text-foreground">Catatan Observasi:</span> {j.notes || j.catatan}
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
