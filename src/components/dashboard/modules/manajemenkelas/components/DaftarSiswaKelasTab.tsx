import { useState, useMemo } from "react";
import { Users, Search, Send, Printer, UserCheck, ShieldCheck, Phone, CheckCircle2, ArrowUpDown, ArrowUp, ArrowDown, Pencil } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditParentDialog } from "./EditParentDialog";
import { MysqlDataService } from "@/services/mysqlDataService";
import { toast } from "sonner";

export interface StudentItem {
  id: string;
  nisn: string;
  name: string;
  class: string;
  gender: string;
  parentName: string;
  parentWa: string;
  hadirPct: number;
  statusPresensi: string;
}

interface DaftarSiswaKelasTabProps {
  classNameTitle: string;
  students: StudentItem[];
  onSendWa: (student: StudentItem) => void;
  onOpenCetakSurat: (student: StudentItem) => void;
  onUpdateStudent?: (studentId: string, parentName: string, parentWa: string) => void;
  isReadOnly?: boolean;
}

export function DaftarSiswaKelasTab({
  classNameTitle,
  students,
  onSendWa,
  onOpenCetakSurat,
  onUpdateStudent,
  isReadOnly = false,
}: DaftarSiswaKelasTabProps) {
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [isEditParentOpen, setIsEditParentOpen] = useState(false);
  const [selectedStudentForParent, setSelectedStudentForParent] = useState<StudentItem | null>(null);

  const handleSort = (colKey: string) => {
    if (sortColumn === colKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(colKey);
      setSortDir("asc");
    }
  };

  const handleOpenEditParent = (student: StudentItem) => {
    setSelectedStudentForParent(student);
    setIsEditParentOpen(true);
  };

  const handleSaveParentData = (studentId: string, parentName: string, parentWa: string) => {
    if (onUpdateStudent) {
      onUpdateStudent(studentId, parentName, parentWa);
    }
    toast.success(`Data Ortu & WA untuk siswa ${selectedStudentForParent?.name} berhasil diperbarui!`, {
      description: `Nama Ortu: ${parentName} | WA: ${parentWa}`,
    });
  };

  const filtered = useMemo(() => {
    const list = students.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.nisn.toLowerCase().includes(search.toLowerCase())
    );

    return list.sort((a, b) => {
      let valA: any = "";
      let valB: any = "";
      if (sortColumn === "name") {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortColumn === "nisn") {
        valA = a.nisn;
        valB = b.nisn;
      } else if (sortColumn === "gender") {
        valA = (a.gender || "").toLowerCase();
        valB = (b.gender || "").toLowerCase();
      } else if (sortColumn === "hadirPct") {
        valA = a.hadirPct || 0;
        valB = b.hadirPct || 0;
      }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [students, search, sortColumn, sortDir]);

  return (
    <>
      <Card className="border-border shadow-sm bg-card">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Anggota Siswa {classNameTitle}
            </CardTitle>
            <CardDescription className="text-xs">
              Daftar lengkap {students.length} siswa bimbingan, kontak WhatsApp orang tua, & rekapitulasi presensi.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Cari nama / NISN..."
                className="pl-9 h-9 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/60 text-left border-b border-border font-bold text-muted-foreground">
              <tr>
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4 cursor-pointer hover:bg-muted/80 select-none" onClick={() => handleSort("name")}>
                  <div className="flex items-center gap-1.5">
                    <span>NISN & Nama Siswa</span>
                    {sortColumn === "name" ? (
                      sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/40" />
                    )}
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:bg-muted/80 select-none" onClick={() => handleSort("gender")}>
                  <div className="flex items-center gap-1.5">
                    <span>L/P</span>
                    {sortColumn === "gender" ? (
                      sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/40" />
                    )}
                  </div>
                </th>
                <th className="py-3 px-4">Orang Tua / Wali</th>
                <th className="py-3 px-3 text-center">No. WhatsApp</th>
                <th className="py-3 px-3 text-center cursor-pointer hover:bg-muted/80 select-none" onClick={() => handleSort("hadirPct")}>
                  <div className="flex items-center justify-center gap-1.5">
                    <span>% Kehadiran</span>
                    {sortColumn === "hadirPct" ? (
                      sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/40" />
                    )}
                  </div>
                </th>
                {!isReadOnly && <th className="py-3 px-4 text-right">Aksi Wali Kelas</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s, idx) => (
                <tr key={s.id} className="hover:bg-muted/30 transition">
                  <td className="py-3 px-4 font-mono text-muted-foreground">{idx + 1}</td>
                  <td className="py-3 px-4 font-semibold">
                    <div className="font-bold text-foreground flex items-center gap-1.5">
                      {s.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">NISN: {s.nisn}</div>
                  </td>
                  <td className="py-3 px-3 font-bold">{s.gender || "L"}</td>
                  <td className="py-3 px-4 text-muted-foreground font-medium">{s.parentName || `Orang Tua ${s.name.split(" ")[0]}`}</td>
                  <td className="py-3 px-3 text-center font-mono font-semibold text-foreground">{s.parentWa}</td>
                  <td className="py-3 px-3 text-center">
                    {s.hadirPct > 0 ? (
                      <Badge className="bg-emerald-600 text-white font-mono font-bold text-[11px]">
                        {s.hadirPct}%
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground border-border">
                        0%
                      </Badge>
                    )}
                  </td>
                  {!isReadOnly && (
                    <td className="py-3 px-4 text-right space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] font-bold text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 gap-1"
                        onClick={() => handleOpenEditParent(s)}
                        title="Edit Nama Ortu & No. WA Active"
                      >
                        <Pencil className="h-3 w-3" /> Edit Ortu
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] font-bold text-purple-600 dark:text-purple-400 border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 gap-1"
                        onClick={() => onSendWa(s)}
                        title="Kirim WA Alert Ke Orang Tua"
                      >
                        <Send className="h-3 w-3" /> WA Ortu
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] font-bold gap-1"
                        onClick={() => onOpenCetakSurat(s)}
                        title="Cetak Surat Keterangan / Panggilan"
                      >
                        <Printer className="h-3 w-3" /> Surat
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <EditParentDialog
        isOpen={isEditParentOpen}
        onClose={() => setIsEditParentOpen(false)}
        student={selectedStudentForParent}
        onSave={handleSaveParentData}
      />
    </>
  );
}
