import { useState } from "react";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Music,
  Globe,
  Link2,
  Video,
  FileEdit,
  Lock,
  Unlock,
  CheckCircle2,
  ListOrdered,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { filterSubjectsForUser, ALL_SCHOOL_SUBJECTS } from "@/services/teacherSubjectAccess";
import { validateUploadedFile } from "@/lib/fileValidation";
import { toast } from "sonner";

export type JenisBahanAjarType = "DOKUMEN" | "VIDEO" | "TEKS" | "URL" | "AUDIO" | "GAMBAR";

export interface UploadModulPayload {
  title: string;
  mapel: string;
  jenjang: string;
  jenisBahan: JenisBahanAjarType;
  file: File | null;
  dataUrl: string;
  externalUrl?: string;
  sequence_order?: number;
  access_mode?: "GURU_KONTROL" | "SISWA_MANDIRI";
  content_text?: string;
}

interface UploadModulDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMapel: string;
  onUpload: (newModul: UploadModulPayload) => void;
}

export function UploadModulDialog({ isOpen, onOpenChange, defaultMapel, onUpload }: UploadModulDialogProps) {
  const allowedMapels = filterSubjectsForUser(ALL_SCHOOL_SUBJECTS);
  const [newTitle, setNewTitle] = useState("");
  const [newMapel, setNewMapel] = useState(defaultMapel || allowedMapels[0] || "Al Qur'an Hadis");
  const [newJenjang, setNewJenjang] = useState("Kelas VIII");
  const [jenisBahan, setJenisBahan] = useState<JenisBahanAjarType>("DOKUMEN");
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [uploadedFileDataUrl, setUploadedFileDataUrl] = useState<string>("");
  const [externalUrl, setExternalUrl] = useState<string>("");
  const [contentText, setContentText] = useState<string>("");
  const [sequenceOrder, setSequenceOrder] = useState<number>(1);
  const [accessMode, setAccessMode] = useState<"GURU_KONTROL" | "SISWA_MANDIRI">("GURU_KONTROL");

  const handleModulFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let allowedExtensions: string[] = ["pdf", "doc", "docx", "ppt", "pptx"];
    let maxSizeMb = 35;

    if (jenisBahan === "GAMBAR") {
      allowedExtensions = ["png", "jpg", "jpeg", "webp"];
      maxSizeMb = 10;
    } else if (jenisBahan === "AUDIO") {
      allowedExtensions = ["mp3", "wav", "m4a", "ogg"];
      maxSizeMb = 30;
    } else if (jenisBahan === "VIDEO") {
      allowedExtensions = ["mp4", "webm", "mkv"];
      maxSizeMb = 60;
    }

    const validation = validateUploadedFile(file.name, file.size, file.type, {
      maxSizeMb,
      allowedExtensions,
    });

    if (!validation.valid) {
      toast.error(`⚠️ Berkas Ditolak: ${validation.error}`);
      e.target.value = "";
      setSelectedUploadFile(null);
      setUploadedFileDataUrl("");
      return;
    }

    setSelectedUploadFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setUploadedFileDataUrl(evt.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setNewTitle("");
    setSelectedUploadFile(null);
    setUploadedFileDataUrl("");
    setExternalUrl("");
    setContentText("");
    setSequenceOrder(1);
    setAccessMode("GURU_KONTROL");
    setJenisBahan("DOKUMEN");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTitle.trim()) {
      toast.error("Judul Bahan Ajar wajib diisi!");
      return;
    }

    if (jenisBahan === "URL") {
      const cleanUrl = externalUrl.trim();
      if (!cleanUrl) {
        toast.error("Tautan URL Bahan Ajar wajib diisi!");
        return;
      }
      if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
        toast.error("Format tautan harus diawali dengan http:// atau https://");
        return;
      }
    } else if (jenisBahan === "TEKS") {
      if (!contentText.trim()) {
        toast.error("Isi catatan / rangkuman materi pembelajaran tidak boleh kosong!");
        return;
      }
    } else if (jenisBahan === "VIDEO") {
      if (!externalUrl.trim() && !selectedUploadFile) {
        toast.error("Tautan video YouTube atau berkas video pembelajaran wajib diisi!");
        return;
      }
    }

    onUpload({
      title: newTitle.trim(),
      mapel: newMapel,
      jenjang: newJenjang,
      jenisBahan,
      file: jenisBahan === "URL" || jenisBahan === "TEKS" ? null : selectedUploadFile,
      dataUrl: jenisBahan === "URL" || jenisBahan === "TEKS" ? "" : uploadedFileDataUrl,
      externalUrl: jenisBahan === "URL" || jenisBahan === "VIDEO" ? externalUrl.trim() : undefined,
      sequence_order: Number(sequenceOrder) || 1,
      access_mode: accessMode,
      content_text: jenisBahan === "TEKS" ? contentText.trim() : undefined,
    });

    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
            <Upload className="h-5 w-5 text-emerald-600" /> Unggah & Susun Bahan Ajar KBM
          </DialogTitle>
          <DialogDescription className="text-xs">
            Unggah modul dokumen, video, catatan teks langsung, link web, audio, atau gambar dengan urutan & mode kontrol akses.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Judul Bahan Ajar */}
          <div>
            <Label htmlFor="modul-title" className="text-xs font-semibold">Judul Bahan Ajar</Label>
            <Input
              id="modul-title"
              placeholder="Contoh: Bab 2 - Mengenal Hukum Bacaan Idgham & Iqlab"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              className="mt-1 text-xs"
            />
          </div>

          {/* Jenis / Format Bahan Ajar (Variatif) */}
          <div>
            <Label className="text-xs font-semibold">Format Bahan Ajar:</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1.5">
              {/* 1. Dokumen */}
              <button
                type="button"
                onClick={() => {
                  setJenisBahan("DOKUMEN");
                  setSelectedUploadFile(null);
                  setUploadedFileDataUrl("");
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                  jenisBahan === "DOKUMEN"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20 shadow-xs"
                    : "border-border hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <FileText className="h-4 w-4 mb-1 text-emerald-600" />
                <span>Dokumen / PDF</span>
                <span className="text-[9px] opacity-75 font-normal">PDF, Word, PPT</span>
              </button>

              {/* 2. Video */}
              <button
                type="button"
                onClick={() => {
                  setJenisBahan("VIDEO");
                  setSelectedUploadFile(null);
                  setUploadedFileDataUrl("");
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                  jenisBahan === "VIDEO"
                    ? "border-blue-600 bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 font-bold ring-2 ring-blue-500/20 shadow-xs"
                    : "border-border hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <Video className="h-4 w-4 mb-1 text-blue-600" />
                <span>Video Belajar</span>
                <span className="text-[9px] opacity-75 font-normal">YouTube / MP4</span>
              </button>

              {/* 3. Teks Langsung */}
              <button
                type="button"
                onClick={() => {
                  setJenisBahan("TEKS");
                  setSelectedUploadFile(null);
                  setUploadedFileDataUrl("");
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                  jenisBahan === "TEKS"
                    ? "border-purple-600 bg-purple-50 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 font-bold ring-2 ring-purple-500/20 shadow-xs"
                    : "border-border hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <FileEdit className="h-4 w-4 mb-1 text-purple-600" />
                <span>Teks Catatan</span>
                <span className="text-[9px] opacity-75 font-normal">Ketik Langsung</span>
              </button>

              {/* 4. Link Web */}
              <button
                type="button"
                onClick={() => {
                  setJenisBahan("URL");
                  setSelectedUploadFile(null);
                  setUploadedFileDataUrl("");
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                  jenisBahan === "URL"
                    ? "border-sky-600 bg-sky-50 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300 font-bold ring-2 ring-sky-500/20 shadow-xs"
                    : "border-border hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <Globe className="h-4 w-4 mb-1 text-sky-600" />
                <span>Tautan Web</span>
                <span className="text-[9px] opacity-75 font-normal">Link Eksternal</span>
              </button>

              {/* 5. Audio */}
              <button
                type="button"
                onClick={() => {
                  setJenisBahan("AUDIO");
                  setSelectedUploadFile(null);
                  setUploadedFileDataUrl("");
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                  jenisBahan === "AUDIO"
                    ? "border-amber-600 bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 font-bold ring-2 ring-amber-500/20 shadow-xs"
                    : "border-border hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <Music className="h-4 w-4 mb-1 text-amber-600" />
                <span>Audio MP3</span>
                <span className="text-[9px] opacity-75 font-normal">Murattal / Podcast</span>
              </button>

              {/* 6. Gambar */}
              <button
                type="button"
                onClick={() => {
                  setJenisBahan("GAMBAR");
                  setSelectedUploadFile(null);
                  setUploadedFileDataUrl("");
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                  jenisBahan === "GAMBAR"
                    ? "border-rose-600 bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 font-bold ring-2 ring-rose-500/20 shadow-xs"
                    : "border-border hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <ImageIcon className="h-4 w-4 mb-1 text-rose-600" />
                <span>Gambar / Bagan</span>
                <span className="text-[9px] opacity-75 font-normal">Infografis PNG/JPG</span>
              </button>
            </div>
          </div>

          {/* Form Input Sesuai Jenis Bahan */}
          {jenisBahan === "TEKS" && (
            <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-950/20 space-y-2">
              <Label htmlFor="modul-text" className="text-xs font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                <FileEdit className="h-3.5 w-3.5" /> Isi Catatan / Rangkuman Materi Pembelajaran
              </Label>
              <Textarea
                id="modul-text"
                rows={6}
                placeholder="Ketikkan ringkasan materi, dalil Al-Qur'an/Hadits, apersepsi, atau materi bacaan siswa di sini..."
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                required
                className="text-xs bg-background leading-relaxed"
              />
              <p className="text-[10px] text-muted-foreground">
                Siswa dapat langsung membaca materi ini secara nyaman di layar tanpa perlu mengunduh dokumen.
              </p>
            </div>
          )}

          {jenisBahan === "VIDEO" && (
            <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="video-url" className="text-xs font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5" /> Tautan Video YouTube (Disarankan)
                </Label>
                <Input
                  id="video-url"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className="text-xs bg-background"
                />
              </div>

              <div className="relative flex items-center justify-center py-1">
                <div className="border-t border-border w-full"></div>
                <span className="bg-card px-2 text-[10px] text-muted-foreground font-semibold absolute">ATAU UNGGAH BERKAS MP4</span>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Berkas Video MP4 / WebM (Maks. 60 MB)</Label>
                <Input
                  type="file"
                  accept=".mp4,.webm,.mkv"
                  onChange={handleModulFileChange}
                  className="text-xs cursor-pointer bg-background"
                />
              </div>
            </div>
          )}

          {jenisBahan === "URL" && (
            <div className="p-3.5 rounded-xl border border-sky-200 dark:border-sky-900/50 bg-sky-50/40 dark:bg-sky-950/20 space-y-2">
              <Label htmlFor="modul-url" className="text-xs font-semibold flex items-center gap-1.5 text-sky-800 dark:text-sky-300">
                <Link2 className="h-3.5 w-3.5" /> Tautan URL Bahan Ajar
              </Label>
              <Input
                id="modul-url"
                type="url"
                placeholder="https://drive.google.com/... atau https://phet.colorado.edu/..."
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                required
                className="text-xs bg-background"
              />
              <p className="text-[10px] text-muted-foreground">
                Dapat berupa Google Drive materi, simulasi lab interaktif, presentasi Canva, atau rujukan website.
              </p>
            </div>
          )}

          {(jenisBahan === "DOKUMEN" || jenisBahan === "GAMBAR" || jenisBahan === "AUDIO") && (
            <div>
              <Label className="text-xs font-semibold">
                {jenisBahan === "DOKUMEN" && "Pilih Berkas Dokumen (PDF / PPT / Word)"}
                {jenisBahan === "GAMBAR" && "Pilih Berkas Gambar (PNG / JPG)"}
                {jenisBahan === "AUDIO" && "Pilih Berkas Audio (MP3 / WAV)"}
              </Label>
              <Input
                type="file"
                accept={
                  jenisBahan === "DOKUMEN"
                    ? ".pdf,.doc,.docx,.ppt,.pptx"
                    : jenisBahan === "GAMBAR"
                    ? ".png,.jpg,.jpeg,.webp"
                    : ".mp3,.wav,.m4a,.ogg"
                }
                onChange={handleModulFileChange}
                className="mt-1 text-xs cursor-pointer"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                {jenisBahan === "DOKUMEN" && "Format didukung: .PDF, .DOC, .DOCX, .PPT, .PPTX (Maksimal 35 MB)."}
                {jenisBahan === "GAMBAR" && "Format didukung: .PNG, .JPG, .JPEG, .WEBP (Maksimal 10 MB)."}
                {jenisBahan === "AUDIO" && "Format didukung: .MP3, .WAV, .M4A, .OGG (Maksimal 30 MB)."}
              </p>
            </div>
          )}

          {/* Konfigurasi Urutan & Mode Kontrol Pembelajaran (2 Opsi Klien) */}
          <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Urutan Materi */}
              <div>
                <Label htmlFor="modul-order" className="text-xs font-semibold flex items-center gap-1.5">
                  <ListOrdered className="h-3.5 w-3.5 text-emerald-600" /> Urutan Tayang (Langkah Ke-)
                </Label>
                <Input
                  id="modul-order"
                  type="number"
                  min={1}
                  max={99}
                  value={sequenceOrder}
                  onChange={(e) => setSequenceOrder(parseInt(e.target.value) || 1)}
                  className="mt-1 text-xs font-mono font-bold"
                  placeholder="1, 2, 3..."
                />
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Materi akan tersusun otomatis sesuai nomor urut langkah ini.
                </p>
              </div>

              {/* Mode Kontrol Akses (2 Opsi Sesuai Permintaan Klien) */}
              <div>
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  {accessMode === "GURU_KONTROL" ? (
                    <Lock className="h-3.5 w-3.5 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  )}
                  Mode Kontrol Akses Materi
                </Label>
                <select
                  className="w-full h-9 rounded-md border border-border bg-background px-2.5 text-xs mt-1 font-semibold"
                  value={accessMode}
                  onChange={(e) => setAccessMode(e.target.value as any)}
                >
                  <option value="GURU_KONTROL">🏫 Tatap Muka (Guru yang Kontrol Buka/Tutup)</option>
                  <option value="SISWA_MANDIRI">🏡 Mandiri / PR (Siswa Klik Tandai Selesai)</option>
                </select>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {accessMode === "GURU_KONTROL"
                    ? "Digunakan saat di kelas: guru membuka gembok saat jam pelajaran berlangsung."
                    : "Digunakan saat daring/PR: siswa membuka materi berikutnya secara bertahap."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Mata Pelajaran</Label>
              <select
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1"
                value={newMapel}
                onChange={(e) => setNewMapel(e.target.value)}
              >
                {allowedMapels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Jenjang Kelas</Label>
              <select
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1"
                value={newJenjang}
                onChange={(e) => setNewJenjang(e.target.value)}
              >
                <option value="Kelas VII">Kelas VII</option>
                <option value="Kelas VIII">Kelas VIII</option>
                <option value="Kelas IX">Kelas IX</option>
              </select>
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 cursor-pointer">
              <Upload className="h-4 w-4" /> Unggah & Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
