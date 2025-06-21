<template>
  <div class="info-form">
    <ApprovalList
      :approvalList="approvalList"
      :activeTab="activeTab"
      @tab-change="handleTabChange"
    />
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import ApprovalList from "@/components/hq/approval/ApprovalList.vue";

const handleTabChange = (tabValue) => {
  emit("tab-change", tabValue); // Info.vue 로 전달
};
const emit = defineEmits(["tab-change"]);

const props = defineProps({
  approvalList: {
    type: Array,
    required: true,
  },
  activeTab: { type: String, required: true },
});

const getStatusClass = (status) => {
  const statusMap = {
    DRAFT: "status-draft",
    IN_PROGRESS: "status-progress",
    APPROVED: "status-approved",
    REJECTED: "status-rejected",
  };
  return statusMap[status] || "";
};

const getStatusText = (status) => {
  const statusMap = {
    DRAFT: "임시저장",
    IN_PROGRESS: "결재 중",
    APPROVED: "결재완료",
    REJECTED: "결재반려",
  };
  return statusMap[status] || status;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<style scoped>
.info-form {
  background: #fff;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 8px 0 rgba(64, 102, 250, 0.03);
  padding: 24px 32px;
  width: 100%;
  box-sizing: border-box;
}

.approval-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  text-align: center;
  padding: 48px;
  color: #6c757d;
  font-size: 1.1rem;
  width: 100%;
  box-sizing: border-box;
}

.approval-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.approval-item {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;
}

.approval-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.approval-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.approval-item__title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #212529;
}

.approval-item__status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-draft {
  background: #e9ecef;
  color: #495057;
}

.status-progress {
  background: #e3f2fd;
  color: #1976d2;
}

.status-approved {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-rejected {
  background: #ffebee;
  color: #c62828;
}

.approval-item__content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.approval-item__info {
  display: flex;
  gap: 16px;
  color: #6c757d;
  font-size: 0.9rem;
}

.approval-item__description {
  color: #495057;
  font-size: 0.95rem;
  line-height: 1.5;
}
</style>
