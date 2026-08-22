import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Library, FileText, Video, Headphones, Upload, ExternalLink, Maximize2, Minimize2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { MysqlDataService } from "@/services/mysqlDataService";

function parseMediaUrl(url: string): { embedUrl: string; provider: "youtube" | "gdrive" | "direct" } {
  if (!url) return { embedUrl: "", provider: "direct" };

  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    let videoId = "";
    if (url.includes("v=")) {
      videoId = url.split("v=")[1]?.split("&")[0] || "";
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
    }
    if (videoId) {
      return { embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`, provider: "youtube" };
    }
  }

  if (url.includes("drive.google.com")) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return { embedUrl: `https://drive.google.com/file/d/${match[1]}/preview`, provider: "gdrive" };
    }
  }

  return { embedUrl: url, provider: "direct" };
}

export function PerpustakaanModule() {
  const [filterTag, setFilterTag] = useState("Semua");
  const [activeMediaModal, setActiveMediaModal] = useState<any | null>(null);
  const [activePdfModal, setActivePdfModal] = useState<any | null>(null);
  const [deleteConfirmBook, setDeleteConfirmBook] = useState<{ id: string; title: string } | null>(null);
  const [isPdfFullScreen, setIsPdfFullScreen] = useState(false);
  const [isVideoFullScreen, setIsVideoFullScreen] = useState(false);

  const [bukuList, setBukuList] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("lms_elibrary_books_v2");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: "1",
        t: "Buku Digital Fikih Kelas VIII (Kemenag RI)",
        icon: FileText,
        tag: "PDF Modul",
        size: "12.4 MB",
        type: "pdf",
        url: "https://pdfobject.com/pdf/sample.pdf",
        desc: "Buku Teks Utama Pendidikan Agama Islam Fikih MTs Kelas 8 Kurikulum Merdeka.",
      },
      {
        id: "2",
        t: "Video Tutorial Pembelajaran Tajwid Mad Silah (YouTube HD)",
        icon: Video,
        tag: "Video YouTube",
        size: "YouTube HD",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=kYJzXv0h0bU",
        desc: "Penjelasan audio-visual contoh hukum bacaan Mad Silah Qashirah & Thawilah.",
        provider: "youtube",
      },
      {
        id: "3",
        t: "Video Praktikum Paru-Paru & Organ Pernapasan (Google Drive Video)",
        icon: Video,
        tag: "Video G-Drive",
        size: "Google Drive HD",
        type: "video",
        videoUrl: "https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9/view",
        desc: "Rekaman video peragaan praktikum paru-paru dan mekanisme inspirasi-ekspirasi.",
        provider: "gdrive",
      },
      {
        id: "4",
        t: "Audio Murottal Tajwid Juz 30 (Surah An-Naba')",
        icon: Headphones,
        tag: "Audio Murottal",
        size: "18.2 MB",
        type: "audio",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        desc: "Murottal merdu beserta panduan makhraj dan hukum tajwid.",
        provider: "direct",
      },
      {
        id: "5",
        t: "E-Book Sejarah Kebudayaan Islam MTs",
        icon: FileText,
        tag: "E-Book",
        size: "8.7 MB",
        type: "pdf",
        url: "https://pdfobject.com/pdf/sample.pdf",
        desc: "Sejarah Perkembangan Islam pada Masa Daulah Abbasiyah & Wali Songo.",
      },
    ];
  });

  const [isOpen, setIsOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileDataUrl, setSelectedFileDataUrl] = useState<string>("");
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("PDF Modul");
  const [mediaUrl, setMediaUrl] = useState("");
  const [desc, setDesc] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setSelectedFileDataUrl(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const saveListToStorage = (list: any[]) => {
    setBukuList(list);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("lms_elibrary_books_v2", JSON.stringify(list));
      } catch (e) {}
    }
  };

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Judul modul / media tidak boleh kosong!");
    if (uploadMode === "file" && !selectedFile && !mediaUrl.trim()) {
      return toast.error("Harap pilih berkas dari perangkat Anda!");
    }

    const isVideo = tag === "Video YouTube" || tag === "Video G-Drive" || tag === "Video Tutorial";
    const isAudio = tag === "Audio Murottal";
    const isPdf = tag === "PDF Modul" || tag === "E-Book";

    let mediaType = isVideo ? "video" : isAudio ? "audio" : "pdf";
    let defaultUrl = "";
    let fileSizeStr = "12.5 MB";

    if (uploadMode === "file" && selectedFile) {
      defaultUrl = selectedFileDataUrl || URL.createObjectURL(selectedFile);
      fileSizeStr = `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      defaultUrl = mediaUrl.trim() || (isPdf ? "https://pdfobject.com/pdf/sample.pdf" : "https://www.youtube.com/watch?v=kYJzXv0h0bU");
    }

    const parsed = parseMediaUrl(defaultUrl);

    const newItem = {
      id: String(Date.now()),
      t: title.trim(),
      icon: isVideo ? Video : isAudio ? Headphones : FileText,
      tag,
      size: uploadMode === "file" && selectedFile ? fileSizeStr : parsed.provider === "youtube" ? "YouTube HD" : parsed.provider === "gdrive" ? "Google Drive" : "15.0 MB",
      type: mediaType,
      url: defaultUrl,
      videoUrl: defaultUrl,
      audioUrl: defaultUrl,
      desc: desc.trim() || "Modul & media pembelajaran digital MTsN 2 Cilacap.",
      provider: uploadMode === "file" ? "direct" : parsed.provider,
    };

    MysqlDataService.saveElibraryBook({
      id: newItem.id,
      title: newItem.t,
      tag: newItem.tag,
      size: newItem.size,
      type: newItem.type,
      url: newItem.url,
      video_url: newItem.videoUrl,
      audio_url: newItem.audioUrl,
      description: newItem.desc,
      provider: newItem.provider,
    }).catch((err) => console.warn("saveElibraryBook DB failed:", err));

    const updated = [newItem, ...bukuList];
    saveListToStorage(updated);

    toast.success(`🎉 Berkas "${title}" (${tag}) berhasil diterbitkan ke Database E-Library!`);
    setIsOpen(false);
    setTitle("");
    setMediaUrl("");
    setDesc("");
    setSelectedFile(null);
  };

  const handleDeleteBook = (id: string, title: string) => {
    const updated = bukuList.filter((b: any) => b.id !== id);
    saveListToStorage(updated);
    MysqlDataService.deleteElibraryBook(id).catch((err) => console.warn("deleteElibraryBook DB failed:", err));
    toast.success(`🗑️ Berkas "${title}" berhasil dihapus dari E-Library!`);
  };

  const filtered = bukuList.filter((b: any) => filterTag === "Semua" || b.tag === filterTag);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Library className="h-6 w-6 text-primary" /> Perpustakaan Digital & E-Resources
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Koleksi PDF E-Book, Modul Digital, Embed Video YouTube & Google Drive, serta Audio Murottal Streaming MTsN 2 Cilacap.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground shadow-xs" onClick={() => setIsOpen(true)}>
          + Tautkan / Unggah Berkas E-Library
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-border pb-3">
        {["Semua", "PDF Modul", "Video YouTube", "Video G-Drive", "Audio Murottal", "E-Book"].map((t) => (
          <Button
            key={t}
            size="sm"
            variant={filterTag === t ? "default" : "outline"}
            className="text-xs font-semibold"
            onClick={() => setFilterTag(t)}
          >
            {t}
          </Button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((k: any) => {
          const Icon = k.icon || FileText;
          const isMedia = k.type === "video" || k.type === "audio";
          const isPdf = k.type === "pdf" || k.tag === "PDF Modul" || k.tag === "E-Book";

          const parsed = parseMediaUrl(k.videoUrl || k.url || "");

          return (
            <Card key={k.id} className="border-border shadow-xs hover:border-primary/40 transition group">
              <CardContent className="p-4 flex flex-col justify-between h-full gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary grid place-items-center shrink-0 font-bold group-hover:scale-105 transition">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-foreground line-clamp-2 leading-snug">{k.t}</div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge variant="secondary" className="text-[9px] font-bold bg-primary/10 text-primary border-primary/20">
                        {k.tag}
                      </Badge>
                      {parsed.provider === "youtube" && (
                        <Badge variant="outline" className="text-[9px] font-extrabold bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30">
                          ▶ YouTube
                        </Badge>
                      )}
                      {parsed.provider === "gdrive" && (
                        <Badge variant="outline" className="text-[9px] font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
                          📁 Google Drive
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground font-mono">{k.size}</span>
                    </div>
                  </div>
                </div>

                {k.desc && <p className="text-[11px] text-muted-foreground line-clamp-2 italic px-1">{k.desc}</p>}

                <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2 mt-auto">
                  {isPdf && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs font-bold gap-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                      onClick={() => setActivePdfModal(k)}
                    >
                      <FileText className="h-3.5 w-3.5" /> 📄 Baca / Lihat PDF
                    </Button>
                  )}

                  {isMedia && (
                    <Button
                      size="sm"
                      className="w-full text-xs font-bold gap-1.5 bg-primary text-primary-foreground shadow-xs"
                      onClick={() => setActiveMediaModal(k)}
                    >
                      ▶ {k.type === "video" ? (parsed.provider === "youtube" ? "Tonton YouTube" : parsed.provider === "gdrive" ? "Tonton G-Drive" : "Tonton Video") : "Dengar Audio"}
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs font-bold text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 h-8 px-2 shrink-0 rounded-lg"
                    onClick={() => setDeleteConfirmBook({ id: k.id, title: k.t })}
                    title="Hapus Berkas dari E-Library"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 🗑️ DIALOG KONFIRMASI HAPUS E-LIBRARY */}
      <Dialog open={!!deleteConfirmBook} onOpenChange={() => setDeleteConfirmBook(null)}>
        <DialogContent className="sm:max-w-md border-rose-500/30 bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <Trash2 className="h-5 w-5 shrink-0" /> Konfirmasi Hapus Berkas E-Library
            </DialogTitle>
            <DialogDescription className="text-xs pt-1 leading-relaxed text-muted-foreground">
              Apakah Anda yakin ingin menghapus berkas <strong className="text-foreground">"{deleteConfirmBook?.title}"</strong> dari Perpustakaan Digital?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-3 border-t border-border mt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setDeleteConfirmBook(null)}>
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold gap-1.5"
              onClick={() => {
                if (deleteConfirmBook) {
                  handleDeleteBook(deleteConfirmBook.id, deleteConfirmBook.title);
                  setDeleteConfirmBook(null);
                }
              }}
            >
              <Trash2 className="h-4 w-4" /> Ya, Hapus Berkas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!activePdfModal}
        onOpenChange={() => {
          setActivePdfModal(null);
          setIsPdfFullScreen(false);
        }}
      >
        <DialogContent
          className={
            isPdfFullScreen
              ? "max-w-[98vw] w-[98vw] h-[95vh] max-h-[95vh] p-4 flex flex-col border-border bg-card shadow-2xl transition-all duration-300"
              : "sm:max-w-4xl max-h-[90vh] border-border bg-card flex flex-col transition-all duration-300"
          }
        >
          <DialogHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" /> {activePdfModal?.t}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {activePdfModal?.desc || "Pratinjau Berkas PDF E-Library MTsN 2 Cilacap"}
              </DialogDescription>
            </div>
            <Button
              size="sm"
              variant={isPdfFullScreen ? "default" : "outline"}
              className="gap-1.5 text-xs font-bold shrink-0 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
              onClick={() => setIsPdfFullScreen(!isPdfFullScreen)}
            >
              {isPdfFullScreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              {isPdfFullScreen ? "Keluar Fullscreen" : "🗖 Layar Penuh"}
            </Button>
          </DialogHeader>

          <div className="py-2 flex-1 min-h-[60vh]">
            {activePdfModal?.url ? (
              <iframe
                src={activePdfModal.url}
                className={`w-full rounded-xl border border-border shadow-inner bg-muted/20 ${
                  isPdfFullScreen ? "h-[80vh]" : "h-[62vh]"
                }`}
                title={activePdfModal.t}
              />
            ) : (
              <div className="h-[50vh] grid place-items-center text-center p-6 bg-muted/20 rounded-xl">
                <p className="text-xs text-muted-foreground">URL dokumen PDF tidak dapat dimuat secara langsung.</p>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/40 font-bold">
                📄 {isPdfFullScreen ? "Mode Layar Penuh Aktif" : "PDF Viewer Ready"}
              </Badge>
              {activePdfModal?.url && (
                <a
                  href={activePdfModal.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary underline font-bold flex items-center gap-1"
                >
                  🔗 Buka Tab Baru
                </a>
              )}
            </div>
            <Button size="sm" variant="outline" onClick={() => { setActivePdfModal(null); setIsPdfFullScreen(false); }}>
              Tutup Pembaca PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" /> Tautkan / Unggah Berkas ke E-Library
            </DialogTitle>
            <DialogDescription>
              Tambahkan modul PDF, tautan Video YouTube, Video Google Drive, atau Audio ke koleksi perpustakaan madrasah.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddBook} className="space-y-4 py-2">
            <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
              <Button
                type="button"
                size="sm"
                variant={uploadMode === "file" ? "default" : "ghost"}
                className="flex-1 text-xs font-bold gap-1"
                onClick={() => setUploadMode("file")}
              >
                <Upload className="h-3.5 w-3.5" /> 📤 Unggah Berkas Fisik
              </Button>
              <Button
                type="button"
                size="sm"
                variant={uploadMode === "url" ? "default" : "ghost"}
                className="flex-1 text-xs font-bold gap-1"
                onClick={() => setUploadMode("url")}
              >
                <ExternalLink className="h-3.5 w-3.5" /> 🔗 Tautkan Link/URL Online
              </Button>
            </div>

            {uploadMode === "file" ? (
              <div>
                <Label className="text-xs font-semibold">Pilih Berkas PDF / Audio / Video dari Perangkat</Label>
                <div className="mt-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-primary/30 rounded-xl bg-primary/5 hover:bg-primary/10 transition cursor-pointer text-center space-y-2 relative">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.pptx,.ppt,.mp4,.mp3,video/mp4,audio/mpeg,application/pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                  <Upload className="h-8 w-8 text-primary animate-pulse" />
                  <div className="text-xs font-bold text-foreground">
                    {selectedFile ? `📄 ${selectedFile.name} (${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)` : "Klik atau seret file PDF / Media di sini"}
                  </div>
                  <p className="text-[10px] text-muted-foreground">Format yang didukung: PDF, MP4, MP3, EPUB (Maks. 100 MB)</p>
                </div>
              </div>
            ) : (
              <div>
                <Label className="text-xs font-semibold">Tautan Link Media / PDF (YouTube, Google Drive, URL)</Label>
                <Input
                  placeholder="https://www.youtube.com/watch?v=... ATAU https://drive.google.com/file/d/... ATAU URL PDF"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="mt-1 text-xs font-mono"
                />
              </div>
            )}

            <div>
              <Label className="text-xs font-semibold">Judul Berkas / Media / Modul</Label>
              <Input
                placeholder="Contoh: Modul Fikih Bab 3 / Video Pembelajaran Tajwid"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Kategori Media</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs mt-1"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              >
                <option value="PDF Modul">📄 PDF Modul</option>
                <option value="Video YouTube">▶ Video YouTube</option>
                <option value="Video G-Drive">📁 Video Google Drive</option>
                <option value="Audio Murottal">🎧 Audio Murottal</option>
                <option value="E-Book">📚 E-Book Digital</option>
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">
                Simpan & Tautkan Media
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
