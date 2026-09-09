import * as XLSX from "xlsx";

export interface QuizQuestionParsed {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  keyAnswer: "A" | "B" | "C" | "D";
}

export interface CbtQuestionParsed {
  id: number;
  questionType: "pg" | "benar_salah" | "essay";
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  keyAnswer: string;
  points: number;
}

/**
 * Mengunduh berkas template Excel (.xlsx) resmi untuk Bank Soal CBT MTsN 2 Cilacap
 * Mendukung soal PG, Benar/Salah, Essay, dan teks ber-harakat Bahasa Arab
 */
export function downloadCbtTemplateExcel(filename = "Template_Bank_Soal_CBT_MTsN2.xlsx") {
  const headers = [
    "No",
    "Jenis Soal (pg / benar_salah / essay)",
    "Pertanyaan / Teks Soal",
    "Pilihan A",
    "Pilihan B",
    "Pilihan C",
    "Pilihan D",
    "Kunci Jawaban",
    "Poin",
  ];

  const sampleData = [
    [
      1,
      "pg",
      "Siapakah tokoh yang pertama kali mengemukakan istilah Pancasila dalam sidang BPUPKI?",
      "Ir. Soekarno",
      "Drs. Mohammad Hatta",
      "Prof. Dr. Soepomo",
      "Mr. Muhammad Yamin",
      "A",
      5,
    ],
    [
      2,
      "pg",
      "مَا مَعْنَى كَلِمَةُ \"مَدْرَسَةٌ\" فِي اللُّغَةِ الْإِنْدُونِيسِيَّةِ؟",
      "Sekolah",
      "Perpustakaan",
      "Rumah Sakit",
      "Kantor",
      "A",
      5,
    ],
    [
      3,
      "benar_salah",
      "Rukun Islam yang pertama adalah Mengucapkan Dua Kalimah Syahadat.",
      "Benar",
      "Salah",
      "",
      "",
      "Benar",
      5,
    ],
    [
      4,
      "essay",
      "Jelaskan hikmah pelaksanaan ibadah puasa di bulan Ramadhan terhadap pembentukan karakter peserta didik!",
      "",
      "",
      "",
      "",
      "Koreksi Manual Guru",
      10,
    ],
  ];

  const wsData = [headers, ...sampleData];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws["!cols"] = [
    { wch: 6 },  // No
    { wch: 22 }, // Jenis Soal
    { wch: 60 }, // Pertanyaan / Teks Soal
    { wch: 28 }, // Pilihan A
    { wch: 28 }, // Pilihan B
    { wch: 28 }, // Pilihan C
    { wch: 28 }, // Pilihan D
    { wch: 20 }, // Kunci Jawaban
    { wch: 10 }, // Poin
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Bank Soal CBT");
  XLSX.writeFile(wb, filename);
}

/**
 * Membaca dan memparsing berkas Excel (.xlsx / .csv) untuk Bank Soal CBT MTsN 2 Cilacap
 */
export async function parseCbtExcelFile(file: File): Promise<CbtQuestionParsed[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) return resolve([]);

        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        if (!worksheet) return resolve([]);

        const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (!rawRows || rawRows.length < 2) {
          throw new Error("Berkas Excel kosong atau tidak memiliki baris data soal.");
        }

        // Cari index kolom
        let headerRowIndex = 0;
        let colIdxType = -1;
        let colIdxQuestion = -1;
        let colIdxOptA = -1;
        let colIdxOptB = -1;
        let colIdxOptC = -1;
        let colIdxOptD = -1;
        let colIdxKey = -1;
        let colIdxPoints = -1;

        for (let r = 0; r < Math.min(rawRows.length, 5); r++) {
          const row = rawRows[r];
          if (!Array.isArray(row)) continue;

          for (let c = 0; c < row.length; c++) {
            const cell = String(row[c] || "").trim().toLowerCase();
            if (cell.includes("jenis") || cell.includes("tipe") || cell.includes("type")) {
              colIdxType = c;
              headerRowIndex = r;
            } else if (cell.includes("soal") || cell.includes("pertanyaan") || cell.includes("question")) {
              colIdxQuestion = c;
              headerRowIndex = r;
            } else if (cell.includes("pilihan a") || cell.includes("opsi a") || cell === "a") {
              colIdxOptA = c;
            } else if (cell.includes("pilihan b") || cell.includes("opsi b") || cell === "b") {
              colIdxOptB = c;
            } else if (cell.includes("pilihan c") || cell.includes("opsi c") || cell === "c") {
              colIdxOptC = c;
            } else if (cell.includes("pilihan d") || cell.includes("opsi d") || cell === "d") {
              colIdxOptD = c;
            } else if (cell.includes("kunci") || cell.includes("jawaban") || cell.includes("answer")) {
              colIdxKey = c;
            } else if (cell.includes("poin") || cell.includes("bobot") || cell.includes("score")) {
              colIdxPoints = c;
            }
          }
          if (colIdxQuestion !== -1) break;
        }

        // Fallbacks
        if (colIdxType === -1) colIdxType = 1;
        if (colIdxQuestion === -1) colIdxQuestion = 2;
        if (colIdxOptA === -1) colIdxOptA = 3;
        if (colIdxOptB === -1) colIdxOptB = 4;
        if (colIdxOptC === -1) colIdxOptC = 5;
        if (colIdxOptD === -1) colIdxOptD = 6;
        if (colIdxKey === -1) colIdxKey = 7;
        if (colIdxPoints === -1) colIdxPoints = 8;

        const results: CbtQuestionParsed[] = [];
        let runningId = 1;

        for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
          const row = rawRows[r];
          if (!row || row.length === 0) continue;

          const questionText = String(row[colIdxQuestion] || "").trim();
          if (!questionText) continue;

          let rawType = String(row[colIdxType] || "pg").trim().toLowerCase();
          let qType: "pg" | "benar_salah" | "essay" = "pg";
          if (rawType.includes("benar") || rawType.includes("salah") || rawType === "bs") {
            qType = "benar_salah";
          } else if (rawType.includes("essay") || rawType.includes("uraian")) {
            qType = "essay";
          }

          let optA = String(row[colIdxOptA] || "").trim();
          let optB = String(row[colIdxOptB] || "").trim();
          let optC = String(row[colIdxOptC] || "").trim();
          let optD = String(row[colIdxOptD] || "").trim();

          if (qType === "benar_salah") {
            optA = "Benar";
            optB = "Salah";
            optC = "";
            optD = "";
          }

          let rawKey = String(row[colIdxKey] || "A").trim();
          let keyAnswer = "A";
          if (qType === "benar_salah") {
            keyAnswer = rawKey.toLowerCase().includes("salah") ? "Salah" : "Benar";
          } else if (qType === "essay") {
            keyAnswer = "Koreksi Manual Guru";
          } else {
            const upper = rawKey.toUpperCase();
            if (["A", "B", "C", "D"].includes(upper)) keyAnswer = upper;
            else if (upper.startsWith("B")) keyAnswer = "B";
            else if (upper.startsWith("C")) keyAnswer = "C";
            else if (upper.startsWith("D")) keyAnswer = "D";
            else keyAnswer = "A";
          }

          const parsedPoints = parseInt(String(row[colIdxPoints] || "5"), 10) || 5;

          results.push({
            id: runningId++,
            questionType: qType,
            question: questionText,
            optionA: optA,
            optionB: optB,
            optionC: optC,
            optionD: optD,
            keyAnswer: keyAnswer,
            points: parsedPoints,
          });
        }

        resolve(results);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Mengunduh berkas template Excel (.xlsx) resmi untuk import soal kuis / formatif
 */
export function downloadQuizTemplateExcel(filename = "Template_Kuis_Formatif_MTsN2.xlsx") {
  const headers = [
    "No",
    "Pertanyaan / Soal",
    "Pilihan A",
    "Pilihan B",
    "Pilihan C",
    "Pilihan D",
    "Kunci Jawaban (A/B/C/D)",
  ];

  const sampleData = [
    [
      1,
      "Siapakah tokoh yang pertama kali mengemukakan istilah Pancasila dalam sidang BPUPKI?",
      "Ir. Soekarno",
      "Drs. Mohammad Hatta",
      "Prof. Dr. Soepomo",
      "Mr. Muhammad Yamin",
      "A",
    ],
    [
      2,
      "Perangkat keras komputer yang berfungsi sebagai otak pemroses data utama adalah...",
      "Harddisk Drive (HDD)",
      "Central Processing Unit (CPU)",
      "Random Access Memory (RAM)",
      "Power Supply Unit (PSU)",
      "B",
    ],
    [
      3,
      "Madrasah Tsanawiyah (MTs) merupakan jenjang pendidikan formal yang setara dengan...",
      "Sekolah Dasar (SD)",
      "Sekolah Menengah Kejuruan (SMK)",
      "Sekolah Menengah Pertama (SMP)",
      "Madrasah Aliyah (MA)",
      "C",
    ],
  ];

  const wsData = [headers, ...sampleData];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Atur lebar kolom agar proporsional dan mudah dibaca di Excel
  ws["!cols"] = [
    { wch: 6 },  // No
    { wch: 55 }, // Pertanyaan / Soal
    { wch: 30 }, // Pilihan A
    { wch: 30 }, // Pilihan B
    { wch: 30 }, // Pilihan C
    { wch: 30 }, // Pilihan D
    { wch: 25 }, // Kunci Jawaban
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Kuis Formatif");

  XLSX.writeFile(wb, filename);
}

/**
 * Membaca dan memparsing berkas Excel (.xlsx / .xls / .csv) menjadi array soal kuis
 */
export async function parseQuizExcelFile(file: File): Promise<QuizQuestionParsed[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) return resolve([]);

        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        if (!worksheet) return resolve([]);

        // Konversi sheet ke array of array (AOA)
        const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (!rawRows || rawRows.length < 2) {
          throw new Error("Berkas Excel kosong atau tidak memiliki baris data soal.");
        }

        // Cari baris header
        let headerRowIndex = -1;
        let colIdxQuestion = -1;
        let colIdxOptA = -1;
        let colIdxOptB = -1;
        let colIdxOptC = -1;
        let colIdxOptD = -1;
        let colIdxKey = -1;

        for (let r = 0; r < Math.min(rawRows.length, 5); r++) {
          const row = rawRows[r];
          if (!Array.isArray(row)) continue;

          for (let c = 0; c < row.length; c++) {
            const cell = String(row[c] || "").trim().toLowerCase();
            if (cell.includes("soal") || cell.includes("pertanyaan") || cell.includes("question")) {
              colIdxQuestion = c;
              headerRowIndex = r;
            } else if (cell.includes("pilihan a") || cell.includes("opsi a") || cell === "a") {
              colIdxOptA = c;
            } else if (cell.includes("pilihan b") || cell.includes("opsi b") || cell === "b") {
              colIdxOptB = c;
            } else if (cell.includes("pilihan c") || cell.includes("opsi c") || cell === "c") {
              colIdxOptC = c;
            } else if (cell.includes("pilihan d") || cell.includes("opsi d") || cell === "d") {
              colIdxOptD = c;
            } else if (cell.includes("kunci") || cell.includes("jawaban") || cell.includes("answer")) {
              colIdxKey = c;
            }
          }

          if (colIdxQuestion !== -1 && colIdxOptA !== -1) {
            break;
          }
        }

        // Fallback urutan kolom standar jika header tidak spesifik
        // Format standar: Col 0 = No, Col 1 = Soal, Col 2 = A, Col 3 = B, Col 4 = C, Col 5 = D, Col 6 = Kunci
        if (colIdxQuestion === -1) colIdxQuestion = 1;
        if (colIdxOptA === -1) colIdxOptA = 2;
        if (colIdxOptB === -1) colIdxOptB = 3;
        if (colIdxOptC === -1) colIdxOptC = 4;
        if (colIdxOptD === -1) colIdxOptD = 5;
        if (colIdxKey === -1) colIdxKey = 6;
        if (headerRowIndex === -1) headerRowIndex = 0;

        const results: QuizQuestionParsed[] = [];
        let runningId = 1;

        for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
          const row = rawRows[r];
          if (!row || row.length === 0) continue;

          const questionText = String(row[colIdxQuestion] || "").trim();
          if (!questionText) continue; // Lewati baris kosong

          const optA = String(row[colIdxOptA] || "").trim();
          const optB = String(row[colIdxOptB] || "").trim();
          const optC = String(row[colIdxOptC] || "").trim();
          const optD = String(row[colIdxOptD] || "").trim();

          let rawKey = String(row[colIdxKey] || "A").trim().toUpperCase();
          let keyAnswer: "A" | "B" | "C" | "D" = "A";
          if (["A", "B", "C", "D"].includes(rawKey)) {
            keyAnswer = rawKey as "A" | "B" | "C" | "D";
          } else if (rawKey.startsWith("A")) keyAnswer = "A";
          else if (rawKey.startsWith("B")) keyAnswer = "B";
          else if (rawKey.startsWith("C")) keyAnswer = "C";
          else if (rawKey.startsWith("D")) keyAnswer = "D";

          results.push({
            id: runningId++,
            question: questionText,
            optionA: optA || "Pilihan A",
            optionB: optB || "Pilihan B",
            optionC: optC || "Pilihan C",
            optionD: optD || "Pilihan D",
            keyAnswer: keyAnswer,
          });
        }

        resolve(results);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
