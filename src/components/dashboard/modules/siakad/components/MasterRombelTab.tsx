import { Building2, Plus, PencilLine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MasterRombelTabProps {
  rombelList: any[];
  onOpenAddModal: () => void;
  onEditWali?: (rombel: any) => void;
  isKamad?: boolean;
}

export function MasterRombelTab({ rombelList, onOpenAddModal, onEditWali, isKamad }: MasterRombelTabProps) {
  return (
    <Card className="border-border shadow-sm bg-card">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> Rombongan Belajar & Kelas Active
          </CardTitle>
          <CardDescription className="text-xs">
            Daftar 27 Rombel resmi MTsN 2 Cilacap (Kelas VII, VIII, IX) berserta Wali Kelas pengampu.
          </CardDescription>
        </div>
        {!isKamad && (
          <Button size="sm" className="bg-primary text-primary-foreground font-bold text-xs gap-1" onClick={onOpenAddModal}>
            <Plus className="h-4 w-4" /> Tambah Rombel Baru
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/60 text-left border-b border-border font-bold text-muted-foreground">
            <tr>
              <th className="py-3 px-4">Nama Rombel</th>
              <th className="py-3 px-3">Tingkat</th>
              <th className="py-3 px-4">Wali Kelas Pengampu</th>
              <th className="py-3 px-3 text-center">Kapasitas Siswa</th>
              <th className="py-3 px-3 text-center">Status Sesi</th>
              <th className="py-3 px-4 text-center">Aksi / Kelola Wali</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rombelList.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30 transition">
                <td className="py-3 px-4 font-bold text-foreground">{r.name}</td>
                <td className="py-3 px-3 font-semibold">{r.grade}</td>
                <td className="py-3 px-4 font-semibold text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                  <span>👨‍🏫</span>
                  <span>{r.waliKelas}</span>
                </td>
                <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600">{r.studentCount || 32} Siswa</td>
                <td className="py-3 px-3 text-center">
                  <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                    ✓ AKTIF
                  </Badge>
                </td>
                <td className="py-3 px-4 text-center">
                  {!isKamad ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-[11px] font-bold border-teal-500/40 text-teal-600 dark:text-teal-400 bg-teal-500/10 hover:bg-teal-500/20"
                      onClick={() => onEditWali?.(r)}
                    >
                      <PencilLine className="h-3.5 w-3.5" /> Edit Wali Kelas
                    </Button>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-slate-400">
                      🔒 Read-Only
                    </Badge>
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
