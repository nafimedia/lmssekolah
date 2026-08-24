import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderKanban, Award, Inbox, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { StudentHeaderBanner } from "@/components/dashboard/components/StudentHeaderBanner";
import { MysqlDataService } from "@/services/mysqlDataService";

export interface P5ProjectItem {
  id: string;
  title: string;
  target: string;
  coordinator: string;
  progress: number;
  studentsCount: number;
  status: string;
  outcomes: string[];
  dimensions?: string;
}

export function KokurikulerSiswaModule({ userProfile }: { userProfile?: any } = {}) {
  const [projectsList, setProjectsList] = useState<P5ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    MysqlDataService.getP5Projects()
      .then((dbList) => {
        if (!isMounted) return;
        if (dbList && dbList.length > 0) {
          const mapped: P5ProjectItem[] = dbList.map((item, idx) => ({
            id: String(item.id || `p-${idx + 1}`),
            title: item.title,
            target: item.class_name || `Tingkat Kelas`,
            coordinator: (item as any).coordinator || "Koordinator P5-PPRA",
            progress: item.progress_pct || 0,
            studentsCount: (item as any).students_count || 0,
            status: item.status || "Dalam Proses",
            outcomes: item.target_dimension ? [item.target_dimension] : [],
            dimensions: item.target_dimension || "Profil Pelajar Pancasila",
          }));
          setProjectsList(mapped);
        } else {
          setProjectsList([]);
        }
      })
      .catch(() => {
        if (isMounted) setProjectsList([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <StudentHeaderBanner
        title="Kegiatan Kokurikuler & P5 Saya"
        subtitle="Projek Penguatan Profil Pelajar Pancasila & Rahmatan Lil 'Alamin (P5-PPRA) MTsN 2 Cilacap"
        icon={FolderKanban}
        statusText={projectsList.length > 0 ? "Projek P5 Aktif" : "Belum Ada Projek P5"}
        statusVariant={projectsList.length > 0 ? "info" : "neutral"}
      />

      {isLoading ? (
        <div className="p-8 text-center text-xs text-muted-foreground">Memuat data kegiatan kokurikuler...</div>
      ) : projectsList.length === 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-border shadow-xs bg-card">
            <CardHeader className="pb-3 border-b border-border">
              <Badge variant="outline" className="text-muted-foreground text-[10px] mb-1 w-fit">STATUS PROJEK P5</Badge>
              <CardTitle className="text-base font-bold">Informasi Projek P5-PPRA Rombel</CardTitle>
              <CardDescription className="text-xs">Daftar kegiatan projek kokurikuler yang ditugaskan untuk rombel Anda.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 text-center space-y-2">
              <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <div className="font-semibold text-foreground text-sm">Belum Ada Projek P5 Aktif</div>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Database MySQL saat ini belum memiliki rekam data projek kokurikuler P5 yang ditugaskan untuk rombel Anda.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-xs bg-card">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" /> Penilaian Karakter Profil Pelajar Pancasila
              </CardTitle>
              <CardDescription className="text-xs">Evaluasi pembiasaan karakter & dimensi Rahmatan Lil 'Alamin.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 text-center space-y-2">
              <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <div className="font-semibold text-foreground text-sm">Belum Ada Evaluasi Dimensi P5</div>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Koordinator Projek belum memasukkan evaluasi capaian dimensi Profil Pelajar Pancasila pada database.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {projectsList.map((project) => (
            <Card key={project.id} className="border-border shadow-xs bg-card">
              <CardHeader className="pb-3">
                <Badge className="bg-purple-600 text-white text-[10px] mb-1 w-fit">
                  {project.status.toUpperCase()}
                </Badge>
                <CardTitle className="text-base font-bold">{project.title}</CardTitle>
                <CardDescription className="text-xs">
                  Koordinator: {project.coordinator} • Target: {project.target}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Progress Penyelesaian Projek</span>
                    <span className="text-emerald-500 font-mono font-bold">{project.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/10 space-y-2">
                  <div className="font-bold text-xs text-foreground">Target Dimensi P5:</div>
                  <div className="text-xs text-muted-foreground">
                    {project.dimensions || "Profil Pelajar Pancasila & Rahmatan Lil 'Alamin"}
                  </div>
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs mt-2"
                    onClick={() => toast.success(`Laporan Projek "${project.title}" diproses!`)}
                  >
                    + Unggah Berkas Laporan Projek PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
