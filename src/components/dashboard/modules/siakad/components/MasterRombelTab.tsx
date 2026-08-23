import { Building2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MasterRombelTabProps {
  rombelList: any[];
  onOpenAddModal: () => void;
}

export function MasterRombelTab({ rombelList, onOpenAddModal }: MasterRombelTabProps) {
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
        <Button size="sm" className="bg-primary text-primary-foreground font-bold text-xs gap-1" onClick={onOpenAddModal}>
          <Plus className="h-4 w-4" /> Tambah Rombel Baru
        </Button>
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
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rombelList.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30 transition">
                <td className="py-3 px-4 font-bold text-foreground">{r.name}</td>
                <td className="py-3 px-3 font-semibold">{r.grade}</td>
                <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{r.waliKelas}</td>
                <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600">{r.studentCount || 32} Siswa</td>
                <td className="py-3 px-3 text-center">
                  <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                    ✓ AKTIF
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
