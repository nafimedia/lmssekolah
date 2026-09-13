import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, FileText, Library, ExternalLink, Download, Sparkles, CheckCircle2, Eye, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export interface MaterialDetail {
  id: string;
  title: string;
  type: "MODUL_AJAR" | "VIDEO" | "SLIDE_PPT" | "EBOOK" | string;
  chapter: string;
  source: string;
  content?: string;
  url?: string;
  file_url?: string;
  uploaded_by?: string;
}

interface ViewMaterialDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  material: MaterialDetail | null;
  activeRombel: string;
  activeMapel: string;
}

export function ViewMaterialDialog({
  isOpen,
  onOpenChange,
  material,
  activeRombel,
  activeMapel,
}: ViewMaterialDialogProps) {
  const [showEmbedOnMobile, setShowEmbedOnMobile] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowEmbedOnMobile(false);
    }
  }, [isOpen]);

  if (!material) return null;

  const targetUrl = material.file_url || material.url || "";
  const isPdfOrDoc = Boolean(
    targetUrl &&
      (targetUrl.toLowerCase().includes(".pdf") ||
        targetUrl.toLowerCase().includes("/uploads/") ||
        material.type === "MODUL_AJAR" ||
        material.type === "EBOOK")
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="border-b border-border pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] font-semibold gap-1">
              {material.type === "MODUL_AJAR" && <FileText className="h-3 w-3 text-emerald-600" />}
              {material.type === "VIDEO" && <Video className="h-3 w-3 text-blue-600" />}
              {material.type === "SLIDE_PPT" && <BookOpen className="h-3 w-3 text-amber-600" />}
              {material.type === "EBOOK" && <Library className="h-3 w-3 text-purple-600" />}
              {material.type}
            </Badge>

            <span className="text-xs text-muted-foreground font-mono">
              {activeMapel} · {activeRombel}
            </span>
          </div>

          <DialogTitle className="text-base sm:text-lg font-bold flex items-center justify-between gap-4">
            <span className="truncate">{material.title}</span>
          </DialogTitle>
          <DialogDescription className="text-xs truncate">
            {material.source} — {material.chapter}
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-4">
          {/* Video Player */}
          {material.type === "VIDEO" ? (
            <div className="space-y-3">
              <div className="aspect-video w-full rounded-xl bg-slate-900 flex flex-col items-center justify-center text-white p-6 relative overflow-hidden shadow-inner">
                <Video className="h-16 w-16 text-blue-400 mb-2 animate-bounce" />
                <h3 className="font-bold text-sm text-center px-4">{material.title}</h3>
                <p className="text-xs text-slate-300 mt-1">Video Pembelajaran Interaktif MTsN 2 Cilacap</p>
                <div className="mt-4 flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5"
                    onClick={() => {
                      toast.success("Memutar Video Pembelajaran KBM...");
                      if (material.url) window.open(material.url, "_blank");
                    }}
                  >
                    <ExternalLink className="h-4 w-4" /> Putar Video Fullscreen
                  </Button>
                </div>
              </div>
            </div>
          ) : material.type === "SLIDE_PPT" ? (
            /* Slide PPT */
            <div className="p-5 sm:p-6 rounded-xl border border-amber-300 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-semibold text-sm">
                <BookOpen className="h-5 w-5" /> Slide Presentasi Kurikulum Merdeka (PPTX)
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Slide dirancang untuk diproyeksikan pada layar Proyektor / Smart TV Ruang {activeRombel}. Berisi ringkasan konsep, peta materi, dan pemantik diskusi.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Button
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs gap-1.5"
                  onClick={() => toast.success("Menampilkan Slide Presentasi Proyektor...")}
                >
                  <Sparkles className="h-4 w-4" /> Tampilkan Slide Proyektor
                </Button>
                {targetUrl && (
                  <a
                    href={targetUrl}
                    download={`${material.title}.pptx`}
                    className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-muted h-8 px-3 text-xs font-semibold gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" /> Unduh Slide (PPTX)
                  </a>
                )}
              </div>
            </div>
          ) : isPdfOrDoc ? (
            /* Modul PDF / Dokumen Digital */
            <div className="space-y-3">
              {/* Bilah Ringkas Dokumen */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-muted/40 rounded-xl border border-border text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-foreground truncate">{material.title}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {targetUrl && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2.5 text-xs font-semibold gap-1 text-primary"
                        onClick={() => window.open(targetUrl, "_blank")}
                        title="Buka dokumen di tab baru"
                      >
                        <ExternalLink className="h-3 w-3" /> Buka Layar Penuh
                      </Button>
                      <a
                        href={targetUrl}
                        download={`${material.title}.pdf`}
                        className="inline-flex items-center justify-center rounded-md border border-emerald-500/40 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 h-7 px-2.5 text-xs font-semibold gap-1 transition-colors"
                        title="Unduh berkas jika dibutuhkan"
                      >
                        <Download className="h-3 w-3" /> Unduh Berkas
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Tampilan Ponsel (Mobile): Mencegah Auto-Download pada Android Chrome */}
              <div className="block md:hidden">
                {!showEmbedOnMobile ? (
                  <div className="p-5 rounded-xl border border-border bg-card flex flex-col items-center text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-xs">
                      <FileText className="h-7 w-7" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-foreground">{material.title}</h4>
                      <p className="text-[11px] text-muted-foreground">
                        {material.source || activeMapel} · {material.chapter || activeRombel}
                      </p>
                      {material.uploaded_by && (
                        <p className="text-[10px] text-muted-foreground">Pengunggah: {material.uploaded_by}</p>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-muted/30 p-2.5 rounded-lg border border-border/50 max-w-sm">
                      Dokumen siap dibaca langsung. Berkas tidak akan otomatis tersimpan di HP Anda kecuali Anda memilih tombol unduh.
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-1 w-full max-w-xs">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 flex-1"
                        onClick={() => window.open(targetUrl, "_blank")}
                      >
                        <Eye className="h-3.5 w-3.5" /> Baca Dokumen
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[11px] text-muted-foreground h-8 px-2"
                        onClick={() => setShowEmbedOnMobile(true)}
                        title="Tampilkan langsung di dalam dialog ini"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" /> Pratinjau Tersemat
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full rounded-xl border border-border bg-slate-900 overflow-hidden shadow-inner min-h-[400px]">
                    <iframe
                      src={targetUrl}
                      className="w-full h-[400px] rounded-xl border-0"
                      title={material.title}
                    />
                  </div>
                )}
              </div>

              {/* Tampilan Desktop: Tampil tersemat langsung tanpa download */}
              <div className="hidden md:block">
                <div className="relative w-full rounded-xl border border-border bg-slate-900 overflow-hidden shadow-inner min-h-[460px]">
                  <iframe
                    src={targetUrl}
                    className="w-full h-[480px] rounded-xl border-0"
                    title={material.title}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Materi Berupa Teks / Instruksi */
            <div className="p-5 rounded-xl border border-border bg-card space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <div className="font-semibold text-xs text-primary flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Berkas Bahan Ajar Digital ({activeMapel})
                </div>
                <Badge className="bg-emerald-600 text-white text-[10px] font-semibold gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Berkas Resmi
                </Badge>
              </div>

              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-1.5">
                  <p className="font-bold text-foreground text-sm">{material.title}</p>
                  <p className="text-muted-foreground font-mono text-[11px]">
                    {material.source || activeMapel} · {material.chapter || activeRombel}
                  </p>
                  {material.uploaded_by && (
                    <p className="text-muted-foreground text-[11px]">Penyusun: {material.uploaded_by}</p>
                  )}
                  {material.content && (
                    <p className="mt-2 text-foreground leading-relaxed pt-2 border-t border-border/50">
                      {material.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <Button variant="outline" size="sm" className="text-xs font-semibold" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>

          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5"
            onClick={() => {
              toast.success(`Materi "${material.title}" diset aktif untuk sesi KBM ${activeRombel}!`);
              onOpenChange(false);
            }}
          >
            <CheckCircle2 className="h-4 w-4" /> Gunakan Dalam Sesi KBM
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

