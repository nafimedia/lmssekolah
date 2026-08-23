import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, FileText, Library, ExternalLink, Download, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export interface MaterialDetail {
  id: string;
  title: string;
  type: "MODUL_AJAR" | "VIDEO" | "SLIDE_PPT" | "EBOOK" | string;
  chapter: string;
  source: string;
  content?: string;
  url?: string;
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
  if (!material) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b border-border pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] font-bold gap-1">
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

          <DialogTitle className="text-lg font-extrabold flex items-center justify-between gap-4">
            <span>{material.title}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            {material.source} — {material.chapter}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Content Viewer / Video Player / E-Book Reader */}
          {material.type === "VIDEO" ? (
            <div className="space-y-3">
              <div className="aspect-video w-full rounded-xl bg-slate-900 flex flex-col items-center justify-center text-white p-6 relative overflow-hidden shadow-inner">
                <Video className="h-16 w-16 text-blue-400 mb-2 animate-bounce" />
                <h3 className="font-bold text-sm text-center px-4">{material.title}</h3>
                <p className="text-xs text-slate-300 mt-1">Video Pembelajaran Interaktif MTsN 2 Cilacap</p>
                <div className="mt-4 flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5"
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
            <div className="p-6 rounded-xl border border-amber-300 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-sm">
                <BookOpen className="h-5 w-5" /> Slide Presentasi Kurikulum Merdeka (PPTX)
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Slide ini dirancang untuk diproyeksikan pada layar Proyektor / Smart TV Ruang {activeRombel}. Berisi diagram ringkasan konsep, peta materi, dan soal pemantik diskusi kelompok.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5"
                  onClick={() => toast.success("Menampilkan Slide Presentasi Proyektor...")}
                >
                  <Sparkles className="h-4 w-4" /> Tampilkan Slide Proyektor
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs font-bold gap-1.5"
                  onClick={() => toast.success("Mengunduh file PPTX...")}
                >
                  <Download className="h-4 w-4" /> Unduh Slide (PPTX)
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-border bg-card space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="font-bold text-xs text-primary flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Teks Rujukan & Modul Ajar Digital
                </div>
                <Badge className="bg-emerald-600 text-white text-[10px] font-bold gap-1">
                  <CheckCircle2 className="h-3 w-3" /> E-Book Verifikasi
                </Badge>
              </div>

              <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed space-y-3">
                <p className="font-bold text-foreground">A. Tujuan Pembelajaran & Alur Konsep:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                  <li>Peserta didik mampu memahami dan mendeskripsikan pengertian norma secara holistik.</li>
                  <li>Peserta didik mampu menganalisis pentingnya norma agama, kesusilaan, kesopanan, dan hukum dalam kehidupan bermasyarakat.</li>
                  <li>Peserta didik menunjukkan kebiasaan bersikap sopan dan patuh aturan di lingkungan madrasah dan tempat tinggal.</li>
                </ul>

                <p className="font-bold text-foreground mt-4">B. Ringkasan Uraian Materi:</p>
                <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
                  <p>
                    Norma merupakan kaidah atau aturan yang berlaku dalam masyarakat yang berisi perintah dan larangan untuk mengatur tingkah laku manusia. Tanpa norma, kehidupan bermasyarakat akan kehilangan keteraturan (anarki).
                  </p>
                  <p>
                    Dalam konteks madrasah, penerapan norma menciptakan lingkungan belajar yang aman, kondusif, berakhlaqul karimah, serta saling menghargai antarsesama warga sekolah.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <Button variant="outline" size="sm" className="text-xs font-bold" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>

          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
            onClick={() => {
              toast.success(`Materi "${material.title}" diset aktif untuk sesi KBM ${activeRombel}!`);
              onOpenChange(false);
            }}
          >
            <CheckCircle2 className="h-4 w-4" /> Gunakan Dalam Sesi KBM Ini
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
