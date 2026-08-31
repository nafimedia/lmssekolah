import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteModulDialogProps {
  deleteConfirmModul: { id: string; title: string } | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: (id: string, title: string) => void;
}

export function DeleteModulDialog({ deleteConfirmModul, isOpen, onOpenChange, onConfirmDelete }: DeleteModulDialogProps) {
  if (!deleteConfirmModul) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-rose-500/30 bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <Trash2 className="h-5 w-5 shrink-0" /> Konfirmasi Penghapusan Bahan Ajar
          </DialogTitle>
          <DialogDescription className="text-xs pt-1 leading-relaxed text-muted-foreground">
            Apakah Anda yakin ingin menghapus berkas Bahan Ajar <strong className="text-foreground">&quot;{deleteConfirmModul?.title}&quot;</strong>?
            Tindakan ini akan menghapus berkas dari sistem dan tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 pt-3 border-t border-border mt-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            type="button"
            size="sm"
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold gap-1.5"
            onClick={() => {
              onConfirmDelete(deleteConfirmModul.id, deleteConfirmModul.title);
              onOpenChange(false);
            }}
          >
            <Trash2 className="h-4 w-4" /> Ya, Hapus Berkas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
