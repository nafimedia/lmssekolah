export type QuizQuestionType =
  | "PG"
  | "MENJODOHKAN"
  | "BENAR_SALAH"
  | "ISIAN_SINGKAT"
  | "ESAI"
  | "NUMERIK"
  | "MELENGKAPI";

export interface MatchingPair {
  id?: string;
  left: string;
  right: string;
}

export interface FormativeQuizQuestion {
  id: number;
  type: QuizQuestionType;
  question: string;
  points: number;
  // Pilihan Ganda (PG)
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  keyAnswer?: string; // "A" | "B" | "C" | "D" | "BENAR" | "SALAH" | text | number
  // Menjodohkan (Matching)
  pairs?: MatchingPair[];
  // Numerik
  tolerance?: number;
  // Esai / Paragraf
  rubrik?: string;
  // Melengkapi Kalimat (Cloze)
  clozeAnswer?: string;
}

export const QUIZ_QUESTION_TYPE_CONFIG: Record<
  QuizQuestionType,
  { label: string; shortLabel: string; badgeColor: string; description: string }
> = {
  PG: {
    label: "Pilihan Ganda (Opsi A-D)",
    shortLabel: "Pilihan Ganda",
    badgeColor: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
    description: "Pertanyaan dengan 4 opsi pilihan jawaban (A, B, C, D) dan 1 kunci jawaban pasti.",
  },
  MENJODOHKAN: {
    label: "Menjodohkan",
    shortLabel: "Menjodohkan",
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    description: "Menghubungkan pasangan premis (kiri) dengan respon / jawaban yang tepat (kanan).",
  },
  BENAR_SALAH: {
    label: "Benar / Salah",
    shortLabel: "Benar / Salah",
    badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    description: "Pernyataan yang dinilai kebenarannya (Benar atau Salah).",
  },
  ISIAN_SINGKAT: {
    label: "Teks Singkat (Isian)",
    shortLabel: "Teks Singkat",
    badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30",
    description: "Jawaban singkat berupa satu kata atau frasa pendek terstandar.",
  },
  ESAI: {
    label: "Teks Panjang / Esai",
    shortLabel: "Esai",
    badgeColor: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
    description: "Uraian bebas atau argumen mendalam yang dinilai secara kualitatif oleh guru.",
  },
  NUMERIK: {
    label: "Numerik",
    shortLabel: "Numerik",
    badgeColor: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
    description: "Jawaban berupa angka hasil perhitungan dengan opsional batas toleransi (±).",
  },
  MELENGKAPI: {
    label: "Melengkapi Kalimat",
    shortLabel: "Melengkapi",
    badgeColor: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30",
    description: "Melengkapi bagian kata yang rumpang atau kosong pada suatu kalimat.",
  },
};

export function createNewQuizQuestion(type: QuizQuestionType, nextId: number): FormativeQuizQuestion {
  switch (type) {
    case "PG":
      return {
        id: nextId,
        type: "PG",
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        keyAnswer: "A",
        points: 10,
      };
    case "MENJODOHKAN":
      return {
        id: nextId,
        type: "MENJODOHKAN",
        question: "Jodohkan pernyataan/istilah di kolom kiri dengan pasangan yang sesuai di kolom kanan:",
        pairs: [
          { id: "p1", left: "", right: "" },
          { id: "p2", left: "", right: "" },
        ],
        points: 20,
      };
    case "BENAR_SALAH":
      return {
        id: nextId,
        type: "BENAR_SALAH",
        question: "",
        keyAnswer: "BENAR",
        points: 10,
      };
    case "ISIAN_SINGKAT":
      return {
        id: nextId,
        type: "ISIAN_SINGKAT",
        question: "",
        keyAnswer: "",
        points: 10,
      };
    case "ESAI":
      return {
        id: nextId,
        type: "ESAI",
        question: "",
        rubrik: "",
        points: 20,
      };
    case "NUMERIK":
      return {
        id: nextId,
        type: "NUMERIK",
        question: "",
        keyAnswer: "0",
        tolerance: 0,
        points: 10,
      };
    case "MELENGKAPI":
      return {
        id: nextId,
        type: "MELENGKAPI",
        question: "",
        clozeAnswer: "",
        points: 10,
      };
  }
}
