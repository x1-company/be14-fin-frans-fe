<template>
  <div class="approval-card">
    <div class="approver-role">
      {{
        person.type === "DRAFTER"
          ? "기안자"
          : person.type === "APPROVER"
          ? "결재자"
          : "협조자"
      }}
    </div>
    <div class="approver-name">{{ person.userName }}</div>
    <div class="approver-position"
      >{{ person.positionName }} / {{ person.departmentName }}</div
    >
    <div class="approval-status-text">{{ getStatusText(person.status) }}</div>
    <div class="signature-area">
      <img
        v-if="person.signUrl"
        :src="person.signUrl"
        alt="서명"
        class="signature-img"
      />
      <div v-else class="signature-placeholder">서명</div>
    </div>
    <div class="approval-date">{{ formatDate(person.processedAt) }}</div>
    <div class="approval-comment">{{ person.opinion }}</div>
  </div>
</template>
<script setup>
const props = defineProps({ person: Object });
function getStatusText(status) {
  if (status === "DRAFTED") return "기안";
  if (status === "APPROVED") return "승인";
  if (status === "REJECTED") return "반려";
  if (status === "WAITING") return "대기중";
  if (status === "EXPECTED") return "예정";
  return status || "";
}
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}
</script>
<style scoped>
.approval-card {
  min-width: 160px;
  max-width: 180px;
  padding: 12px 8px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  background: none;
  text-align: center;
  font-size: 13px;
}
.approver-role {
  font-size: 13px;
  font-weight: 600;
  color: #059669;
  margin-bottom: 4px;
}
.approver-name {
  font-size: 15px;
  font-weight: bold;
  color: #111;
  margin-bottom: 2px;
}
.approver-position {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}
.approval-status-text {
  font-size: 12px;
  color: #059669;
  font-weight: 500;
  margin-bottom: 8px;
}
.signature-area {
  height: 40px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.signature-img {
  width: 60px;
  height: 32px;
  object-fit: contain;
}
.signature-placeholder {
  width: 60px;
  height: 32px;
  background: #f3f4f6;
  border-radius: 4px;
  line-height: 32px;
  color: #aaa;
  font-size: 12px;
}
.approval-date {
  font-size: 11px;
  color: #666;
  margin-bottom: 2px;
}
.approval-comment {
  font-size: 11px;
  color: #555;
  font-style: italic;
}
</style>
