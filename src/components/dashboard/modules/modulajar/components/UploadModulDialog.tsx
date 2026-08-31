import { useState } from "react";
import { Upload } from "lucide-react";
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

interface UploadModulDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMapel: string;
  onUpload: (newModul: { title: string; mapel: string; jenjang: string; file: File | null; dataUrl: string }) => void;
}

export function UploadModulDialog({ isOpen, onOpenChange, defaultMapel, onUpload }: UploadModulDialogProps) {
  const allowedMapels = filterSubjectsForUser(ALL_SCHOOL_SUBJECTS);
  const [newTitle, setNewTitle] = useState("");
  const [newMapel, setNewMapel] = useState(defaultMapel || allowedMapels[0] || "Al Qur'an Hadis");
  const [newJenjang, setNewJenjang] = useState("Kelas VIII");
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [uploadedFileDataUrl, setUploadedFileDataUrl] = useState<string>("");

  const handleModulFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedUploadFile(file);
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setUploadedFileDataUrl(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpload({
      title: newTitle,
      mapel: newMapel,
      jenjang: newJenjang,
      file: selectedUploadFile,
      dataUrl: uploadedFileDataUrl,
    });
    setNewTitle("");
    setSelectedUploadFile(null);
    setUploadedFileDataUrl("");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Upload className="h-5 w-5 text-emerald-600" /> Unggah Bahan Ajar Baru
          </DialogTitle>
          <DialogDescription>
            Unggah file PDF Bahan Ajar Kurikulum Merdeka untuk diverifikasi oleh Waka Kurikulum.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
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

          <div>
            <Label className="text-xs font-semibold">Pilih Berkas PDF (Opsional)</Label>
            <Input
              type="file"
              accept=".pdf"
              onChange={handleModulFileChange}
              className="mt-1 text-xs cursor-pointer"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Format .PDF (Maksimal 15 MB). Jika tidak diunggah, sistem akan menggunakan templat PDF standar.
            </p>
          </div>

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
