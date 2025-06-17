<template>
  <div class="approval-card" :style="cardStyle">
    <div class="card-header">
      <span class="card-title">{{ approval.title }}</span>
      <span
        class="card-status"
        :style="{ color: statusInfo.color, background: statusInfo.bg }"
      >
        {{ statusInfo.label }}
      </span>
    </div>
    <div class="card-meta">
      <span>{{ approval.drafterName }}</span> /
      <span>{{ approval.drafterDeptName }}</span> /
      <span>{{ formatDate(approval.createdAt) }}</span>
    </div>
    <div class="card-approver">
      결재자: {{ approval.approverName }} ({{ approval.approvalDeptName }} /
      {{ approval.approvalPositionName }})
    </div>
    <div class="card-actions">
      <button v-if="approval.status === 'WAITING'">결재하기</button>
      <button v-else-if="approval.status === 'IN_PROGRESS'">진행상황</button>
      <button v-else-if="approval.status === 'DRAFT'">계속작성</button>
      <button v-else-if="approval.status === 'REJECTED'">반려사유보기</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  approval: Object,
});

// 상태별 스타일/라벨 매핑
const statusMap = {
  DRAFT: { label: "임시저장", color: "#2563eb", bg: "#e0e7ff" },
  WAITING: { label: "결재대기", color: "#fbbf24", bg: "#fefce8" },
  IN_PROGRESS: { label: "진행중", color: "#38bdf8", bg: "#ecfdf5" },
  APPROVED: { label: "결재완료", color: "#22c55e", bg: "#e3fcec" },
  REJECTED: { label: "반려", color: "#ef4444", bg: "#fef2f2" },
};

const statusInfo = statusMap[props.approval.status] || {
  label: "기타",
  color: "#888",
  bg: "#eee",
};

const cardStyle = {
  border: `2px solid ${statusInfo.color}`,
  background: statusInfo.bg,
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  return dateStr.replace("T", " ").slice(0, 16);
}
</script>

<style scoped>
.approval-card {
  border-radius: 16px;
  margin-bottom: 24px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: box-shadow 0.15s;
}
.approval-card:hover {
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.08);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.card-title {
  font-size: 18px;
  font-weight: 600;
}
.card-status {
  font-size: 15px;
  font-weight: 600;
  border-radius: 8px;
  padding: 4px 12px;
}
.card-meta {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}
.card-approver {
  font-size: 14px;
  color: #2563eb;
  margin-bottom: 10px;
}
.card-actions button {
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-right: 8px;
  transition: background 0.15s;
}
.card-actions button:hover {
  background: #1d4ed8;
}
</style>
