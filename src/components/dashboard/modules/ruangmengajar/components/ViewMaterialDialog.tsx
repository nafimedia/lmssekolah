import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Video,
  FileText,
  Library,
  ExternalLink,
  Download,
  Sparkles,
  CheckCircle2,
  Eye,
  RefreshCw,
  Music,
  Image as ImageIcon,
  Globe,
  FileEdit,
  ListOrdered,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { MysqlDataService } from "@/services/mysqlDataService";

export interface MaterialDetail {
  id: string;
  title: string;
  type: "MODUL_AJAR" | "VIDEO" | "SLIDE_PPT" | "EBOOK" | "AUDIO" | "GAMBAR" | "URL" | "TEKS" | string;
  chapter: string;
  source: string;
  content?: string;
  content_text?: string;
  url?: string;
  file_url?: string;
  uploaded_by?: string;
  sequence_order?: number;
  access_mode?: "GURU_KONTROL" | "SISWA_MANDIRI" | string;
}

interface ViewMaterialDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  material: MaterialDetail | null;
  activeRombel: string;
  activeMapel: string;
  onMaterialCompleted?: () => void;
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
}

export function ViewMaterialDialog({
  isOpen,
  onOpenChange,
  material,
  activeRombel,
  activeMapel,
  onMaterialCompleted,
}: ViewMaterialDialogProps) {
  const [showEmbedOnMobile, setShowEmbedOnMobile] = useState(false);
  const [completions, setCompletions] = useState<any[]>([]);
  const [isCompletedByMe, setIsCompletedByMe] = useState(false);
  const [isMarkingDone, setIsMarkingDone] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(typeof window !== "undefined" && window.innerWidth >= 768);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const activeUser = MysqlAuthService.getActiveUser();
  const isSiswa = activeUser?.role === "siswa";

  useEffect(() => {
    if (isOpen && material) {
      setShowEmbedOnMobile(false);
      setIsCompletedByMe(false);

      MysqlDataService.getMaterialCompletions(material.id).then((list) => {
        if (list) {
          setCompletions(list);
          if (activeUser) {
            const userNisn = activeUser.nis_nip || activeUser.id;
            const matched = list.some(
              (c: any) =>
                c.student_nisn === userNisn ||
                (c.student_name && c.student_name.toLowerCase() === (activeUser.full_name || "").toLowerCase())
            );
            setIsCompletedByMe(matched);
          }
        } else {
          setCompletions([]);
        }
      });
    }
  }, [isOpen, material, activeUser]);

  if (!material) return null;

  const targetUrl = material.file_url || material.url || "";
  const typeStr = (material.type || "").toUpperCase();

  const isTeks = typeStr.includes("TEKS") || Boolean(material.content_text);
  const isAudio = typeStr.includes("AUDIO") || targetUrl.endsWith(".mp3") || targetUrl.endsWith(".wav") || targetUrl.endsWith(".m4a");
  const isImage = typeStr.includes("GAMBAR") || targetUrl.match(/\.(png|jpg|jpeg|webp)$/i);
  const isUrl = typeStr.includes("URL") || (targetUrl.startsWith("http") && !targetUrl.includes("/uploads/"));
  const ytEmbed = isUrl || typeStr.includes("VIDEO") ? getYouTubeEmbedUrl(targetUrl) : null;
  const isPdfOrDoc = Boolean(
    targetUrl &&
      (targetUrl.toLowerCase().includes(".pdf") ||
        targetUrl.toLowerCase().includes("/uploads/") ||
        material.type === "MODUL_AJAR" ||
        material.type === "EBOOK")
  );

  const handleMarkDone = async () => {
    if (!material || !activeUser) return;
    setIsMarkingDone(true);
    try {
      const res = await MysqlDataService.markMaterialCompleted({
        material_id: material.id,
        student_id: activeUser.id,
        student_nisn: activeUser.nis_nip || activeUser.id,
        student_name: activeUser.full_name || "Siswa",
      });
      if (res) {
        setIsCompletedByMe(true);
        toast.success(`🎉 Selamat! Anda telah menandai selesai materi "${material.title}". Langkah berikutnya terbuka!`);
        onMaterialCompleted?.();
      } else {
        toast.error("Gagal menandai selesai ke database.");
      }
    } catch (e) {
      toast.error("Terjadi kendala saat menyimpan status selesai.");
    } finally {
      setIsMarkingDone(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="border-b border-border pb-3">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {material.sequence_order && (
              <Badge className="bg-emerald-600 text-white font-mono text-[10px] px-1.5 py-0">
                Langkah #{material.sequence_order}
              </Badge>
            )}

            <Badge variant="outline" className="text-[10px] font-semibold gap-1">
              {isTeks && <FileEdit className="h-3 w-3 text-purple-600" />}
              {isAudio && <Music className="h-3 w-3 text-amber-600" />}
              {isImage && <ImageIcon className="h-3 w-3 text-purple-600" />}
              {isUrl && <Globe className="h-3 w-3 text-sky-600" />}
              {material.type === "MODUL_AJAR" && !isAudio && !isImage && !isUrl && !isTeks && <FileText className="h-3 w-3 text-emerald-600" />}
              {material.type === "VIDEO" && <Video className="h-3 w-3 text-blue-600" />}
              {material.type === "SLIDE_PPT" && <BookOpen className="h-3 w-3 text-amber-600" />}
              {material.type === "EBOOK" && <Library className="h-3 w-3 text-purple-600" />}
              {material.type}
            </Badge>

            <Badge
              variant="secondary"
              className={`text-[10px] px-1.5 py-0 font-medium ${
                material.access_mode === "SISWA_MANDIRI"
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
              }`}
            >
              {material.access_mode === "SISWA_MANDIRI" ? "🏡 Mandiri (PR)" : "🏫 Tatap Muka"}
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
          {/* 1. TEKS CATATAN LANGSUNG */}
          {isTeks ? (
            <div className="p-4 sm:p-5 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/30 dark:bg-purple-950/20 space-y-3">
              <div className="flex items-center justify-between border-b border-purple-200 dark:border-purple-900/40 pb-2">
                <h4 className="font-bold text-xs text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                  <FileEdit className="h-4 w-4 text-purple-600" /> Isi Catatan & Rangkuman Materi Pembelajaran
                </h4>
                <Badge variant="outline" className="text-[10px] border-purple-400 text-purple-700 dark:text-purple-300 font-mono">
                  Teks Ringkasan
                </Badge>
              </div>
              <div className="bg-card p-4 sm:p-5 rounded-xl border border-border shadow-2xs">
                <p className="text-xs sm:text-sm text-foreground whitespace-pre-wrap leading-relaxed font-sans">
                  {material.content_text || material.content || "Belum ada teks ringkasan materi."}
                </p>
              </div>
            </div>
          ) : isAudio ? (
            /* 2. AUDIO PLAYER */
            <div className="p-5 sm:p-6 rounded-2xl border border-amber-300 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
                  <Music className="h-6 w-6 animate-pulse" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-foreground truncate">{material.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    Audio Pembelajaran KBM ({activeMapel}) · Ruang {activeRombel}
                  </p>
                </div>
              </div>

              {targetUrl ? (
                <div className="bg-background/80 p-3 rounded-xl border border-border/80 shadow-xs space-y-2">
                  <audio controls className="w-full h-10 rounded-md" src={targetUrl}>
                    Browser tidak mendukung pemutar audio langsung.
                  </audio>
                  <p className="text-[10px] text-muted-foreground text-center">
                    Gunakan pemutar di atas untuk mendengarkan bacaan tartil, makharijul huruf, atau materi listening.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-rose-500">Berkas audio belum diunggah.</p>
              )}

              {targetUrl && (
                <div className="flex justify-end gap-2 pt-1">
                  <a
                    href={targetUrl}
                    download={`${material.title}.mp3`}
                    className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-muted h-8 px-3 text-xs font-semibold gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" /> Unduh Audio (MP3)
                  </a>
                </div>
              )}
            </div>
          ) : isImage ? (
            /* 3. IMAGE VIEWER */
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-slate-900/90 overflow-hidden flex items-center justify-center p-3">
                <img
                  src={targetUrl}
                  alt={material.title}
                  className="max-h-[480px] max-w-full object-contain rounded-lg shadow-md"
                />
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
                <span>Media Gambar / Infografis KBM</span>
                {targetUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs font-semibold gap-1"
                    onClick={() => window.open(targetUrl, "_blank")}
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Buka Layar Penuh
                  </Button>
                )}
              </div>
            </div>
          ) : ytEmbed ? (
            /* 4. YOUTUBE EMBED PLAYER */
            <div className="space-y-3">
              <div className="aspect-video w-full rounded-xl border border-border bg-slate-900 overflow-hidden shadow-inner">
                <iframe
                  src={ytEmbed}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={material.title}
                />
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
                <span>Video Pembelajaran YouTube</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs font-semibold gap-1"
                  onClick={() => window.open(targetUrl, "_blank")}
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Buka di YouTube
                </Button>
              </div>
            </div>
          ) : isUrl ? (
            /* 5. URL WEB EXTERNAL */
            <div className="p-6 rounded-2xl border border-sky-300 dark:border-sky-900/60 bg-sky-50/40 dark:bg-sky-950/20 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/15 text-sky-600 mx-auto flex items-center justify-center shadow-xs">
                <Globe className="h-7 w-7" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">{material.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 break-all max-w-md mx-auto">
                  {targetUrl}
                </p>
              </div>
              <div className="pt-2">
                <Button
                  size="sm"
                  className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs gap-1.5"
                  onClick={() => window.open(targetUrl, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" /> Buka Tautan Sumber Belajar
                </Button>
              </div>
            </div>
          ) : material.type === "VIDEO" && targetUrl ? (
            /* 6. MP4 VIDEO PLAYER */
            <div className="space-y-3">
              <div className="aspect-video w-full rounded-xl bg-black overflow-hidden shadow-inner flex items-center justify-center">
                <video controls className="w-full h-full" src={targetUrl}>
                  Browser Anda tidak mendukung pemutar video HTML5.
                </video>
              </div>
            </div>
          ) : material.type === "SLIDE_PPT" ? (
            /* 7. SLIDE PPT */
            <div className="p-5 sm:p-6 rounded-xl border border-amber-300 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-semibold text-sm">
                <BookOpen className="h-5 w-5" /> Slide Presentasi Kurikulum Merdeka (PPTX)
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Slide dirancang untuk diproyeksikan pada layar Proyektor / Smart TV Ruang {activeRombel}. Berisi ringkasan konsep, peta materi, dan pemantik diskusi.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-2">
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
            /* 8. MODUL PDF / DOKUMEN DIGITAL */
            <div className="space-y-3">
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

              {/* Tampilan Ponsel (Mobile) - Tidak memuat tag iframe untuk mencegah download otomatis di Android Chrome */}
              {!isDesktop ? (
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
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1 w-full max-w-xs">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 w-full sm:flex-1"
                      onClick={() => window.open(targetUrl, "_blank")}
                    >
                      <Eye className="h-3.5 w-3.5" /> Buka Dokumen
                    </Button>
                    <a
                      href={targetUrl}
                      download={`${material.title}.pdf`}
                      className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-muted h-8 px-3 text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground w-full sm:w-auto transition-colors"
                      title="Unduh berkas fisik"
                    >
                      <Download className="h-3.5 w-3.5" /> Unduh Berkas
                    </a>
                  </div>
                </div>
              ) : (
                /* Tampilan Desktop - Pratinjau Dokumen Tersemat */
                <div className="relative w-full rounded-xl border border-border bg-slate-900 overflow-hidden shadow-inner min-h-[460px]">
                  <iframe
                    src={targetUrl}
                    className="w-full h-[480px] rounded-xl border-0"
                    title={material.title}
                  />
                </div>
              )}
            </div>
          ) : (
            /* Fallback Text */
            <div className="p-5 rounded-xl border border-border bg-card space-y-3">
              <p className="font-bold text-foreground text-sm">{material.title}</p>
              {material.content && (
                <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                  {material.content}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer dengan Tombol Tindakan & 'Tandai Selesai' untuk Siswa */}
        <div className="flex flex-wrap items-center justify-between border-t border-border pt-3 gap-2">
          <Button variant="outline" size="sm" className="text-xs font-semibold" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>

          <div className="flex items-center gap-2">
            {isSiswa ? (
              material.access_mode === "SISWA_MANDIRI" ? (
                isCompletedByMe ? (
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs gap-1.5 py-1.5 px-3 border border-emerald-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Anda Sudah Menyelesaikan Materi Ini
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 cursor-pointer shadow-xs"
                    onClick={handleMarkDone}
                    disabled={isMarkingDone}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Tandai Selesai (Buka Langkah Berikutnya)
                  </Button>
                )
              ) : (
                <Badge variant="secondary" className="text-xs font-medium bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  🏫 Sesi Pembelajaran Terpandu Guru
                </Badge>
              )
            ) : (
              /* Tampilan Guru */
              <div className="flex items-center gap-2">
                {completions.length > 0 && (
                  <Badge variant="outline" className="text-xs font-semibold border-emerald-400 text-emerald-700 dark:text-emerald-300 gap-1">
                    <Users className="h-3 w-3" /> {completions.length} Siswa Telah Selesai
                  </Badge>
                )}
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
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
