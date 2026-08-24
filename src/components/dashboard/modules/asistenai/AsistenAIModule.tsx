import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, ExternalLink } from "lucide-react";

export function AsistenAIModule({ activeRole }: { activeRole?: string } = {}) {
  const toolsList = [
    { name: "ChatGPT (OpenAI)", desc: "Asisten AI perancang RPP, kuis interaktif, & pembuatan soal CBT.", icon: "🤖", link: "https://chatgpt.com", badge: "AI Assistant", color: "from-emerald-500/20 to-teal-500/20" },
    { name: "NotebookLM (Google)", desc: "Pengolah dokumen modul ajar & rangkuman materi otomatis dari sumber PDF.", icon: "📓", link: "https://notebooklm.google.com", badge: "Google AI", color: "from-blue-500/20 to-indigo-500/20" },
    { name: "Google Workspace", desc: "Akses cepat Google Docs, Slides, Forms, & Classroom untuk KBM.", icon: "💼", link: "https://workspace.google.com", badge: "Productivity", color: "from-amber-500/20 to-orange-500/20" },
    { name: "Canva for Education", desc: "Desain presentasi media ajar interaktif & infografis pelajaran.", icon: "🎨", link: "https://canva.com", badge: "Media Design", color: "from-purple-500/20 to-pink-500/20" },
    { name: "Quizizz Interaktif", desc: "Platform kuis game gamifikasi interaktif untuk menguji pemahaman kelas.", icon: "🎮", link: "https://quizizz.com", badge: "Gamification", color: "from-red-500/20 to-rose-500/20" },
    { name: "PhET Interactive Sims", desc: "Simulasi praktikum laboratorium Sains & Matematika interaktif.", icon: "🔬", link: "https://phet.colorado.edu", badge: "Science Lab", color: "from-cyan-500/20 to-sky-500/20" },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-500" /> Asisten AI & Digital Tools Pembelajaran Guru
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kumpulan alat bantu kecerdasan buatan & media digital produksi pembelajaran yang terintegrasi untuk Guru MTsN 2 Cilacap.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {toolsList.map((t, idx) => (
          <Card key={idx} className="border-border hover:border-blue-500/50 transition shadow-xs group">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <span className="text-3xl p-2 rounded-xl bg-blue-500/10 group-hover:scale-110 transition">{t.icon}</span>
                <Badge variant="outline" className="font-mono text-[10px] font-bold text-blue-500 border-blue-500/20">
                  {t.badge}
                </Badge>
              </div>
              <CardTitle className="text-base font-bold mt-3 group-hover:text-blue-500 transition flex items-center gap-1.5">
                {t.name} <ExternalLink className="h-3.5 w-3.5 opacity-60" />
              </CardTitle>
              <CardDescription className="text-xs">{t.desc}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <a href={t.link} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="w-full text-xs font-bold gap-1.5 bg-blue-600 hover:bg-blue-700 text-white mt-2">
                  <Bot className="h-3.5 w-3.5" /> Buka {t.name.split(' ')[0]} ↗
                </Button>
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
