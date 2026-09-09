export type QuestionType = "pg" | "benar_salah" | "essay" | "isian";
export type ExamStatus = "Draft" | "Terjadwal" | "Dibuka" | "Selesai";
export type StudentExamStatus = "Sedang Mengerjakan" | "Selesai" | "Dikunci System";
export type QuestionDifficulty = "Mudah" | "Sedang" | "Sukar";

export interface CBTExam {
  id: string;
  title: string;
  mapel: string;
  kelas: string;
  token: string;
  durationMinutes: number;
  passingScore: number;
  soalCount: number;
  status: ExamStatus;
  durasi?: string;
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  questionLimit?: number;
  isRemedial?: boolean;
  parentExamId?: number | null;
  dateStart?: string;
  dateEnd?: string;
}

export interface CBTQuestion {
  id: string;
  examId?: string;
  questionType: QuestionType;
  questionText: string;
  imageUrl?: string;
  options: {
    A: string;
    B: string;
    C?: string;
    D?: string;
  };
  correctOption: string; // "A" | "B" | "C" | "D" | "Benar" | "Salah"
  points: number;
  difficulty: QuestionDifficulty;
  author?: string;
  mapel?: string;
}

export interface CBTStudentExam {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  nis: string;
  classRombel: string;
  startTime?: string;
  endTime?: string;
  scorePg: number;
  scoreEssay: number;
  totalScore: number;
  violationCount: number;
  status: StudentExamStatus;
  isPassed: boolean;
}

export interface CBTGradeAnalysisItem {
  id: string;
  examId?: string;
  name: string;
  nis: string;
  classRombel: string;
  subjectName: string;
  pgScore: number;
  essayScore: number;
  totalScore: number;
  status: "Lulus KKM" | "Remedial" | "Perlu Dikoreksi";
  kkm: number;
  studentAnswers?: string; // JSON string of per-question answers
  lastAttemptDate?: string;
}
