<template>
  <div class="approval-line-view">
    <!-- Content -->
    <div class="content-section">
      <!-- Title -->
      <div class="title-section">
        <h1 class="main-title">결재선</h1>
        <h2 class="sub-title">결재 진행 상황</h2>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-section">
        <div class="loading-spinner"></div>
        <p>결재선 정보를 불러오는 중...</p>
      </div>

      <!-- Approval Progress Flow (결재자 + 협조자 순서) -->
      <div v-else-if="approvalSequence.length > 0" class="approval-flow">
        <div class="flow-container">
          <ApprovalFlowItem
            v-for="(person, index) in approvalSequence"
            :key="person.id"
            :person="person"
            :isLast="index === approvalSequence.length - 1"
            :index="index"
            :flow="approvalSequence"
          />
        </div>
      </div>

      <!-- No Data State -->
      <div v-else class="no-data-section">
        <p>결재선 정보가 없습니다.</p>
      </div>

      <ApprovalPersonSection title="결재자" :people="approvers" type="approver">
        <template #icon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </template>
      </ApprovalPersonSection>
      <ApprovalPersonSection
        title="협조자"
        :people="collaborators"
        type="collaborator"
      >
        <template #icon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
        </template>
      </ApprovalPersonSection>
      <ApprovalPersonSection
        title="참조자"
        :people="references"
        type="reference"
      >
        <template #icon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </template>
      </ApprovalPersonSection>
      <ApprovalPersonSection
        title="수신자"
        :people="recipients"
        type="recipient"
      >
        <template #icon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
        </template>
      </ApprovalPersonSection>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/lib/api";
import ApprovalFlowItem from "./ApprovalFlowItem.vue";
import ApprovalPersonSection from "./ApprovalPersonSection.vue";

const props = defineProps({
  approvalId: {
    type: [String, Number],
    required: true,
  },
  activeTab: {
    type: String,
    default: "approvalLine",
  },
});

const emit = defineEmits(["tab-change", "close"]);

// 상태 관리
const loading = ref(true);
const error = ref(null);

// 결재선 데이터
const approvalLines = ref([]);

// 결재자, 협조자, 참조자, 수신자 데이터
const approvers = ref([]);
const collaborators = ref([]);
const references = ref([]);
const recipients = ref([]);

// 결재 순서 (결재자 + 협조자가 순서대로 진행)
const approvalSequence = computed(() => {
  // DB 순서대로 결재자, 협조자만 플로우에 포함
  return approvalLines.value
    .filter((line) => line.type === "APPROVER" || line.type === "COOPERATOR")
    .map((line) => ({
      id: line.id,
      name: line.userName,
      department: line.departmentName,
      position: line.positionName,
      status: line.status,
      processedAt: line.processedAt,
      comment: line.opinion,
      commentTime: line.processedAt,
      readTime: line.checkedAt,
      type: line.type === "APPROVER" ? "approver" : "collaborator",
    }));
});

// API에서 결재선 데이터 가져오기
const fetchApprovalLines = async () => {
  try {
    loading.value = true;
    error.value = null;
    console.log("approvalId:", props.approvalId); // approvalId 확인

    const response = await api.get(
      `/api/hq/approvals/detail/${props.approvalId}/lines`
    );
    console.log("API 응답:", response.data); // 실제 데이터 구조 확인

    // line 배열만 저장
    approvalLines.value = response.data.line || [];

    // 타입별로 데이터 분류
    approvers.value = approvalLines.value
      .filter((line) => line.type === "APPROVER")
      .map((line) => ({
        id: line.id,
        name: line.userName,
        department: line.departmentName,
        position: line.positionName,
        status: line.status,
        processedAt: line.processedAt,
        comment: line.opinion,
        commentTime: line.processedAt,
        readTime: line.checkedAt,
      }));

    collaborators.value = approvalLines.value
      .filter((line) => line.type === "COOPERATOR")
      .map((line) => ({
        id: line.id,
        name: line.userName,
        department: line.departmentName,
        position: line.positionName,
        status: line.status,
        comment: line.opinion,
        commentTime: line.processedAt,
        readTime: line.checkedAt,
      }));

    references.value = approvalLines.value
      .filter((line) => line.type === "REFERENCE")
      .map((line) => ({
        id: line.id,
        name: line.userName,
        department: line.departmentName,
        position: line.positionName,
        status: line.status,
        readTime: line.checkedAt,
      }));

    recipients.value = approvalLines.value
      .filter((line) => line.type === "RECIPIENT")
      .map((line) => ({
        id: line.id,
        name: line.userName,
        department: line.departmentName,
        position: line.positionName,
        status: line.status,
        readTime: line.checkedAt,
      }));
  } catch (err) {
    console.error("결재선 데이터 조회 실패:", err);
    error.value =
      err.response?.data?.message || "결재선 데이터를 불러오는데 실패했습니다.";
  } finally {
    loading.value = false;
  }
};

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  if (props.approvalId) {
    fetchApprovalLines();
  }
});

// approvalId가 변경될 때 데이터 다시 로드
const watchApprovalId = () => {
  if (props.approvalId) {
    fetchApprovalLines();
  }
};

// approvalId 변경 감지
import { watch } from "vue";
watch(() => props.approvalId, watchApprovalId);

const getStatusIconClass = (status) => {
  switch (status) {
    case "completed":
      return "completed";
    case "pending":
      return "pending";
    case "expected":
      return "expected";
    default:
      return "default";
  }
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case "waiting":
      return "waiting";
    case "completed":
      return "completed";
    case "approved":
      return "approved";
    case "pending":
      return "pending";
    case "read":
      return "read";
    case "unread":
      return "unread";
    default:
      return "default";
  }
};

const getStatusText = (status) => {
  const statusMap = {
    waiting: "협의대기",
    completed: "협의완료",
    read: "열람완료",
    unread: "미확인",
  };
  return statusMap[status] || status;
};

const getApproverStatusText = (status) => {
  const statusMap = {
    completed: "승인완료",
    pending: "결재대기",
    approved: "승인완료",
    rejected: "반려",
  };
  return statusMap[status] || status;
};

const formatDateTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}.${month}.${day} ${hours}:${minutes}`;
};
</script>

<style scoped>
.approval-line-view {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: white;
  min-height: 100vh;
}

/* Loading State */
.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #6f42c1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.no-data-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #6c757d;
  font-size: 16px;
}

/* Header */
.header-section {
  background: white;
  /* border-bottom: 1px solid #e9ecef; */
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tab-navigation {
  display: flex;
  gap: 8px;
}

.tab-btn {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  background: white;
  color: #6c757d;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: #6f42c1;
  color: white;
  border-color: #6f42c1;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  background: white;
  color: #495057;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f8f9fa;
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

/* Content */
.content-section {
  background-color: white;
  padding: 0 32px;
  max-width: 1000px;
  margin: 0 auto;
}

.title-section {
  margin-bottom: 40px;
}

.main-title {
  font-size: 24px;
  font-weight: 700;
  color: #212529;
  margin: 0 0 8px 0;
}

.sub-title {
  font-size: 16px;
  font-weight: 500;
  color: #6c757d;
  margin: 0;
}

/* Approval Flow */
.approval-flow {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.flow-container {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 40px;
}

.flow-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1 1 0;
  min-width: 120px;
  position: relative;
}

.status-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  background: #6c757d; /* 기본 회색 */
}

.status-icon.completed {
  background: #28a745;
  color: white;
}

.status-icon.pending {
  background: #007bff;
  color: white;
}

.status-icon.expected {
  background: #6c757d; /* 예정일 때 회색 */
  color: white;
}

.status-icon svg {
  width: 24px;
  height: 24px;
}

.person-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 110px;
  justify-content: flex-start;
}

.person-name {
  font-size: 17px;
  font-weight: 700;
  color: #212529;
  margin-bottom: 2px;
}

.person-position,
.person-department {
  font-size: 15px;
  color: #6c757d;
  margin-bottom: 2px;
}

.process-time {
  font-size: 13px;
  color: #6c757d;
  margin-top: 8px;
}

.connection-line {
  position: absolute;
  top: 50%;
  left: 100%;
  width: 40px;
  height: 2px;
  background: #dee2e6;
  transform: translateY(-50%);
  z-index: 1;
}

/* Sections */
.section-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.section-icon {
  width: 20px;
  height: 20px;
  color: #6c757d;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #212529;
  margin: 0;
}

.person-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.person-item {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.person-main {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

.person-icon {
  width: 20px;
  height: 20px;
  color: #6c757d;
  flex-shrink: 0;
}

.person-info {
  flex: 1;
}

.person-name-role {
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 4px;
}

.person-department {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 2px;
}

.read-time {
  font-size: 12px;
  color: #6c757d;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.status-badge.waiting {
  background: #fff3cd;
  color: #856404;
}

.status-badge.completed,
.status-badge.approved {
  background: #d4edda;
  color: #155724;
}

.status-badge.pending {
  background: #cce5ff;
  color: #0066cc;
}

.status-badge.read {
  background: #d1ecf1;
  color: #0c5460;
}

.status-badge.unread {
  background: #f8d7da;
  color: #721c24;
}

.person-comment {
  background: #f8f9fa;
  padding: 16px;
  border-top: 1px solid #e9ecef;
}

.comment-text {
  font-size: 14px;
  color: #495057;
  line-height: 1.5;
  margin-bottom: 8px;
}

.comment-time {
  font-size: 12px;
  color: #6c757d;
}

/* Responsive */
@media (max-width: 768px) {
  .content-section {
    padding: 16px;
  }

  .flow-container {
    flex-direction: column;
    gap: 24px;
  }

  .connection-line {
    display: none;
  }

  .person-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .status-badge {
    align-self: flex-start;
  }
}
</style>
