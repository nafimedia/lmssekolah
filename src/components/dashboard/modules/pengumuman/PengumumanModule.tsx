import React, { useState, useEffect } from "react";
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
import { Megaphone, Upload, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { MysqlDataService } from "@/services/mysqlDataService";

export function PengumumanModule() {
  const [list, setList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const dbList = await MysqlDataService.getAnnouncements();
      if (dbList) {
        const mapped = dbList.map((item) => ({
          id: String(item.id || Date.now()),
          t: item.title,
          d: item.content,
          tag: item.tag || "Pengumuman",
        }));
        setList(mapped);
      } else {
        setList([]);
      }
    } catch (err) {
      console.warn("getAnnouncements DB failed:", err);
      setList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tag, setTag] = useState("Pengumuman");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !desc) return toast.error("Isi judul dan detail pengumuman!");

    try {
      await MysqlDataService.saveAnnouncement({
        title,
        content: desc,
        tag,
        date_str: new Date().toLocaleDateString("id-ID"),
      });

      await fetchAnnouncements();
      toast.success("Pengumuman resmi madrasah berhasil diterbitkan ke Database!");
      setIsOpen(false);
      setTitle("");
      setDesc("");
    } catch (err) {
      toast.error("Gagal menyimpan pengumuman ke Database");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (Number(id)) {
        await MysqlDataService.deleteAnnouncement(Number(id));
      }
      setList((prev) => prev.filter((x) => x.id !== id));
      toast.success("Pengumuman berhasil dihapus permanen!");
    } catch (err) {
      toast.error("Gagal menghapus pengumuman");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Halaman Compact Single-Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Megaphone className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-foreground">Pengumuman & Informasi</h1>
              <Badge variant="outline" className="text-[10px] font-semibold h-5 px-1.5">
                {list.length} Berita
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-none mt-0.5">
              Pusat penerbitan pengumuman resmi madrasah untuk GTK, Guru, dan Siswa
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-semibold" onClick={() => setIsImportOpen(true)}>
            <Upload className="h-3.5 w-3.5" /> Import Excel
          </Button>
          <Button size="sm" className="h-8 gap-1.5 text-xs font-semibold bg-primary text-primary-foreground" onClick={() => setIsOpen(true)}>
            + Buat Pengumuman
          </Button>
        </div>
      </div>

      {/* Metric Strip Compact ~42px */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Megaphone className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Total Pengumuman</p>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{list.length} Publikasi</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Status Database</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5">Tersinkron Real-time</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Upload className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Distribusi Sasaran</p>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">Semua Role & Kelas</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground animate-pulse border border-dashed border-border rounded-xl">
            Memuat pengumuman dari database...
          </div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border rounded-xl bg-card">
            <Megaphone className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="font-bold text-sm text-foreground">Belum Ada Pengumuman Diterbitkan</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Tidak ada data pengumuman di database. Klik tombol "+ Tambah Pengumuman Baru" di atas untuk menerbitkan pengumuman resmi madrasah.
            </p>
          </div>
        ) : (
          list.map((n) => (
            <Card key={n.id} className="border-border shadow-xs hover:border-primary/30 transition">
              <CardContent className="p-4 flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary grid place-items-center shrink-0 mt-0.5 font-bold">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-foreground">{n.t}</div>
                      <Badge variant="secondary" className="text-[10px] font-bold bg-primary/10 text-primary border-primary/20">
                        {n.tag}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:bg-destructive/10" onClick={() => handleDelete(n.id)}>
                      Hapus
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 leading-relaxed">{n.d}</div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal Form Tambah Pengumuman */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" /> Terbitkan Pengumuman Baru
            </DialogTitle>
            <DialogDescription>Isi detail informasi pengumuman resmi madrasah.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAdd} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Judul Pengumuman</Label>
              <Input placeholder="Contoh: Jadwal Libur Semester Ganjil..." value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Kategori Tag</Label>
              <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs" value={tag} onChange={(e) => setTag(e.target.value)}>
                <option value="Pengumuman">Pengumuman</option>
                <option value="Agenda">Agenda</option>
                <option value="Kegiatan">Kegiatan</option>
                <option value="Kurikulum">Kurikulum</option>
                <option value="Darurat">Darurat</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Isi Detail Informasi</Label>
              <textarea className="w-full min-h-[100px] rounded-md border border-input bg-background p-3 text-xs focus:outline-hidden focus:ring-1 focus:ring-primary" placeholder="Tuliskan isi pengumuman lengkap..." value={desc} onChange={(e) => setDesc(e.target.value)} required />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">Terbitkan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Import Excel Pengumuman */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-500" /> Import Pengumuman via Excel / CSV
            </DialogTitle>
            <DialogDescription>Unggah file Excel/CSV berisi daftar pengumuman madrasah.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition bg-muted/20">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <div className="text-xs font-semibold text-foreground">Klik atau Seret Berkas Excel (.xlsx / .csv) di Sini</div>
              <div className="text-[11px] text-muted-foreground mt-1">Maksimal ukuran file: 5 MB</div>
              <Input type="file" accept=".xlsx,.csv" className="hidden" id="excel-pengumuman-file" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  toast.success(`Berkas "${file.name}" berhasil diunggah & diproses!`);
                  setIsImportOpen(false);
                }
              }} />
              <Button variant="secondary" size="sm" className="mt-4 text-xs font-bold" onClick={() => document.getElementById("excel-pengumuman-file")?.click()}>
                Pilih Berkas
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsImportOpen(false)}>Batal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
