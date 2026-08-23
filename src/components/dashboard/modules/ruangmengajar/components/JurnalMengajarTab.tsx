import { Plus, BookOpen, Trash2 } from "lucide-react";
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
            <BookOpen className="h-5 w-5 text-primary" /> Jurnal KBM & Sesi Mengajar Harian
          </CardTitle>
          <CardDescription className="text-xs">
            Catatan resmi tatap muka {activeRombel} ({activeMapel}).
          </CardDescription>
        </div>
        <Button size="sm" className="bg-primary text-primary-foreground font-bold text-xs gap-1" onClick={onOpenAddModal}>
          <Plus className="h-4 w-4" /> Tambah Jurnal KBM
        </Button>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {journalList.map((j) => (
          <div key={j.id} className="p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px] font-mono font-bold text-primary">
                  {j.date || "Hari Ini"}
                </Badge>
                <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                  {j.meeting || "Pertemuan KBM"}
                </Badge>
              </div>
              <div className="font-bold text-sm text-foreground">{j.topic || j.title}</div>
              {j.notes && <p className="text-xs text-muted-foreground">{j.notes}</p>}
            </div>

            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 shrink-0 self-end sm:self-center"
              onClick={() => onDeleteJurnal(j.id, j.topic || j.title)}
              title="Hapus Jurnal"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
