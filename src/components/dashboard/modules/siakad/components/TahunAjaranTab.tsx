import { useState } from "react";
import { CalendarDays, Plus, CheckCircle2, Clock, Archive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface AcademicYearItem {
  id: string;
  year: string;
  semester: "Ganjil" | "Genap";
  startDate: string;
  endDate: string;
  status: "AKTIF" | "TERJADWAL" | "ARSIP";
  isCurrent: boolean;
}

export function TahunAjaranTab() {
  const [academicYears, setAcademicYears] = useState<AcademicYearItem[]>([
    {
      id: "ta1",
      year: "2025/2026",
      semester: "Ganjil",
      startDate: "14 Juli 2025",
      endDate: "20 Desember 2025",
      status: "AKTIF",
      isCurrent: true,
    },
    {
      id: "ta2",
      year: "2025/2026",
      semester: "Genap",
      startDate: "05 Januari 2026",
      endDate: "20 Juni 2026",
      status: "TERJADWAL",
      isCurrent: false,
    },
    {
      id: "ta3",
      year: "2024/2025",
      semester: "Genap",
      startDate: "06 Januari 2025",
      endDate: "21 Juni 2025",
      status: "ARSIP",
      isCurrent: false,
    },
    {
      id: "ta4",
      year: "2024/2025",
      semester: "Ganjil",
      startDate: "15 Juli 2024",
      endDate: "21 Desember 2024",
      status: "ARSIP",
      isCurrent: false,
    },
  ]);

  const handleSetActive = (id: string, name: string) => {
    setAcademicYears((prev) =>
      prev.map((item) => ({
        ...item,
        isCurrent: item.id === id,
        status: item.id === id ? "AKTIF" : item.status === "AKTIF" ? "ARSIP" : item.status,
      }))
    );
    toast.success(`⚡ Tahun Ajaran & Periode "${name}" resmi diaktifkan sebagai periode KBM aktif!`);
  };

  return (
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
        <Button
          size="sm"
          className="bg-primary text-primary-foreground font-bold text-xs gap-1"
          onClick={() => toast.info("Fitur Tambah Tahun Ajaran Baru disiapkan untuk periode mendatang.")}
        >
          <Plus className="h-4 w-4" /> Tambah Tahun Ajaran
        </Button>
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
              <tr key={item.id} className={`hover:bg-muted/30 transition ${item.isCurrent ? "bg-emerald-500/5 font-semibold" : ""}`}>
                <td className="py-3 px-4 font-bold text-foreground flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
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
                  {!item.isCurrent ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[11px] font-bold text-emerald-600 hover:bg-emerald-50 border-emerald-300 dark:border-emerald-800"
                      onClick={() => handleSetActive(item.id, `${item.year} ${item.semester}`)}
                    >
                      ⚡ Set Periode Aktif
                    </Button>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-600 font-mono">✓ Periode Aktif Utama</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
