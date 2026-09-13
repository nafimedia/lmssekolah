import { useState } from "react";
import { Upload, FileText, Image as ImageIcon, Music, Globe, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

import { filterSubjectsForUser, ALL_SCHOOL_SUBJECTS } from "@/services/teacherSubjectAccess";
import { validateUploadedFile } from "@/lib/fileValidation";
import { toast } from "sonner";

export type JenisBahanAjarType = "DOKUMEN" | "GAMBAR" | "AUDIO" | "URL";

export interface UploadModulPayload {
  title: string;
  mapel: string;
  jenjang: string;
  jenisBahan: JenisBahanAjarType;
  file: File | null;
  dataUrl: string;
  externalUrl?: string;
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

  const handleModulFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let allowedExtensions: string[] = ["pdf", "doc", "docx", "ppt", "pptx"];
    let maxSizeMb = 25;

    if (jenisBahan === "GAMBAR") {
      allowedExtensions = ["png", "jpg", "jpeg", "webp"];
      maxSizeMb = 10;
    } else if (jenisBahan === "AUDIO") {
      allowedExtensions = ["mp3", "wav", "m4a", "ogg"];
      maxSizeMb = 25;
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
    setJenisBahan("DOKUMEN");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
    }

    onUpload({
      title: newTitle.trim(),
      mapel: newMapel,
      jenjang: newJenjang,
      jenisBahan,
      file: jenisBahan === "URL" ? null : selectedUploadFile,
      dataUrl: jenisBahan === "URL" ? "" : uploadedFileDataUrl,
      externalUrl: jenisBahan === "URL" ? externalUrl.trim() : undefined,
    });

    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Upload className="h-5 w-5 text-emerald-600" /> Unggah Bahan Ajar Baru
          </DialogTitle>
          <DialogDescription>
            Unggah Dokumen, Gambar, Audio Murattal/Listening, atau Tautan URL Pembelajaran Kurikulum Merdeka.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Judul Bahan Ajar */}
          <div>
            <Label htmlFor="modul-title" className="text-xs font-semibold">Judul Bahan Ajar</Label>
            <Input
              id="modul-title"
              placeholder="Contoh: Bahan Ajar Al Qur'an Hadis Pertemuan 1-18"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              className="mt-1 text-xs"
            />
          </div>

          {/* Jenis Bahan Ajar Radio / Selection */}
          <div>
            <Label className="text-xs font-semibold">Jenis / Format Bahan Ajar</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => {
                  setJenisBahan("DOKUMEN");
                  setSelectedUploadFile(null);
                  setUploadedFileDataUrl("");
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs transition-all ${
                  jenisBahan === "DOKUMEN"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20 shadow-xs"
                    : "border-border hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <FileText className="h-4 w-4 mb-1 text-emerald-600" />
                <span>Dokumen</span>
                <span className="text-[9px] opacity-75 font-normal">PDF, DOCX, PPT</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setJenisBahan("GAMBAR");
                  setSelectedUploadFile(null);
                  setUploadedFileDataUrl("");
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs transition-all ${
                  jenisBahan === "GAMBAR"
                    ? "border-purple-600 bg-purple-50 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 font-bold ring-2 ring-purple-500/20 shadow-xs"
                    : "border-border hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <ImageIcon className="h-4 w-4 mb-1 text-purple-600" />
                <span>Gambar</span>
                <span className="text-[9px] opacity-75 font-normal">PNG, JPEG</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setJenisBahan("AUDIO");
                  setSelectedUploadFile(null);
                  setUploadedFileDataUrl("");
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs transition-all ${
                  jenisBahan === "AUDIO"
                    ? "border-amber-600 bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 font-bold ring-2 ring-amber-500/20 shadow-xs"
                    : "border-border hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <Music className="h-4 w-4 mb-1 text-amber-600" />
                <span>Audio</span>
                <span className="text-[9px] opacity-75 font-normal">MP3, WAV</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setJenisBahan("URL");
                  setSelectedUploadFile(null);
                  setUploadedFileDataUrl("");
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs transition-all ${
                  jenisBahan === "URL"
                    ? "border-sky-600 bg-sky-50 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300 font-bold ring-2 ring-sky-500/20 shadow-xs"
                    : "border-border hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <Globe className="h-4 w-4 mb-1 text-sky-600" />
                <span>URL / Web</span>
                <span className="text-[9px] opacity-75 font-normal">Tautan Luar</span>
              </button>
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

          {/* Conditional Upload or URL Input */}
          {jenisBahan === "URL" ? (
            <div className="p-3 rounded-lg border border-sky-200 dark:border-sky-900/50 bg-sky-50/50 dark:bg-sky-950/20 space-y-2">
              <Label htmlFor="modul-url" className="text-xs font-semibold flex items-center gap-1.5 text-sky-800 dark:text-sky-300">
                <Link2 className="h-3.5 w-3.5" /> Tautan URL Bahan Ajar
              </Label>
              <Input
                id="modul-url"
                type="url"
                placeholder="https://youtube.com/... atau https://drive.google.com/..."
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                required
                className="text-xs bg-background"
              />
              <p className="text-[10px] text-muted-foreground">
                Dapat berupa tautan video YouTube pembelajaran, Google Drive, Canva, Quizizz, atau web materi.
              </p>
            </div>
          ) : (
            <div>
              <Label className="text-xs font-semibold">
                {jenisBahan === "DOKUMEN" && "Pilih Berkas Dokumen (Opsional)"}
                {jenisBahan === "GAMBAR" && "Pilih Berkas Gambar (Opsional)"}
                {jenisBahan === "AUDIO" && "Pilih Berkas Audio MP3 (Opsional)"}
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
                {jenisBahan === "DOKUMEN" && "Format didukung: .PDF, .DOC, .DOCX, .PPT, .PPTX (Maksimal 25 MB)."}
                {jenisBahan === "GAMBAR" && "Format didukung: .PNG, .JPG, .JPEG, .WEBP (Maksimal 10 MB)."}
                {jenisBahan === "AUDIO" && "Format didukung: .MP3, .WAV, .M4A, .OGG (Maksimal 25 MB)."}
              </p>
            </div>
          )}

          <DialogFooter className="pt-3 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5">
              <Upload className="h-4 w-4" /> Unggah & Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
