import { AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteUserDialogProps {
  user: { id: string; full_name: string; email: string; nis: string; roles: string[] } | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

export function DeleteUserDialog({ user, isOpen, onOpenChange, onConfirmDelete }: DeleteUserDialogProps) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-600" /> Konfirmasi Penghapusan Akun
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Apakah Anda yakin ingin menghapus akun pengguna ini dari sistem LMS secara permanen?
          </DialogDescription>
        </DialogHeader>

        <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-xs space-y-1.5 my-2">
          <div><span className="font-semibold text-muted-foreground">Nama Pengguna:</span> <strong className="text-foreground">{user.full_name}</strong></div>
          <div><span className="font-semibold text-muted-foreground">Email / Username:</span> <code className="font-mono text-foreground">{user.email}</code></div>
          <div><span className="font-semibold text-muted-foreground">NIP / NISN:</span> <code className="font-mono text-foreground">{user.nis}</code></div>
          <div>
            <span className="font-semibold text-muted-foreground">Role Saat Ini:</span>{" "}
            <span className="font-semibold uppercase text-rose-600 dark:text-rose-400">{user.roles.join(", ")}</span>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white font-bold gap-1.5" onClick={onConfirmDelete}>
            <Trash2 className="h-4 w-4" /> Ya, Hapus Pengguna
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
