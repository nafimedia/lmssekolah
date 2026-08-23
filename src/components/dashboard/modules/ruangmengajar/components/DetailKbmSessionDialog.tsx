import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Calendar, Clock, CheckCircle2, UserCheck, Edit, Save, FileText } from "lucide-react";
import { toast } from "sonner";
import { KbmHistoryItem } from "./RiwayatKbmSection";

interface DetailKbmSessionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sessionItem: KbmHistoryItem | null;
  isEditMode?: boolean;
  onSaveUpdatedTopic?: (id: string, newTopic: string) => void;
}

export function DetailKbmSessionDialog({
  isOpen,
  onOpenChange,
  sessionItem,
  isEditMode = false,
  onSaveUpdatedTopic,
}: DetailKbmSessionDialogProps) {
  if (!sessionItem) return null;

  const [topic, setTopic] = useState(sessionItem.topic);
  const [tujuan, setTujuan] = useState("Siswa memahami norma agama, kesusilaan, kesopanan, dan hukum dalam kehidupan bermasyarakat.");
  const [kegiatan, setKegiatan] = useState("1. Presensi & apersepsi (10m)\n2. Diskusi studi kasus (40m)\n3. Refleksi & penutupan (20m)");
  const [kendala, setKendala] = useState("Seluruh siswa aktif berdiskusi. 2 siswa izin ke UKS.");

  const handleSave = () => {
    if (onSaveUpdatedTopic) {
      onSaveUpdatedTopic(sessionItem.id, topic);
    }
    toast.success(`✅ Jurnal KBM Tanggal ${sessionItem.date} berhasil diperbarui di Database!`);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b border-border pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-emerald-600 text-white font-bold text-[10px] gap-1">
              <CheckCircle2 className="h-3 w-3" /> JURNAL VERIFIKASI
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              {sessionItem.rombel} · {sessionItem.mapel}
            </span>
          </div>

          <DialogTitle className="text-lg font-extrabold flex items-center justify-between gap-4">
            <span>{isEditMode ? "Edit Jurnal Sesi KBM" : "Detail Rincian Jurnal Sesi KBM"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Tanggal KBM: {sessionItem.date} · Presensi: {sessionItem.attendance}
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-foreground block">Materi / Pokok Bahasan:</label>
            {isEditMode ? (
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="text-xs font-bold"
              />
            ) : (
              <div className="p-3 rounded-lg bg-muted/50 border border-border font-bold text-foreground">
                {topic}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="font-bold text-foreground block">Tujuan Pembelajaran (TP):</label>
            {isEditMode ? (
              <Textarea
                value={tujuan}
                onChange={(e) => setTujuan(e.target.value)}
                className="text-xs min-h-[70px]"
              />
            ) : (
              <div className="p-3 rounded-lg bg-muted/40 border border-border/80 text-muted-foreground">
                {tujuan}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="font-bold text-foreground block">Alur Kegiatan KBM & Pembuka Sesi:</label>
            {isEditMode ? (
              <Textarea
                value={kegiatan}
                onChange={(e) => setKegiatan(e.target.value)}
                className="text-xs min-h-[80px] font-mono"
              />
            ) : (
              <pre className="p-3 rounded-lg bg-muted/40 border border-border/80 text-slate-700 dark:text-slate-300 font-sans whitespace-pre-wrap">
                {kegiatan}
              </pre>
            )}
          </div>

          <div className="space-y-1">
            <label className="font-bold text-foreground block">Catatan Kendala & Solusi Guru:</label>
            {isEditMode ? (
              <Input
                value={kendala}
                onChange={(e) => setKendala(e.target.value)}
                className="text-xs"
              />
            ) : (
              <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300">
                {kendala}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <Button variant="outline" size="sm" className="text-xs font-bold" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>

          {isEditMode && (
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5" onClick={handleSave}>
              <Save className="h-4 w-4" /> Simpan Perubahan Jurnal
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
