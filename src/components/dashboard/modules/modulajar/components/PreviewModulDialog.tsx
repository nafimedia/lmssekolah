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
          <div className="p-4 bg-muted/40 rounded-xl border border-border flex items-center justify-between text-xs">
            <div className="space-y-1">
              <div className="font-bold text-foreground">{previewModul.title}</div>
              <div className="text-muted-foreground">Mapel: {previewModul.mapel} • Jenjang: {previewModul.jenjang}</div>
            </div>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5" onClick={() => onDownload(previewModul)}>
              <Download className="h-4 w-4" /> Unduh Berkas PDF
            </Button>
          </div>

          <div className="border border-border rounded-xl p-8 bg-card text-center space-y-3">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-emerald-500/15 text-emerald-600 grid place-items-center font-bold text-3xl">
              📄
            </div>
            <h3 className="font-bold text-base text-foreground">{previewModul.title}</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Dokumen digital resmi Kurikulum Merdeka MTsN 2 Cilacap. Berkas siap diunduh atau digenerate dalam format PDF standar.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <Badge variant="outline" className="text-xs font-mono">Size: {previewModul.size}</Badge>
              <Badge variant="outline" className="text-xs font-mono text-emerald-600 border-emerald-500/40">Status: {previewModul.status}</Badge>
            </div>
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
