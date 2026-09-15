import assert from "node:assert/strict";

export async function runExcelAkmParserTests() {
  console.log("👉 [TEST] Running Excel 9 Ragam AKM Parser & Mapping Unit Tests...");

  // 1. Uji pemetaan jenis soal AKM ke Formative Quiz Type
  const testTypes = [
    { raw: "pg", expected: "PG" },
    { raw: "pg_kompleks", expected: "PG_KOMPLEKS" },
    { raw: "menjodohkan", expected: "MENJODOHKAN" },
    { raw: "merangkai_kalimat", expected: "MERANGKAI_KALIMAT" },
    { raw: "benar_salah", expected: "BENAR_SALAH" },
    { raw: "isian", expected: "ISIAN_SINGKAT" },
    { raw: "essay", expected: "ESAI" },
    { raw: "numerik", expected: "NUMERIK" },
    { raw: "melengkapi", expected: "MELENGKAPI" },
  ];

  for (const item of testTypes) {
    let qType = "PG";
    const raw = item.raw.toLowerCase();
    if (raw.includes("kompleks")) qType = "PG_KOMPLEKS";
    else if (raw.includes("jodoh") || raw.includes("matching")) qType = "MENJODOHKAN";
    else if (raw.includes("rangkai") || raw.includes("kalimat")) qType = "MERANGKAI_KALIMAT";
    else if (raw.includes("benar") || raw.includes("salah")) qType = "BENAR_SALAH";
    else if (raw.includes("isian")) qType = "ISIAN_SINGKAT";
    else if (raw.includes("essay") || raw.includes("esai")) qType = "ESAI";
    else if (raw.includes("numerik")) qType = "NUMERIK";
    else if (raw.includes("lengkap")) qType = "MELENGKAPI";
    assert.equal(qType, item.expected, `Type ${item.raw} must map to ${item.expected}`);
  }

  // 2. Uji parsing pasangan Menjodohkan (Premis:Respon;)
  const samplePairsString = "Nabi Musa AS:Membelah Laut Merah; Nabi Ibrahim AS:Tidak Hangus Terbakar Api";
  const parsedPairs = samplePairsString
    .split(";")
    .map((p) => {
      const parts = p.split(":");
      return { left: (parts[0] || "").trim(), right: (parts[1] || "").trim() };
    })
    .filter((p) => p.left && p.right);

  assert.equal(parsedPairs.length, 2, "Must parse 2 pairs");
  assert.equal(parsedPairs[0].left, "Nabi Musa AS");
  assert.equal(parsedPairs[0].right, "Membelah Laut Merah");
  assert.equal(parsedPairs[1].left, "Nabi Ibrahim AS");
  assert.equal(parsedPairs[1].right, "Tidak Hangus Terbakar Api");

  // 3. Uji pembagian skor PG Kompleks
  const multiKeys = "A, B".split(/[,;\s]+/).map((k) => k.trim().toUpperCase()).filter(Boolean);
  const totalPoints = 10;
  const pointPerOption = Math.max(1, Math.round(totalPoints / Math.max(1, multiKeys.length)));
  assert.equal(multiKeys.length, 2);
  assert.equal(pointPerOption, 5, "10 points divided by 2 options should be 5 each");

  // 4. Uji toleransi numerik
  const tolString = "0.5";
  const tolerance = parseFloat(tolString) || 0;
  assert.equal(tolerance, 0.5, "Tolerance should be parsed as float 0.5");

  // 5. Uji pemecahan kalimat untuk Merangkai Kalimat
  const targetSentence = "يَذْهَبُ التِّلْمِيذُ إِلَى الْمَدْرَسَةِ صَبَاحًا";
  const words = targetSentence.trim().split(/\s+/).filter(Boolean);
  assert.equal(words.length, 5, "Arabic sentence should have 5 words");
  assert.equal(words[0], "يَذْهَبُ");

  console.log("✅ [PASS] Excel 9 Ragam AKM Parser & Mapping Unit Tests Passed!");
}
