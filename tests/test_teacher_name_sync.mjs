import assert from 'node:assert/strict';

function isSubjectNameMatch(schedMapel, targetMapel) {
  const s1 = (schedMapel || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const s2 = (targetMapel || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!s1 || !s2) return false;
  if (s1 === s2) return true;

  // 1. Cek dulu apakah Matematika
  const isS1Mtk = s1.includes("matematika") || s1 === "mtk";
  const isS2Mtk = s2.includes("matematika") || s2 === "mtk";

  // 2. Cek apakah TIK / Informatika (TIDAK BOLEH jika itu Matematika)
  const isS1Tik = !isS1Mtk && (s1 === "tik" || s1.includes("informatika") || s1.includes("komputer") || /(^|[^a-z0-9])tik([^a-z0-9]|$)/i.test(schedMapel));
  const isS2Tik = !isS2Mtk && (s2 === "tik" || s2.includes("informatika") || s2.includes("komputer") || /(^|[^a-z0-9])tik([^a-z0-9]|$)/i.test(targetMapel));

  if (isS1Tik || isS2Tik) {
    return isS1Tik && isS2Tik;
  }
  if (isS1Mtk || isS2Mtk) {
    return isS1Mtk && isS2Mtk;
  }

  // Standard school subject aliases
  if ((s1 === "ipa" || s1 === "ilmupendidikanalam") && (s2 === "ipa" || s2 === "ilmupendidikanalam")) return true;
  if ((s1 === "ips" || s1 === "ilmupendidikansosial") && (s2 === "ips" || s2 === "ilmupendidikansosial")) return true;
  if (s1.includes("jawa") && s2.includes("jawa")) return true;
  if ((s1.includes("pjok") || s1.includes("jasmani")) && (s2.includes("pjok") || s2.includes("jasmani"))) return true;
  if ((s1.includes("bk") || s1.includes("bimbingan")) && (s2.includes("bk") || s2.includes("bimbingan"))) return true;
  if ((s1.includes("seni") || s1.includes("prakarya")) && (s2.includes("seni") || s2.includes("prakarya"))) return true;
  if ((s1.includes("quran") || s1.includes("hadis") || s1.includes("hadist")) && (s2.includes("quran") || s2.includes("hadis") || s2.includes("hadist"))) return true;
  if ((s1.includes("akidah") || s1.includes("akhlak")) && (s2.includes("akidah") || s2.includes("akhlak"))) return true;
  if ((s1.includes("sejarah") || s1.includes("ski")) && (s2.includes("sejarah") || s2.includes("ski"))) return true;
  if ((s1.includes("kewarganegaraan") || s1.includes("pkn")) && (s2.includes("kewarganegaraan") || s2.includes("pkn"))) return true;
  if (s1.includes("arab") && s2.includes("arab")) return true;

  if (s1.length >= 4 && s2.length >= 4) {
    return s1.includes(s2) || s2.includes(s1);
  }

  return false;
}

// 1. Test Canonical Teacher Name Resolver
console.log("👉 [TEST 1] Canonical Teacher Name Resolver...");
import { resolveCanonicalTeacherName } from "../src/utils/teacherNameResolver.ts";
assert.equal(resolveCanonicalTeacherName("MITA MUNAWAROH, S.Kom"), "MITA MUNAWAROH, S.Kom");
assert.equal(resolveCanonicalTeacherName("MITA MUNAWAROH, S.Pd"), "MITA MUNAWAROH, S.Kom");
assert.equal(resolveCanonicalTeacherName("Hj. SITI MUHSINAH, S.Ag"), "Hj. SITI MUHSINAH, M.Pd");
assert.equal(resolveCanonicalTeacherName("H. ANI YULIANI, S.Pd"), "Hj. ANI YULIANI, S.Pd");
assert.equal(resolveCanonicalTeacherName("Hj. NANGIMAH, S.Pd."), "Hj. NANGIMAH, S.Pd.");
assert.equal(resolveCanonicalTeacherName("RINDANG FARIHA DIANA, S.Pd"), "RINDANG FARIHA IDANA, S.Pd");
console.log("✅ [PASS] Canonical Teacher Name Resolver passed!");

// 2. Test isSubjectNameMatch Strict Isolation
console.log("👉 [TEST 2] isSubjectNameMatch Strict Isolation...");
assert.equal(isSubjectNameMatch("TIK", "Matematika"), false);
assert.equal(isSubjectNameMatch("Matematika", "TIK"), false);
assert.equal(isSubjectNameMatch("Informatika", "Informatika (TIK)"), true);
assert.equal(isSubjectNameMatch("TIK", "Informatika (TIK)"), true);
assert.equal(isSubjectNameMatch("Matematika", "Matematika"), true);
assert.equal(isSubjectNameMatch("MTK", "Matematika"), true);
console.log("✅ [PASS] isSubjectNameMatch Strict Isolation passed!");

console.log("\n🎉 ALL TESTS PASSED PERFECTLY!");
