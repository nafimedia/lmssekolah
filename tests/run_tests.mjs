import { runAuthSecurityTests } from "./unit/auth_security.test.mjs";
import { runFileValidationTests } from "./unit/file_validation.test.mjs";
import { runPaginationTests } from "./unit/pagination_math.test.mjs";
import { runLearningTopicsTests } from "./unit/learning_topics.test.mjs";
import { runScheduleHelperTests } from "./unit/schedule_helper.test.mjs";
import { runServerCacheTests } from "./unit/server_cache.test.mjs";
import { runExcelAkmParserTests } from "./unit/excel_akm_parser.test.mjs";

async function runAllTests() {
  console.log("=================================================");
  console.log("🚀 LMS MTsN 2 CILACAP — AUTOMATED TEST SUITE RUNNER");
  console.log("=================================================\n");

  const startTime = Date.now();
  let passedCount = 0;
  let failedCount = 0;

  try {
    await runAuthSecurityTests();
    passedCount++;
  } catch (err) {
    console.error("❌ [FAIL] Auth Security Tests Failed:", err);
    failedCount++;
  }

  try {
    await runFileValidationTests();
    passedCount++;
  } catch (err) {
    console.error("❌ [FAIL] File Validation Tests Failed:", err);
    failedCount++;
  }

  try {
    await runPaginationTests();
    passedCount++;
  } catch (err) {
    console.error("❌ [FAIL] Pagination Tests Failed:", err);
    failedCount++;
  }

  try {
    await runLearningTopicsTests();
    passedCount++;
  } catch (err) {
    console.error("❌ [FAIL] Learning Topics Tests Failed:", err);
    failedCount++;
  }

  try {
    await runScheduleHelperTests();
    passedCount++;
  } catch (err) {
    console.error("❌ [FAIL] Schedule Helper Tests Failed:", err);
    failedCount++;
  }

  try {
    await runServerCacheTests();
    passedCount++;
  } catch (err) {
    console.error("❌ [FAIL] Server Cache Tests Failed:", err);
    failedCount++;
  }

  try {
    await runExcelAkmParserTests();
    passedCount++;
  } catch (err) {
    console.error("❌ [FAIL] Excel AKM Parser Tests Failed:", err);
    failedCount++;
  }

  const durationMs = Date.now() - startTime;
  console.log("\n=================================================");
  console.log(`📊 TEST SUITE SUMMARY (${durationMs}ms)`);
  console.log(`✅ Passed Suites: ${passedCount}`);
  console.log(`❌ Failed Suites: ${failedCount}`);
  console.log("=================================================");

  process.exitCode = failedCount > 0 ? 1 : 0;
}

runAllTests();
