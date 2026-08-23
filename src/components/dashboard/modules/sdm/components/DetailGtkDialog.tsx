import { useState, useEffect } from "react";
import { Users, FileCheck, ShieldCheck, Printer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { GtkItem } from "../SdmGtkModule";
import { GtkDocumentRow } from "@/services/mysqlDataService";

interface DetailGtkDialogProps {
  selectedGtk: GtkItem | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  gtkDocs: GtkDocumentRow[];
}

export function DetailGtkDialog({ selectedGtk, isOpen, onOpenChange, gtkDocs }: DetailGtkDialogProps) {
  const [docsList, setDocsList] = useState<GtkDocumentRow[]>([]);

  useEffect(() => {
    setDocsList(gtkDocs || []);
  }, [gtkDocs]);

  if (!selectedGtk) return null;

  const handleDeleteDoc = (docId: string, docName: string) => {
    setDocsList((prev) => prev.filter((d) => d.id !== docId));
    toast.success(`Berkas SK "${docName}" berhasil dihapus!`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl border-border bg-card">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-lg font-bold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Profil & Dokumen Digital Pegawai GTK
            </div>
            <Badge className="bg-primary text-primary-foreground font-mono text-xs">{selectedGtk.statusKepegawaian}</Badge>
          </DialogTitle>
          <DialogDescription className="text-xs">
            {selectedGtk.name} • NIP: {selectedGtk.nip}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          <div className="p-3.5 bg-muted/40 rounded-xl border border-border space-y-2">
            <div className="font-bold text-sm text-foreground">{selectedGtk.name}</div>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <div>Pangkat/Golongan: <strong className="text-foreground">{selectedGtk.golongan}</strong></div>
              <div>Beban Mengajar: <strong className="text-primary font-mono">{selectedGtk.totalJp} JP/Minggu</strong></div>
              <div>Mapel Utama: <strong className="text-foreground">{selectedGtk.mapelUtama}</strong></div>
              <div>Tunjangan Profesi (TPG): <strong className="text-emerald-600">{selectedGtk.isSertifikasi ? "Sudah Sertifikasi" : "Belum Sertifikasi"}</strong></div>
              <div>Tugas Tambahan: <strong className="text-foreground">{selectedGtk.tugasTambahan}</strong></div>
              <div>No. WhatsApp: <strong className="text-foreground font-mono">{selectedGtk.phone}</strong></div>
            </div>
          </div>

          <div>
            <div className="font-bold text-xs text-foreground mb-2 flex items-center gap-1.5">
              <FileCheck className="h-4 w-4 text-emerald-500" /> Dokumen Kepegawaian & SK Resmi (MySQL Storage):
            </div>
            <div className="space-y-2">
              {docsList.length === 0 ? (
                <div className="p-3 border border-dashed rounded-lg text-center text-muted-foreground">Belum ada file SK terunggah</div>
              ) : (
                docsList.map((doc) => (
                  <div key={doc.id} className="p-2.5 rounded-lg border border-border bg-card flex items-center justify-between">
                    <div>
                      <div className="font-bold text-foreground">{doc.doc_name}</div>
                      <div className="text-[10px] text-muted-foreground">Kategori: {doc.category || "SK Resmi"} • Diunggah: {doc.created_at || "Baru"}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                        ✓ Sah Terverifikasi
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-rose-600 hover:bg-rose-500/10"
                        onClick={() => handleDeleteDoc(doc.id, doc.doc_name || "Dokumen SK")}
                        title="Hapus Berkas SK ini"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border flex justify-between items-center w-full">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button type="button" size="sm" className="bg-primary text-primary-foreground font-bold gap-1.5" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Cetak Bio GTK PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
