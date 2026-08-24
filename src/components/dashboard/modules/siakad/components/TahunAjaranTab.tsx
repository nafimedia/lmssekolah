import { useState, useEffect } from "react";
import { CalendarDays, Plus, CheckCircle2, Clock, Archive, PencilLine, Trash2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AcademicYearService, AcademicYearItem } from "@/services/academicYearService";
import { AddTahunAjaranDialog } from "./AddTahunAjaranDialog";

interface TahunAjaranTabProps {
  isKamad?: boolean;
}

export function TahunAjaranTab({ isKamad }: TahunAjaranTabProps) {
  const [academicYears, setAcademicYears] = useState<AcademicYearItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AcademicYearItem | null>(null);

  const loadData = () => {
    const list = AcademicYearService.getAcademicYears();
    setAcademicYears(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSetActive = (id: string, name: string) => {
    if (isKamad) {
      toast.error("🔒 Akses ditolak: Kepala Madrasah hanya berhak memantau data (Read-Only).");
      return;
    }
    const updated = AcademicYearService.setActiveAcademicYear(id);
    setAcademicYears(updated);
    toast.success(`⚡ Tahun Ajaran & Periode "${name}" resmi diaktifkan sebagai periode KBM aktif!`);
  };

  const handleSaveItem = (itemData: Omit<AcademicYearItem, "id"> & { id?: string }) => {
    if (isKamad) {
      toast.error("🔒 Akses ditolak: Kepala Madrasah hanya berhak memantau data (Read-Only).");
      return;
    }
    const updated = AcademicYearService.saveAcademicYear(itemData);
    setAcademicYears(updated);
    toast.success(`✅ Tahun Ajaran ${itemData.year} (${itemData.semester}) berhasil disimpan!`);
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (isKamad) {
      toast.error("🔒 Akses ditolak: Kepala Madrasah hanya berhak memantau data (Read-Only).");
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus/mengarsipkan periode "${name}"?`)) {
      const updated = AcademicYearService.deleteAcademicYear(id);
      setAcademicYears(updated);
      toast.success(`🗑️ Periode "${name}" berhasil dihapus.`);
    }
  };

  const handleOpenAdd = () => {
    if (isKamad) {
      toast.info("🏛️ Kepala Madrasah berada dalam Mode Monitoring (Read-Only).");
      return;
    }
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: AcademicYearItem) => {
    if (isKamad) {
      toast.info("🏛️ Kepala Madrasah berada dalam Mode Monitoring (Read-Only).");
      return;
    }
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const activeYearItem = academicYears.find((i) => i.isCurrent || i.status === "AKTIF") || academicYears[0];

  return (
    <div className="space-y-4">
      {/* Banner Indicator Periode Aktif */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-600 text-white shadow-xs shrink-0">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Periode Akademik Aktif Utama
              </span>
              <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                LIVE KBM
              </Badge>
            </div>
            <h3 className="text-lg font-black tracking-tight text-foreground mt-0.5">
              Tahun Ajaran {activeYearItem?.year || "2026/2027"} — Semester {activeYearItem?.semester || "Ganjil"}
            </h3>
            <p className="text-xs text-muted-foreground font-mono">
              Periode Efektif: {activeYearItem?.startDate || "13 Juli 2026"} s/d {activeYearItem?.endDate || "19 Desember 2026"}
            </p>
          </div>
        </div>

        <Badge variant="outline" className="text-xs font-bold border-teal-500/40 text-teal-600 dark:text-teal-400 bg-teal-500/10 shrink-0 px-3 py-1.5 gap-1.5">
          <ShieldCheck className="h-4 w-4" /> Kurikulum Merdeka Kemenag
        </Badge>
      </div>

      <Card className="border-border shadow-sm bg-card">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" /> Pengaturan Tahun Ajaran & Periode Akademik
            </CardTitle>
            <CardDescription className="text-xs">
              Kelola kalender akademik aktif, semester ganjil/genap, dan tanggal efektif KBM MTsN 2 Cilacap.
            </CardDescription>
          </div>
          {!isKamad && (
            <Button
              size="sm"
              className="bg-primary text-primary-foreground font-bold text-xs gap-1 shadow-xs"
              onClick={handleOpenAdd}
            >
              <Plus className="h-4 w-4" /> Tambah Tahun Ajaran Baru
            </Button>
          )}
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/60 text-left border-b border-border font-bold text-muted-foreground">
              <tr>
                <th className="py-3 px-4">Tahun Ajaran</th>
                <th className="py-3 px-3">Semester</th>
                <th className="py-3 px-4">Periode Efektif KBM</th>
                <th className="py-3 px-3 text-center">Status Periode</th>
                <th className="py-3 px-4 text-center">Aksi / Kontrol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {academicYears.map((item) => (
                <tr key={item.id} className={`hover:bg-muted/30 transition ${item.isCurrent ? "bg-emerald-500/10 font-semibold" : ""}`}>
                  <td className="py-3 px-4 font-bold text-foreground flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                    <span>{item.year}</span>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant="outline" className="font-mono text-[10px] font-bold">
                      Semester {item.semester}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground font-mono">
                    {item.startDate} — {item.endDate}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {item.status === "AKTIF" && (
                      <Badge className="bg-emerald-600 text-white font-bold text-[10px] gap-1">
                        <CheckCircle2 className="h-3 w-3" /> AKTIF SEKARANG
                      </Badge>
                    )}
                    {item.status === "TERJADWAL" && (
                      <Badge variant="outline" className="text-blue-600 border-blue-400 bg-blue-50/50 dark:bg-blue-950/20 font-bold text-[10px] gap-1">
                        <Clock className="h-3 w-3" /> TERJADWAL
                      </Badge>
                    )}
                    {item.status === "ARSIP" && (
                      <Badge variant="secondary" className="text-muted-foreground font-medium text-[10px] gap-1">
                        <Archive className="h-3 w-3" /> ARSIP
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {!item.isCurrent && !isKamad ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-[11px] font-bold text-emerald-600 hover:bg-emerald-50 border-emerald-300 dark:border-emerald-800"
                          onClick={() => handleSetActive(item.id, `${item.year} ${item.semester}`)}
                        >
                          ⚡ Set Periode Aktif
                        </Button>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          ✓ Periode Aktif Utama
                        </span>
                      )}

                      {!isKamad && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-muted"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Tahun Ajaran"
                          >
                            <PencilLine className="h-3.5 w-3.5" />
                          </Button>
                          {!item.isCurrent && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-rose-500 hover:bg-rose-500/10"
                              onClick={() => handleDeleteItem(item.id, `${item.year} ${item.semester}`)}
                              title="Hapus Periode"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* MODAL DIALOG ADD / EDIT TAHUN AJARAN */}
      <AddTahunAjaranDialog
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialData={editingItem}
        onSave={handleSaveItem}
      />
    </div>
  );
}
