import { FileText, Download, Music, Image as ImageIcon, Globe, ExternalLink } from "lucide-react";
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

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
}

export function PreviewModulDialog({ previewModul, isOpen, onOpenChange, onDownload }: PreviewModulDialogProps) {
  if (!previewModul) return null;

  const type = (previewModul.type || "").toUpperCase();
  const fileUrl = previewModul.file_url || "";
  const fileName = previewModul.file_name || previewModul.filename || "";

  const isAudio = type.includes("AUDIO") || fileUrl.endsWith(".mp3") || fileUrl.endsWith(".wav") || fileUrl.endsWith(".m4a") || fileName.endsWith(".mp3");
  const isImage = type.includes("GAMBAR") || fileUrl.match(/\.(png|jpg|jpeg|webp)$/i) || fileName.match(/\.(png|jpg|jpeg|webp)$/i);
  const isUrl = type.includes("URL") || fileUrl.startsWith("http://") || fileUrl.startsWith("https://");
  const isOfficeDoc = fileUrl.match(/\.(docx|doc|pptx|ppt)$/i) || fileName.match(/\.(docx|doc|pptx|ppt)$/i);
  const ytEmbed = isUrl ? getYouTubeEmbedUrl(fileUrl) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl border-border bg-card p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-lg font-bold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {isAudio && <Music className="h-5 w-5 text-amber-600" />}
              {isImage && <ImageIcon className="h-5 w-5 text-purple-600" />}
              {isUrl && <Globe className="h-5 w-5 text-sky-600" />}
              {!isAudio && !isImage && !isUrl && <FileText className="h-5 w-5 text-emerald-600" />}
              <span>
                {isAudio && "Pratinjau Audio Pembelajaran"}
                {isImage && "Pratinjau Berkas Gambar / Media"}
                {isUrl && "Tautan Sumber Belajar Eksternal"}
                {!isAudio && !isImage && !isUrl && "Pratinjau Dokumen Bahan Ajar"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-bold">
                {previewModul.type || "Dokumen"}
              </Badge>
              <Badge className="bg-emerald-600 text-white font-mono text-xs">{previewModul?.jenjang}</Badge>
            </div>
          </DialogTitle>
          <DialogDescription className="text-xs">
            {previewModul?.title} ({previewModul?.mapel}) • Penyusun: {previewModul?.teacher}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Header Info Banner */}
          <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-border text-xs flex-wrap">
            <div className="space-y-0.5">
              <div className="font-bold text-foreground">{previewModul.title}</div>
              <div className="text-muted-foreground">
                Penyusun: {previewModul.teacher} • Ukuran: {previewModul.size || "-"}
              </div>
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

              {isUrl ? (
                <Button
                  size="sm"
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold gap-1.5"
                  onClick={() => window.open(fileUrl, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" /> Buka Tautan
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5"
                  onClick={() => onDownload(previewModul)}
                >
                  <Download className="h-4 w-4" /> Unduh Berkas
                </Button>
              )}
            </div>
          </div>

          {/* Media Body */}
          <div className="relative w-full rounded-xl border border-border bg-slate-900/90 overflow-hidden shadow-inner min-h-[300px] flex items-center justify-center p-4">
            {/* 1. AUDIO PLAYER */}
            {isAudio ? (
              <div className="w-full max-w-lg p-6 bg-card border border-border rounded-2xl shadow-xl text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                  <Music className="h-8 w-8 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{previewModul.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Berkas Audio MP3 ({previewModul.mapel})
                  </p>
                </div>
                {fileUrl ? (
                  <div className="pt-2">
                    <audio controls className="w-full h-10 rounded-lg shadow-sm" src={fileUrl}>
                      Browser Anda tidak mendukung pemutar audio.
                    </audio>
                  </div>
                ) : (
                  <p className="text-xs text-rose-500">Berkas audio belum tersedia di server.</p>
                )}
              </div>
            ) : isImage ? (
              /* 2. IMAGE VIEWER */
              <div className="w-full flex flex-col items-center justify-center">
                <img
                  src={fileUrl}
                  alt={previewModul.title}
                  className="max-h-[500px] max-w-full object-contain rounded-lg shadow-md"
                />
              </div>
            ) : isUrl ? (
              /* 3. URL / YOUTUBE VIEWER */
              ytEmbed ? (
                <iframe
                  src={ytEmbed}
                  className="w-full h-[450px] rounded-xl border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={previewModul.title}
                />
              ) : (
                <div className="w-full max-w-md p-8 bg-card border border-border rounded-2xl shadow-xl text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center">
                    <Globe className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{previewModul.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 break-all line-clamp-2">
                      {fileUrl}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold gap-1.5 w-full"
                    onClick={() => window.open(fileUrl, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" /> Buka Materi di Tab Baru
                  </Button>
                </div>
              )
            ) : isOfficeDoc ? (
              /* 4. OFFICE DOC (DOCX / PPTX) */
              <div className="w-full max-w-md p-8 bg-card border border-border rounded-2xl shadow-xl text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
                  <FileText className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{previewModul.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Dokumen Presentasi / Modul Office ({fileName || "Office File"})
                  </p>
                </div>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 w-full"
                  onClick={() => onDownload(previewModul)}
                >
                  <Download className="h-4 w-4" /> Unduh Dokumen ({previewModul.size || "Berkas"})
                </Button>
              </div>
            ) : fileUrl ? (
              /* 5. PDF VIEWER (IFRAME) */
              <iframe
                src={fileUrl}
                className="w-full h-[520px] rounded-xl border-0"
                title={previewModul.title}
              />
            ) : (
              <div className="p-12 text-center space-y-3">
                <div className="text-4xl">📄</div>
                <div className="text-sm font-bold text-slate-300">Berkas siap diunduh</div>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5"
                  onClick={() => onDownload(previewModul)}
                >
                  <Download className="h-4 w-4" /> Unduh Berkas
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
