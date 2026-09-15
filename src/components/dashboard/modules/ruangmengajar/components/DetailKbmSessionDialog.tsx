import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Save } from "lucide-react";
import { toast } from "sonner";
import { KbmHistoryItem } from "./RiwayatKbmSection";

interface DetailKbmSessionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sessionItem: KbmHistoryItem | null;
  isEditMode?: boolean;
  onSaveUpdatedTopic?: (
    id: string,
    updatedData: {
      topic: string;
      tujuan?: string;
      kegiatan?: string;
      kendala?: string;
    }
  ) => void;
}

export function DetailKbmSessionDialog({
  isOpen,
  onOpenChange,
  sessionItem,
  isEditMode = false,
  onSaveUpdatedTopic,
}: DetailKbmSessionDialogProps) {
  if (!sessionItem) return null;

  const [topic, setTopic] = useState(sessionItem.topic || "");
  const [tujuan, setTujuan] = useState(sessionItem.tujuan_pembelajaran || "");
  const [kegiatan, setKegiatan] = useState(sessionItem.kegiatan || "");
  const [kendala, setKendala] = useState(sessionItem.kendala || sessionItem.catatan || "");

  useEffect(() => {
    if (sessionItem) {
      setTopic(sessionItem.topic || "");
      setTujuan(sessionItem.tujuan_pembelajaran || "");
      setKegiatan(sessionItem.kegiatan || "");
      setKendala(sessionItem.kendala || sessionItem.catatan || "");
    }
  }, [sessionItem]);

  const handleSave = () => {
    if (onSaveUpdatedTopic) {
      onSaveUpdatedTopic(sessionItem.id, {
        topic,
        tujuan,
        kegiatan,
        kendala,
      });
    }
    toast.success(`✅ Jurnal KBM Tanggal ${sessionItem.date} berhasil disimpan!`);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b border-border pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-emerald-600 text-white font-semibold text-[10px] gap-1">
              <CheckCircle2 className="h-3 w-3" /> JURNAL VERIFIKASI
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              {sessionItem.rombel} · {sessionItem.mapel}
            </span>
          </div>

          <DialogTitle className="text-lg font-bold flex items-center justify-between gap-4">
            <span>{isEditMode ? "Edit Jurnal Sesi KBM" : "Detail Rincian Jurnal Sesi KBM"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Tanggal KBM: {sessionItem.date} · Presensi: {sessionItem.attendance}
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-foreground block">Materi / Pokok Bahasan:</label>
            {isEditMode ? (
              <Input
                placeholder="Materi pokok pembelajaran..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="text-xs font-normal"
              />
            ) : (
              <div className="p-3 rounded-lg bg-muted/50 border border-border font-semibold text-foreground">
                {topic || "-"}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground block">Tujuan Pembelajaran (TP):</label>
            {isEditMode ? (
              <Textarea
                placeholder="Tuliskan tujuan pembelajaran (TP)..."
                value={tujuan}
                onChange={(e) => setTujuan(e.target.value)}
                className="text-xs min-h-[70px] font-normal"
              />
            ) : (
              <div className="p-3 rounded-lg bg-muted/40 border border-border/80 text-muted-foreground">
                {tujuan || <span className="italic text-muted-foreground/60">(Belum diisi oleh guru)</span>}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground block">Alur Kegiatan KBM & Pembuka Sesi:</label>
            {isEditMode ? (
              <Textarea
                placeholder="Tuliskan alur kegiatan KBM..."
                value={kegiatan}
                onChange={(e) => setKegiatan(e.target.value)}
                className="text-xs min-h-[80px] font-mono font-normal"
              />
            ) : (
              <pre className="p-3 rounded-lg bg-muted/40 border border-border/80 text-slate-700 dark:text-slate-300 font-sans whitespace-pre-wrap">
                {kegiatan || <span className="italic text-muted-foreground/60">(Belum diisi oleh guru)</span>}
              </pre>
            )}
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground block">Catatan Kendala & Solusi Guru:</label>
            {isEditMode ? (
              <Input
                placeholder="Catatan kendala atau solusi jika ada..."
                value={kendala}
                onChange={(e) => setKendala(e.target.value)}
                className="text-xs font-normal"
              />
            ) : (
              <div className="p-3 rounded-lg bg-muted/30 border border-border text-foreground">
                {kendala || <span className="italic text-muted-foreground/60">(Tidak ada kendala / belum diisi)</span>}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <Button variant="outline" size="sm" className="text-xs font-semibold" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>

          {isEditMode && (
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5" onClick={handleSave}>
              <Save className="h-4 w-4" /> Simpan Perubahan Jurnal
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
