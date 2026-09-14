import assert from "node:assert/strict";

export async function runLearningTopicsTests() {
  console.log("👉 [TEST] Running Learning Topics & Bab Grouping Unit Tests...");

  // 1. Test topic sequence ordering
  const sampleTopics = [
    { id: "top_2", title: "Bab 2: Persamaan", sequence_order: 2 },
    { id: "top_1", title: "Bab 1: Aljabar", sequence_order: 1 },
    { id: "top_3", title: "Bab 3: Geometri", sequence_order: 3 },
  ];

  sampleTopics.sort((a, b) => (a.sequence_order || 1) - (b.sequence_order || 1));
  assert.equal(sampleTopics[0].id, "top_1", "Topic order should sort ascending");
  assert.equal(sampleTopics[2].id, "top_3", "Topic order should end with highest sequence");

  // 2. Test material grouping by topic_id
  const sampleMaterials = [
    { id: "m1", title: "Video Aljabar", topic_id: "top_1", status: "Aktif" },
    { id: "m2", title: "PDF Persamaan", topic_id: "top_2", status: "Aktif" },
    { id: "m3", title: "LKPD Aljabar", topic_id: "top_1", status: "Terkunci" },
    { id: "m4", title: "Catatan Lama", topic_id: null, status: "Aktif" },
  ];

  const top1Materials = sampleMaterials.filter((m) => m.topic_id === "top_1");
  assert.equal(top1Materials.length, 2, "Topic 1 should have 2 materials");

  const unassigned = sampleMaterials.filter((m) => !m.topic_id);
  assert.equal(unassigned.length, 1, "Should identify unassigned materials");

  // 3. Test Show/Hide filter for student view
  const studentVisibleMaterials = top1Materials.filter((m) => m.status.toLowerCase() !== "terkunci");
  assert.equal(studentVisibleMaterials.length, 1, "Only unlocked materials should be visible to students");
  assert.equal(studentVisibleMaterials[0].id, "m1");

  // 4. Test Bab-Level Hide (Moodle Section-level hiding)
  const lockedTopicIds = new Set(["top_2"]); // Bab 2 is hidden (like Moodle eye-off icon)
  const studentFilteredAll = sampleMaterials.filter((m) => {
    if (m.topic_id && lockedTopicIds.has(m.topic_id)) return false;
    return m.status.toLowerCase() !== "terkunci";
  });
  assert.equal(studentFilteredAll.some((m) => m.id === "m2"), false, "Materials in locked topic must be hidden from students");
  assert.equal(studentFilteredAll.some((m) => m.id === "m1"), true, "Materials in active topic must be visible");

  console.log("✅ [PASS] Learning Topics & Bab Grouping Unit Tests Passed!");
}
