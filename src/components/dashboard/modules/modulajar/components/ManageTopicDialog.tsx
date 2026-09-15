import { useState, useEffect } from "react";
import { FolderPlus, Layers, Save, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LearningTopicRow } from "@/services/mysqlDataService";

interface ManageTopicDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  topicToEdit?: LearningTopicRow | null;
  activeMapel: string;
  activeJenjang: string;
  onSave: (payload: { id?: string; title: string; description: string; sequence_order: number }) => Promise<void>;
}

export function ManageTopicDialog({
  isOpen,
  onOpenChange,
  topicToEdit,
  activeMapel,
  activeJenjang,
  onSave,
}: ManageTopicDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sequenceOrder, setSequenceOrder] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (topicToEdit) {
      setTitle(topicToEdit.title || "");
      setDescription(topicToEdit.description || "");
      setSequenceOrder(topicToEdit.sequence_order || 1);
    } else {
      setTitle("");
      setDescription("");
      setSequenceOrder(1);
    }
  }, [topicToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        id: topicToEdit?.id,
        title: title.trim(),
        description: description.trim(),
        sequence_order: Number(sequenceOrder) || 1,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <FolderPlus className="h-5 w-5 text-emerald-600" />
            {topicToEdit ? "Perbarui Bab / Topik Pembelajaran" : "Tambah Bab / Topik Baru"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Kelompokkan bahan ajar untuk mata pelajaran <strong>{activeMapel}</strong> ({activeJenjang}).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Judul Bab / Capaian Pembelajaran <span className="text-rose-500">*</span></Label>
            <Input
              required
              placeholder="Contoh: Bab 1 - Bilangan Bulat dan Pecahan"
              className="text-xs h-9"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Nomor Urut Bab</Label>
            <Input
              type="number"
              min={1}
              max={99}
              className="text-xs h-9 w-28"
              value={sequenceOrder}
              onChange={(e) => setSequenceOrder(Number(e.target.value) || 1)}
            />
            <p className="text-[10px] text-muted-foreground">Urutan penampilan bab pada daftar bahan ajar.</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Deskripsi / Tujuan Pembelajaran (Opsional)</Label>
            <Textarea
              placeholder="Tuliskan ringkasan materi pokok atau capaian pembelajaran pada bab ini..."
              className="text-xs min-h-[70px] resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter className="gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !title.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              {isSubmitting ? "Menyimpan..." : topicToEdit ? "Simpan Perubahan" : "Buat Bab Baru"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
