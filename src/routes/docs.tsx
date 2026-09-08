import { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DOCS_DATA,
  type DocCategory,
  type DocSection,
} from "@/data/docsContent";
import logoAsset from "@/assets/logo-mtsn2.png.asset.json";
import {
  Search,
  BookOpen,
  GraduationCap,
  BookMarked,
  Building2,
  HelpCircle,
  Sun,
  Moon,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Lightbulb,
  Menu,
  X,
  AlignLeft,
  Command,
  Home,
  LogIn,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/docs")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Dokumentasi & Petunjuk Penggunaan — LMS MTsN 2 Cilacap" },
      {
        name: "description",
        content:
          "Panduan operasional dan petunjuk penggunaan bergambar resmi LMS MTsN 2 Cilacap untuk Siswa, Guru, Wali Kelas, dan Pimpinan Madrasah.",
      },
    ],
  }),
  component: DocsPage,
});

const CATEGORY_ICONS: Record<string, any> = {
  BookOpen,
  GraduationCap,
  BookMarked,
  Building2,
  HelpCircle,
  Layers,
};

function DocsPage() {
  const [selectedRole, setSelectedRole] = useState<string>("semua");
  const [activeSectionId, setActiveSectionId] = useState<string>("tentang-lms");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [previewScreenshot, setPreviewScreenshot] = useState<{
    src: string;
    alt: string;
    caption: string;
  } | null>(null);

  // Dark Mode state synced with root
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("lms_theme") === "dark" ||
        document.documentElement.classList.contains("dark")
      );
    }
    return false;
  });

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (typeof window !== "undefined") {
      if (nextDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("lms_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("lms_theme", "light");
      }
    }
  };

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter sections by role
  const filteredCategories = useMemo(() => {
    return DOCS_DATA.map((cat) => ({
      ...cat,
      sections: cat.sections.filter((sec) => {
        if (selectedRole === "semua") return true;
        return sec.role === "semua" || sec.role === selectedRole;
      }),
    })).filter((cat) => cat.sections.length > 0);
  }, [selectedRole]);

  // All sections flattened for search and prev/next
  const allSections = useMemo(() => {
    const list: DocSection[] = [];
    DOCS_DATA.forEach((cat) => list.push(...cat.sections));
    return list;
  }, []);

  // Current active section
  const currentSection = useMemo(() => {
    return allSections.find((s) => s.id === activeSectionId) || allSections[0];
  }, [activeSectionId, allSections]);

  // Prev and Next section pointers
  const currentIndex = allSections.findIndex((s) => s.id === currentSection?.id);
  const prevSection = currentIndex > 0 ? allSections[currentIndex - 1] : null;
  const nextSection =
    currentIndex < allSections.length - 1 ? allSections[currentIndex + 1] : null;

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allSections.filter(
      (sec) =>
        sec.title.toLowerCase().includes(q) ||
        sec.lead.toLowerCase().includes(q) ||
        sec.category.toLowerCase().includes(q) ||
        sec.steps?.some(
          (st) =>
            st.title.toLowerCase().includes(q) ||
            st.description.toLowerCase().includes(q)
        )
    );
  }, [searchQuery, allSections]);

  const selectSection = (id: string) => {
    setActiveSectionId(id);
    setIsMobileSidebarOpen(false);
    setIsSearchOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      {/* 1. TOP HEADER (Laravel Docs Style) */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
              aria-label="Buka Navigasi"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 group-hover:scale-105 transition-transform">
                <img
                  src={logoAsset.url}
                  alt="Logo MTsN 2 Cilacap"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white tracking-tight">
                    LMS MTsN 2 Cilacap
                  </span>
                  <Badge
                    variant="outline"
                    className="border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[10px] font-semibold uppercase tracking-wider"
                  >
                    Dokumentasi
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Kurikulum Merdeka Kemenag
                </p>
              </div>
            </Link>
          </div>

          {/* Quick Search Bar Middle (Laravel Style) */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-sm text-slate-500 transition-all hover:border-teal-500 hover:bg-white dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:border-teal-500 dark:hover:bg-slate-900"
            >
              <div className="flex items-center gap-2.5">
                <Search className="h-4 w-4 text-slate-400" />
                <span>Cari petunjuk & topik panduan...</span>
              </div>
              <kbd className="flex items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
                <Command className="h-3 w-3" />K
              </kbd>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
              aria-label="Cari"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Dark/Light Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
              aria-label="Toggle Mode Gelap/Terang"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5 text-slate-600" />
              )}
            </button>

            {/* Back to Home */}
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Beranda</span>
            </Link>

            {/* Login Portal CTA */}
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:from-teal-700 hover:to-emerald-700 transition-all shadow-teal-500/20"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Masuk Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. MAIN 3-COLUMN CONTAINER */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8 py-8">
          {/* ================= COLUMN 1: LEFT SIDEBAR (Hierarchy Nav) ================= */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-6 pr-2 max-h-[calc(100vh-7rem)] overflow-y-auto custom-scrollbar">
              {/* Role Filter Pills */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                  Saring Berdasarkan Peran
                </label>
                <div className="flex flex-wrap gap-1">
                  {[
                    { id: "semua", label: "Semua" },
                    { id: "siswa", label: "Siswa" },
                    { id: "guru", label: "Guru" },
                    { id: "walikelas", label: "Wali Kelas" },
                    { id: "kamad", label: "Kamad" },
                    { id: "admin", label: "Admin" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRole(r.id)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        selectedRole === r.id
                          ? "bg-teal-600 text-white dark:bg-teal-500 font-semibold shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Tree Navigation */}
              <nav className="space-y-6">
                {filteredCategories.map((cat) => {
                  const IconComponent =
                    CATEGORY_ICONS[cat.iconName] || BookOpen;
                  return (
                    <div key={cat.id} className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
                        <IconComponent className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        <span>{cat.title}</span>
                      </div>
                      <ul className="space-y-1 border-l border-slate-200 pl-3 dark:border-slate-800">
                        {cat.sections.map((sec) => {
                          const isActive = sec.id === currentSection?.id;
                          return (
                            <li key={sec.id}>
                              <button
                                onClick={() => selectSection(sec.id)}
                                className={`w-full text-left py-1.5 px-2 rounded-md text-sm transition-all flex items-center justify-between ${
                                  isActive
                                    ? "bg-teal-50 text-teal-700 font-semibold dark:bg-teal-950/60 dark:text-teal-300 border-l-2 border-teal-600 -ml-[13px] pl-3"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900/60"
                                }`}
                              >
                                <span className="truncate">{sec.title}</span>
                                {sec.role !== "semua" && (
                                  <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                    {sec.role}
                                  </span>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </nav>

              {/* Version Card Box */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800/80 dark:bg-slate-900/60">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white mb-1">
                  <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span>Kurikulum Merdeka</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  LMS & SIAKAD Digital Edisi Kemenag terintegrasi penuh dengan pangkalan data madrasah.
                </p>
              </div>
            </div>
          </aside>

          {/* ================= COLUMN 2: MAIN CONTENT AREA ================= */}
          <main className="flex-1 min-w-0 max-w-3xl">
            {currentSection && (
              <article className="space-y-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Dokumentasi</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-teal-600 dark:text-teal-400 font-medium">
                    {currentSection.category}
                  </span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="truncate text-slate-700 dark:text-slate-300 font-medium">
                    {currentSection.title}
                  </span>
                </nav>

                {/* Header Title */}
                <div className="space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs"
                    >
                      {currentSection.category}
                    </Badge>
                    {currentSection.role !== "semua" && (
                      <Badge className="bg-teal-600/10 text-teal-700 dark:text-teal-300 border-teal-500/20 text-xs uppercase">
                        Peran: {currentSection.role}
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {currentSection.title}
                  </h1>
                  <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                    {currentSection.lead}
                  </p>
                </div>

                {/* Paragraph Content */}
                <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                  {currentSection.content.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                {/* Callouts (Tips/Info/Warning) */}
                {currentSection.callouts?.map((c, idx) => {
                  const isTip = c.type === "tip";
                  const isWarn = c.type === "warning";
                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border p-4.5 my-6 flex gap-3.5 ${
                        isTip
                          ? "border-teal-200 bg-teal-50/70 text-teal-900 dark:border-teal-800/60 dark:bg-teal-950/40 dark:text-teal-200"
                          : isWarn
                          ? "border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200"
                          : "border-sky-200 bg-sky-50/70 text-sky-900 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-200"
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {isTip ? (
                          <Lightbulb className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                        ) : isWarn ? (
                          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        ) : (
                          <Info className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                        )}
                      </div>
                      <div className="space-y-1">
                        {c.title && (
                          <h4 className="font-bold text-sm">{c.title}</h4>
                        )}
                        <p className="text-sm leading-relaxed opacity-90">
                          {c.text}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Screenshot in Browser Mockup Frame */}
                {currentSection.screenshot && (
                  <div className="my-8 space-y-2.5">
                    <div
                      onClick={() => setPreviewScreenshot(currentSection.screenshot!)}
                      className="group cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-xl dark:border-slate-800 transition-all hover:shadow-2xl hover:border-teal-500/50"
                      title="Klik untuk memperbesar tampilan tangkapan layar"
                    >
                      {/* Window Dots Header */}
                      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
                          <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
                          <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
                        </div>
                        <div className="rounded bg-slate-800/80 px-3 py-0.5 text-[11px] font-mono text-slate-400 border border-slate-700/50">
                          lms.mtsn2cilacap.sch.id
                        </div>
                        <span className="text-[11px] text-teal-400 opacity-80 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          Perbesar 🔍
                        </span>
                      </div>
                      {/* Image Preview */}
                      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                        <img
                          src={currentSection.screenshot.src}
                          alt={currentSection.screenshot.alt}
                          className="h-full w-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
                        />
                      </div>
                    </div>
                    <p className="text-center text-xs text-slate-500 dark:text-slate-400 italic">
                      📸 {currentSection.screenshot.caption} (Klik gambar untuk melihat resolusi penuh)
                    </p>
                  </div>
                )}

                {/* Steps Section */}
                {currentSection.steps && currentSection.steps.length > 0 && (
                  <div className="space-y-4 pt-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      <span>Petunjuk Langkah Demi Langkah</span>
                    </h3>
                    <div className="space-y-4">
                      {currentSection.steps.map((st) => (
                        <div
                          key={st.number}
                          className="flex items-start gap-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all hover:bg-slate-50 dark:border-slate-800/80 dark:bg-slate-900/40 dark:hover:bg-slate-900/70"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white font-bold text-sm shadow-sm dark:bg-teal-500">
                            {st.number}
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                              {st.title}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                              {st.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Prev / Next Navigation */}
                <div className="flex items-center justify-between border-t border-slate-200 pt-8 dark:border-slate-800 mt-12">
                  {prevSection ? (
                    <button
                      onClick={() => selectSection(prevSection.id)}
                      className="group flex flex-col items-start text-left"
                    >
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        Sebelumnya
                      </span>
                      <span className="text-sm font-semibold text-slate-900 group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-400">
                        {prevSection.title}
                      </span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {nextSection && (
                    <button
                      onClick={() => selectSection(nextSection.id)}
                      className="group flex flex-col items-end text-right"
                    >
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        Selanjutnya
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                      <span className="text-sm font-semibold text-slate-900 group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-400">
                        {nextSection.title}
                      </span>
                    </button>
                  )}
                </div>
              </article>
            )}
          </main>

          {/* ================= COLUMN 3: RIGHT SIDEBAR ("On this page" TOC) ================= */}
          <aside className="hidden xl:block w-56 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
                  <AlignLeft className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span>Di Halaman Ini</span>
                </div>
                <ul className="space-y-2 text-xs border-l border-slate-200 pl-3 dark:border-slate-800">
                  <li className="text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer">
                    Ikhtisar & Ringkasan
                  </li>
                  {currentSection?.steps && (
                    <li className="text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer">
                      Langkah-Langkah Penggunaan
                    </li>
                  )}
                  {currentSection?.screenshot && (
                    <li className="text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer">
                      Tangkapan Layar Sistem
                    </li>
                  )}
                  {currentSection?.callouts && (
                    <li className="text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer">
                      Tips & Perhatian Penting
                    </li>
                  )}
                </ul>
              </div>

              {/* Quick Contact Madrasah */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-900/40 space-y-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  Perlu Bantuan Teknis?
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Jika mengalami kendala akun atau sesi ujian, hubungi Tim IT MTsN 2 Cilacap.
                </p>
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:underline dark:text-teal-400 pt-1"
                >
                  Bantuan Akun ↗
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* 3. QUICK SEARCH MODAL (Ctrl+K) */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 sm:pt-28 bg-slate-950/60 backdrop-blur-sm animate-in fade-in-0">
          <div
            className="fixed inset-0"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden z-10">
            {/* Input Header */}
            <div className="flex items-center border-b border-slate-200 px-4 dark:border-slate-800">
              <Search className="h-5 w-5 text-slate-400 shrink-0 mr-3" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik topik panduan (contoh: cbt, tahfidz, modul, rapor)..."
                className="h-14 w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2">
              {searchQuery.trim() === "" ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Ketik kata kunci untuk mencari topik panduan atau langkah pengerjaan.
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Tidak ditemukan panduan dengan kata kunci "{searchQuery}".
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => selectSection(item.id)}
                      className="w-full text-left p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors flex items-start gap-3"
                    >
                      <BookOpen className="h-4 w-4 text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {item.title}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 uppercase">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {item.lead}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400 flex items-center justify-between">
              <span>Gunakan ESC untuk menutup</span>
              <span>{searchResults.length} hasil ditemukan</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. MOBILE SIDEBAR DRAWER */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-80 max-w-full bg-white p-6 shadow-2xl dark:bg-slate-950 overflow-y-auto border-r border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
              <span className="font-bold text-slate-900 dark:text-white">
                Daftar Panduan
              </span>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Role Filter */}
            <div className="mb-6">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                Saring Berdasarkan Peran
              </label>
              <div className="flex flex-wrap gap-1">
                {[
                  { id: "semua", label: "Semua" },
                  { id: "siswa", label: "Siswa" },
                  { id: "guru", label: "Guru" },
                  { id: "walikelas", label: "Wali Kelas" },
                  { id: "kamad", label: "Kamad" },
                  { id: "admin", label: "Admin" },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      selectedRole === r.id
                        ? "bg-teal-600 text-white dark:bg-teal-500 font-semibold shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Categories */}
            <nav className="space-y-6">
              {filteredCategories.map((cat) => (
                <div key={cat.id} className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white block">
                    {cat.title}
                  </span>
                  <ul className="space-y-1 pl-2">
                    {cat.sections.map((sec) => (
                      <li key={sec.id}>
                        <button
                          onClick={() => selectSection(sec.id)}
                          className={`w-full text-left py-1.5 px-2 rounded-md text-sm transition-colors ${
                            sec.id === currentSection?.id
                              ? "bg-teal-50 text-teal-700 font-semibold dark:bg-teal-950 dark:text-teal-300"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                          }`}
                        >
                          {sec.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* 5. LIGHTBOX FULL-RESOLUTION SCREENSHOT PREVIEW MODAL */}
      {previewScreenshot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setPreviewScreenshot(null)}
        >
          <div
            className="relative max-w-5xl max-h-[92vh] w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/90">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-500 inline-block" />
                <span className="text-xs text-slate-200 font-semibold truncate max-w-sm sm:max-w-xl">
                  {previewScreenshot.caption}
                </span>
              </div>
              <button
                onClick={() => setPreviewScreenshot(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                title="Tutup (ESC)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="overflow-auto max-h-[calc(92vh-4rem)] p-2 sm:p-4 flex items-center justify-center bg-slate-950">
              <img
                src={previewScreenshot.src}
                alt={previewScreenshot.alt}
                className="max-w-full h-auto rounded-xl shadow-2xl object-contain ring-1 ring-slate-800"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
