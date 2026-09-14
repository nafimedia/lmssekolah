import assert from "node:assert";
import { parseJamString, mergeConsecutiveSchedules } from "../../src/utils/scheduleHelper.ts";

export async function runScheduleHelperTests() {
  console.log("👉 [TEST] Running Schedule Helper & Consecutive Periods Merge Tests...");

  // 1. Test parseJamString with standard format
  const parsed1 = parseJamString("Jam 1 (07.30 - 08.10)");
  assert.strictEqual(parsed1.num, 1);
  assert.strictEqual(parsed1.start, "07.30");
  assert.strictEqual(parsed1.end, "08.10");

  const parsed2 = parseJamString("Jam 2 (08.10 - 08.50)");
  assert.strictEqual(parsed2.num, 2);
  assert.strictEqual(parsed2.start, "08.10");
  assert.strictEqual(parsed2.end, "08.50");

  // 2. Test merge consecutive schedules of the same subject
  const schedules = [
    {
      id: 1,
      mapel: "Pendidikan Pancasila dan Kewarganegaraan",
      guru: "Drs. Ahmad Dahlan",
      rombel: "VII-A",
      jam: "Jam 1 (07.30 - 08.10)",
    },
    {
      id: 2,
      mapel: "PKn",
      guru: "Drs. Ahmad Dahlan",
      rombel: "VII-A",
      jam: "Jam 2 (08.10 - 08.50)",
    },
    {
      id: 3,
      mapel: "Matematika",
      guru: "Siti Aminah, S.Pd",
      rombel: "VII-A",
      jam: "Jam 3 (09.05 - 09.45)",
    },
  ];

  const merged = mergeConsecutiveSchedules(schedules);
  assert.strictEqual(merged.length, 2, "3 periods should merge into 2 cards (PKn merged, Matematika separate)");

  // Check PKn merged card
  assert.strictEqual(merged[0].jpCount, 2, "PKn should have 2 JP");
  assert.strictEqual(merged[0].jamLabel, "Jam 1 - 2 (07.30 - 08.50)");
  assert.strictEqual(merged[0].guru, "Drs. Ahmad Dahlan");

  // Check Matematika card
  assert.strictEqual(merged[1].jpCount, 1, "Matematika should have 1 JP");
  assert.strictEqual(merged[1].jamLabel, "Jam 3 (09.05 - 09.45)");

  // 3. Test non-consecutive periods of same subject do not falsely merge together
  const nonConsecutive = [
    {
      id: 10,
      mapel: "Bahasa Indonesia",
      guru: "Budi, S.Pd",
      rombel: "VII-A",
      jam: "Jam 1 (07.30 - 08.10)",
    },
    {
      id: 11,
      mapel: "IPA",
      guru: "Dewi, M.Pd",
      rombel: "VII-A",
      jam: "Jam 2 (08.10 - 08.50)",
    },
    {
      id: 12,
      mapel: "Bahasa Indonesia",
      guru: "Budi, S.Pd",
      rombel: "VII-A",
      jam: "Jam 3 (09.05 - 09.45)",
    },
  ];

  const mergedNonConsecutive = mergeConsecutiveSchedules(nonConsecutive);
  assert.strictEqual(mergedNonConsecutive.length, 3, "Separated periods of same subject must remain separate");

  console.log("✅ [PASS] Schedule Helper & Consecutive Periods Merge Tests Passed!");
}
