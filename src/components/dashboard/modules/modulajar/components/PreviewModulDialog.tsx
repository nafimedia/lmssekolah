import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PreviewModulDialogProps {
  previewModul: any | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (modul: any) => void;
}

export function PreviewModulDialog({ previewModul, isOpen, onOpenChange, onDownload }: PreviewModulDialogProps) {
  if (!previewModul) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl border-border bg-card p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-lg font-bold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" /> Pratinjau Berkas PDF Modul Ajar
            </div>
            <Badge className="bg-emerald-600 text-white font-mono text-xs">{previewModul?.jenjang}</Badge>
          </DialogTitle>
          <DialogDescription className="text-xs">
            {previewModul?.title} ({previewModul?.mapel}) • Penyusun: {previewModul?.teacher}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-border text-xs">
            <div className="space-y-0.5">
              <div className="font-bold text-foreground">{previewModul.title}</div>
              <div className="text-muted-foreground">Penyusun: {previewModul.teacher} • Ukuran: {previewModul.size}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  previewModul.status === "Terverifikasi Waka"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold border-emerald-500/40"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold border-amber-500/40"
                }
              >
                Status: {previewModul.status || "Menunggu Verifikasi Waka"}
              </Badge>

              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5" onClick={() => onDownload(previewModul)}>
                <Download className="h-4 w-4" /> Unduh Berkas PDF
              </Button>
            </div>
          </div>

          <div className="relative w-full rounded-xl border border-border bg-slate-900 overflow-hidden shadow-inner min-h-[500px]">
            {previewModul.file_url ? (
              <iframe
                src={previewModul.file_url}
                className="w-full h-[520px] rounded-xl border-0"
                title={previewModul.title}
              />
            ) : (
              <div className="p-12 text-center space-y-3">
                <div className="text-4xl">📄</div>
                <div className="text-sm font-bold text-slate-300">Berkas PDF siap diunduh</div>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5" onClick={() => onDownload(previewModul)}>
                  <Download className="h-4 w-4" /> Unduh Berkas PDF
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Tutup Reader
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
