import * as XLSX from "xlsx";
import type { QuestionType, CBTQuestion } from "@/types/cbt";

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
  questionType: QuestionType;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  keyAnswer: string;
  points: number;
  extraData?: CBTQuestion["extraData"];
}

/**
 * Mengunduh berkas template Excel (.xlsx) resmi untuk Bank Soal CBT MTsN 2 Cilacap
 * Mendukung 9 Ragam Soal Standar Asesmen Nasional / AKM & Teks Berharakat Bahasa Arab
 */
export function downloadCbtTemplateExcel(filename = "Template_Bank_Soal_CBT_AKM_MTsN2.xlsx") {
  const headers = [
    "No",
    "Jenis Soal",
    "Pertanyaan / Teks Soal",
    "Pilihan A / Premis 1",
    "Pilihan B / Premis 2",
    "Pilihan C / Respon 1",
    "Pilihan D / Respon 2",
    "Kunci Jawaban",
    "Poin",
    "Data Tambahan (Pasangan / Toleransi / Target Kalimat)",
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
      "",
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
      "",
    ],
    [
      3,
      "pg_kompleks",
      "Manakah pernyataan berikut yang termasuk rukun iman? (Pilih semua jawaban yang benar)",
      "Iman kepada Allah",
      "Iman kepada Malaikat",
      "Mendirikan Shalat 5 Waktu",
      "Menunaikan Ibadah Haji",
      "A, B",
      10,
      "A,B",
    ],
    [
      4,
      "menjodohkan",
      "Jodohkanlah nama Nabi berikut dengan mukjizat yang dianugerahkan Allah kepadanya!",
      "Nabi Musa AS",
      "Nabi Ibrahim AS",
      "Membelah Laut Merah",
      "Tidak Hangus Terbakar Api",
      "Sesuai Pasangan",
      10,
      "Nabi Musa AS:Membelah Laut Merah; Nabi Ibrahim AS:Tidak Hangus Terbakar Api; Nabi Nuh AS:Membuat Bahtera Besar",
    ],
    [
      5,
      "merangkai_kalimat",
      "Susunlah kata-kata acak berikut menjadi kalimat Bahasa Arab yang sempurna!",
      "",
      "",
      "",
      "",
      "يَذْهَبُ التِّلْمِيذُ إِلَى الْمَدْرَسَةِ صَبَاحًا",
      10,
      "يَذْهَبُ التِّلْمِيذُ إِلَى الْمَدْرَسَةِ صَبَاحًا",
    ],
    [
      6,
      "benar_salah",
      "Rukun Islam yang pertama adalah Mengucapkan Dua Kalimah Syahadat.",
      "Benar",
      "Salah",
      "",
      "",
      "Benar",
      5,
      "",
    ],
    [
      7,
      "isian",
      "Proses pembentukan makanan oleh tumbuhan hijau dengan bantuan sinar matahari disebut proses...",
      "",
      "",
      "",
      "",
      "Fotosintesis",
      5,
      "Fotosintesis",
    ],
    [
      8,
      "essay",
      "Jelaskan hikmah pelaksanaan ibadah puasa di bulan Ramadhan terhadap pembentukan akhlak peserta didik!",
      "",
      "",
      "",
      "",
      "Koreksi Manual Guru",
      10,
      "",
    ],
    [
      9,
      "numerik",
      "Sebuah lingkaran memiliki jari-jari 7 cm. Hitunglah keliling lingkaran tersebut! (Gunakan pi = 22/7)",
      "",
      "",
      "",
      "",
      "44",
      5,
      "0.5",
    ],
    [
      10,
      "melengkapi",
      "Malaikat yang bertugas meniup sangkakala pada hari kiamat adalah Malaikat [...]",
      "",
      "",
      "",
      "",
      "Israfil",
      5,
      "Israfil",
    ],
  ];

  const wsData = [headers, ...sampleData];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws["!cols"] = [
    { wch: 6 },  // No
    { wch: 20 }, // Jenis Soal
    { wch: 60 }, // Pertanyaan / Teks Soal
    { wch: 28 }, // Pilihan A
    { wch: 28 }, // Pilihan B
    { wch: 28 }, // Pilihan C
    { wch: 28 }, // Pilihan D
    { wch: 22 }, // Kunci Jawaban
    { wch: 8 },  // Poin
    { wch: 45 }, // Data Tambahan
  ];

  // Lembar Panduan
  const guideHeaders = ["Jenis Soal (Kode)", "Nama Format", "Cara Penulisan Opsi & Kunci", "Kolom Data Tambahan"];
  const guideRows = [
    ["pg", "Pilihan Ganda Tunggal", "Isi Opsi A-D, Kunci: A / B / C / D", "Kosongkan"],
    ["pg_kompleks", "Pilihan Ganda Kompleks", "Isi Opsi A-D, Kunci: huruf dipisah koma (misal: A, B)", "Boleh diisi kombinasi kunci contoh: A,C"],
    ["menjodohkan", "Menjodohkan", "Bisa isi Opsi A/B/C/D sebagai contoh pasangan", "Format: Premis1:Respon1; Premis2:Respon2; Premis3:Respon3"],
    ["merangkai_kalimat", "Merangkai Kalimat", "Kosongkan opsi, isi Kunci dengan kalimat target utuh", "Isi dengan kalimat target utuh (kata akan otomatis diacak)"],
    ["benar_salah", "Benar / Salah", "Opsi A = Benar, Opsi B = Salah, Kunci = Benar / Salah", "Kosongkan"],
    ["isian", "Isian Singkat", "Kosongkan opsi, isi Kunci dengan kata kunci jawaban", "Boleh diisi variasi sinonim kata kunci"],
    ["essay", "Esai / Uraian", "Kosongkan opsi, Kunci: Koreksi Manual Guru", "Kosongkan"],
    ["numerik", "Numerik (Angka)", "Kosongkan opsi, Kunci: nilai angka target (misal: 44)", "Nilai batas toleransi simpangan (misal: 0.5)"],
    ["melengkapi", "Melengkapi Kalimat Rumpang", "Gunakan simbol [...] pada teks soal, Kunci = kata yang hilang", "Kata pengisi rumpang"],
  ];
  const wsGuide = XLSX.utils.aoa_to_sheet([guideHeaders, ...guideRows]);
  wsGuide["!cols"] = [{ wch: 20 }, { wch: 28 }, { wch: 45 }, { wch: 45 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Bank Soal CBT");
  XLSX.utils.book_append_sheet(wb, wsGuide, "Panduan 9 Ragam AKM");
  XLSX.writeFile(wb, filename);
}

/**
 * Membaca dan memparsing berkas Excel (.xlsx / .csv) untuk Bank Soal CBT MTsN 2 Cilacap
 * Mendukung pembacaan lengkap 9 jenis butir soal standar AKM
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
        let colIdxExtra = -1;

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
            } else if (cell.includes("pilihan a") || cell.includes("opsi a") || cell === "a" || cell.includes("premis 1")) {
              colIdxOptA = c;
            } else if (cell.includes("pilihan b") || cell.includes("opsi b") || cell === "b" || cell.includes("premis 2")) {
              colIdxOptB = c;
            } else if (cell.includes("pilihan c") || cell.includes("opsi c") || cell === "c" || cell.includes("respon 1")) {
              colIdxOptC = c;
            } else if (cell.includes("pilihan d") || cell.includes("opsi d") || cell === "d" || cell.includes("respon 2")) {
              colIdxOptD = c;
            } else if (cell.includes("kunci") || cell.includes("jawaban") || cell.includes("answer")) {
              colIdxKey = c;
            } else if (cell.includes("poin") || cell.includes("bobot") || cell.includes("score")) {
              colIdxPoints = c;
            } else if (cell.includes("tambahan") || cell.includes("extra") || cell.includes("pasangan") || cell.includes("toleransi")) {
              colIdxExtra = c;
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
        if (colIdxExtra === -1) colIdxExtra = 9;

        const results: CbtQuestionParsed[] = [];
        let runningId = 1;

        for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
          const row = rawRows[r];
          if (!row || row.length === 0) continue;

          const questionText = String(row[colIdxQuestion] || "").trim();
          if (!questionText) continue;

          const rawType = String(row[colIdxType] || "pg").trim().toLowerCase();
          let qType: QuestionType = "pg";

          if (rawType.includes("kompleks")) {
            qType = "pg_kompleks";
          } else if (rawType.includes("jodoh") || rawType.includes("matching")) {
            qType = "menjodohkan";
          } else if (rawType.includes("rangkai") || rawType.includes("kalimat")) {
            qType = "merangkai_kalimat";
          } else if (rawType.includes("benar") || rawType.includes("salah") || rawType === "bs") {
            qType = "benar_salah";
          } else if (rawType.includes("isian") || rawType.includes("singkat")) {
            qType = "isian";
          } else if (rawType.includes("essay") || rawType.includes("uraian")) {
            qType = "essay";
          } else if (rawType.includes("numerik") || rawType.includes("angka")) {
            qType = "numerik";
          } else if (rawType.includes("lengkap") || rawType.includes("rumpang")) {
            qType = "melengkapi";
          } else {
            qType = "pg";
          }

          let optA = String(row[colIdxOptA] || "").trim();
          let optB = String(row[colIdxOptB] || "").trim();
          let optC = String(row[colIdxOptC] || "").trim();
          let optD = String(row[colIdxOptD] || "").trim();
          const rawKey = String(row[colIdxKey] || "A").trim();
          const extraVal = String(row[colIdxExtra] || "").trim();
          const parsedPoints = parseInt(String(row[colIdxPoints] || "5"), 10) || 5;

          let keyAnswer = "A";
          let extraData: CBTQuestion["extraData"] = undefined;

          if (qType === "pg") {
            const upper = rawKey.toUpperCase();
            if (["A", "B", "C", "D"].includes(upper)) keyAnswer = upper;
            else if (upper.startsWith("B")) keyAnswer = "B";
            else if (upper.startsWith("C")) keyAnswer = "C";
            else if (upper.startsWith("D")) keyAnswer = "D";
            else keyAnswer = "A";
          } else if (qType === "pg_kompleks") {
            const keys = (extraVal || rawKey)
              .split(/[,;\s]+/)
              .map((k) => k.trim().toUpperCase())
              .filter((k) => ["A", "B", "C", "D"].includes(k));
            keyAnswer = keys.join(",");
            const pointPerOption = Math.max(1, Math.round(parsedPoints / Math.max(1, keys.length)));
            extraData = {
              keyAnswers: keys.length > 0 ? keys : ["A"],
              optionScores: {
                A: keys.includes("A") ? pointPerOption : 0,
                B: keys.includes("B") ? pointPerOption : 0,
                C: keys.includes("C") ? pointPerOption : 0,
                D: keys.includes("D") ? pointPerOption : 0,
              },
            };
          } else if (qType === "menjodohkan") {
            keyAnswer = "Sesuai Pasangan";
            let pairs: Array<{ left: string; right: string }> = [];
            if (extraVal && extraVal.includes(":")) {
              pairs = extraVal
                .split(";")
                .map((pairStr) => {
                  const parts = pairStr.split(":");
                  return { left: (parts[0] || "").trim(), right: (parts[1] || "").trim() };
                })
                .filter((p) => p.left && p.right);
            }
            if (pairs.length === 0) {
              if (optA && optC) pairs.push({ left: optA, right: optC });
              if (optB && optD) pairs.push({ left: optB, right: optD });
            }
            extraData = { pairs: pairs.length > 0 ? pairs : [{ left: optA || "Premis 1", right: optC || "Respon 1" }] };
          } else if (qType === "merangkai_kalimat") {
            const sentence = extraVal || rawKey || questionText;
            keyAnswer = sentence;
            const words = sentence.trim().split(/\s+/).filter(Boolean);
            const shuffled = [...words].sort(() => Math.random() - 0.5);
            extraData = {
              targetSentence: sentence,
              scrambledWords: shuffled,
            };
          } else if (qType === "benar_salah") {
            optA = "Benar";
            optB = "Salah";
            optC = "";
            optD = "";
            keyAnswer = rawKey.toLowerCase().includes("salah") ? "Salah" : "Benar";
          } else if (qType === "isian") {
            keyAnswer = rawKey || extraVal || "Jawaban Singkat";
          } else if (qType === "essay") {
            keyAnswer = "Koreksi Manual Guru";
          } else if (qType === "numerik") {
            keyAnswer = rawKey || "0";
            const tol = parseFloat(extraVal) || 0;
            extraData = { tolerance: tol };
          } else if (qType === "melengkapi") {
            keyAnswer = rawKey || extraVal || "";
            extraData = { clozeAnswer: keyAnswer };
          }

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
            extraData,
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
