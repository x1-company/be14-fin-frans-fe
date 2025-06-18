<template>
  <div class="approval-document-list">
    <!-- 문서 목록 -->
    <div class="document-list">
      <!-- 날짜별 그룹 -->
      <div
        v-for="group in groupedDocuments"
        :key="group.date"
        class="date-group"
      >
        <!-- 날짜 헤더 -->
        <div class="date-header">
          <div class="date-bullet"></div>
          <span class="date-text">{{ group.date }}</span>
        </div>

        <!-- 문서 카드들 -->
        <div class="document-cards">
          <div
            v-for="document in group.documents"
            :key="document.approvalId"
            class="document-card"
            @click="openDocument(document)"
          >
            <!-- 문서 내용 -->
            <div class="card-content">
              <!-- 왼쪽: 문서 아이콘 및 정보 -->
              <div class="document-info-section">
                <div class="document-icon-container">
                  <div
                    :class="[
                      'document-icon',
                      getDocumentTypeClass(document.code),
                    ]"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                      ></path>
                      <polyline points="14,2 14,8 20,8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                  </div>
                  <span class="document-type">{{
                    getDocumentTypeText(document.code)
                  }}</span>
                </div>

                <div class="document-details">
                  <h3 class="document-title">{{ document.title }}</h3>
                  <div class="document-date">{{
                    formatDateTime(document.createdAt)
                  }}</div>
                </div>
              </div>

              <!-- 가운데: 상태 배지 -->
              <div class="status-section">
                <div :class="['status-badge', getStatusClass(document.status)]">
                  {{ getStatusText(document.status) }}
                </div>
              </div>

              <!-- 오른쪽: 결재자 정보 및 결재선 -->
              <div class="approver-section">
                <!-- 기안자 정보 -->
                <div class="current-approver">
                  <div class="approver-avatar">
                    {{
                      document.drafterName ? document.drafterName.charAt(0) : ""
                    }}
                  </div>
                  <div class="approver-info">
                    <div class="approver-name-role">
                      <span class="approver-name">{{
                        document.drafterName
                      }}</span>
                      <span class="approver-role"
                        >/ {{ document.positionName }}</span
                      >
                    </div>
                    <div class="approver-department">{{
                      document.deptName
                    }}</div>
                  </div>
                </div>

                <!-- 결재선 플로우 -->
                <div
                  class="approval-flow"
                  v-if="document.lines && document.lines.length > 0"
                >
                  <!-- 결재 단계 -->
                  <div class="approval-steps">
                    <div
                      v-for="(step, index) in getApprovalSteps(document)"
                      :key="index"
                      class="approval-step"
                    >
                      <!-- 단계 아이콘 -->
                      <div
                        :class="['step-icon', getStepIconClass(step.status)]"
                      >
                        <svg
                          v-if="step.status === 'current'"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                        </svg>
                        <svg
                          v-else-if="step.status === 'completed'"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                        <svg
                          v-else
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                        </svg>
                      </div>

                      <!-- 연결선 -->
                      <div
                        v-if="index < getApprovalSteps(document).length - 1"
                        class="step-connector"
                      ></div>
                    </div>
                  </div>

                  <!-- 결재자 정보 -->
                  <div class="approval-line">
                    <div
                      v-for="(line, index) in document.lines.filter(
                        (l) => l.type === 'APPROVER'
                      )"
                      :key="index"
                      class="approval-person"
                    >
                      <div class="person-name">{{ line.approverName }}</div>
                      <div class="person-role">{{ line.positionName }}</div>
                    </div>
                    <div
                      v-if="
                        document.lines.filter((l) => l.type === 'APPROVER')
                          .length > 1
                      "
                      class="approval-arrow"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path d="M5 12h14"></path>
                        <path d="M12 5l7 7-7 7"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- 결재선이 없는 경우 -->
                <div v-else class="no-approval-line">
                  <span class="no-line-text">결재선 없음</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// Props
const props = defineProps({
  documents: {
    type: Array,
    default: () => [],
  },
});

// Emits
const emit = defineEmits(["document-click"]);

// 날짜별로 그룹화된 문서
const groupedDocuments = computed(() => {
  const groups = {};

  props.documents.forEach((doc) => {
    // 날짜 추출 (YYYY.MM.DD 형식)
    const datePart = doc.createdAt.split("T")[0].replace(/-/g, ".");
    const date = `${datePart} ${getWeekday(new Date(doc.createdAt))}`;

    if (!groups[date]) {
      groups[date] = {
        date,
        documents: [],
      };
    }
    groups[date].documents.push(doc);
  });

  // 날짜순 정렬 (최신순)
  return Object.values(groups).sort((a, b) => {
    const dateA = new Date(a.date.split(" ")[0].replace(/\./g, "-"));
    const dateB = new Date(b.date.split(" ")[0].replace(/\./g, "-"));
    return dateB - dateA;
  });
});

// 요일 구하기
const getWeekday = (date) => {
  const weekdays = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ];
  return weekdays[date.getDay()];
};

// 문서 클릭 핸들러
const openDocument = (document) => {
  emit("document-click", document);
};

// 문서 타입에 따른 클래스 (코드 기반)
const getDocumentTypeClass = (code) => {
  if (code.includes("APP")) return "type-approval";
  if (code.includes("APR")) return "type-request";
  return "type-default";
};

// 문서 타입 텍스트
const getDocumentTypeText = (code) => {
  if (code.includes("APP")) return "결재서";
  if (code.includes("APR")) return "요청서";
  return "문서";
};

// 상태에 따른 클래스
const getStatusClass = (status) => {
  const classMap = {
    DRAFT: "status-draft",
    IN_PROGRESS: "status-progress",
    APPROVED: "status-approved",
    REJECTED: "status-rejected",
  };
  return classMap[status] || "status-default";
};

// 상태 텍스트
const getStatusText = (status) => {
  const statusMap = {
    DRAFT: "임시저장",
    IN_PROGRESS: "결재 중",
    APPROVED: "결재완료",
    REJECTED: "결재반려",
  };
  return statusMap[status] || status;
};

// 결재 단계 생성
const getApprovalSteps = (document) => {
  if (!document.lines || document.lines.length === 0) return [];

  const approvers = document.lines.filter((line) => line.type === "APPROVER");
  return approvers.map((approver, index) => {
    let stepStatus = "pending";

    if (document.status === "APPROVED") {
      stepStatus = "completed";
    } else if (document.status === "IN_PROGRESS") {
      stepStatus = index === 0 ? "current" : "pending";
    }

    return { status: stepStatus };
  });
};

// 결재 단계 아이콘 클래스
const getStepIconClass = (stepStatus) => {
  const classMap = {
    completed: "step-completed",
    current: "step-current",
    pending: "step-pending",
  };
  return classMap[stepStatus] || "step-pending";
};

// 날짜 포맷팅
const formatDateTime = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}.${month}.${day} | ${hours}:${minutes}`;
};
</script>

<style scoped>
.approval-document-list {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}

/* 날짜 그룹 */
.date-group {
  margin-bottom: 24px;
}

.date-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f1f3f5;
  border-radius: 4px;
  margin-bottom: 16px;
}

.date-bullet {
  width: 6px;
  height: 6px;
  background: #495057;
  border-radius: 50%;
}

.date-text {
  font-size: 14px;
  font-weight: 600;
  color: #495057;
}

/* 문서 카드 */
.document-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.document-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;
}

.document-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-content {
  display: grid;
  grid-template-columns: 2fr 1fr 3fr;
  gap: 16px;
  padding: 20px;
  align-items: center;
}

/* 문서 정보 섹션 */
.document-info-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.document-icon-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.document-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.document-icon svg {
  width: 20px;
  height: 20px;
}

.type-approval {
  background: #e3f2fd;
  color: #1976d2;
}

.type-request {
  background: #fff8e1;
  color: #f57f17;
}

.type-default {
  background: #f5f5f5;
  color: #757575;
}

.document-type {
  font-size: 12px;
  color: #6c757d;
}

.document-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.document-title {
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  margin: 0;
}

.document-date {
  font-size: 14px;
  color: #6c757d;
}

/* 상태 섹션 */
.status-section {
  display: flex;
  justify-content: center;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
}

.status-draft {
  background: #e9ecef;
  color: #495057;
}

.status-progress {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-approved {
  background: #e3f2fd;
  color: #1976d2;
}

.status-rejected {
  background: #ffebee;
  color: #c62828;
}

/* 결재자 섹션 */
.approver-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.current-approver {
  display: flex;
  align-items: center;
  gap: 12px;
}

.approver-avatar {
  width: 36px;
  height: 36px;
  background: #e9ecef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
}

.approver-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.approver-name-role {
  display: flex;
  align-items: center;
  gap: 4px;
}

.approver-name {
  font-size: 14px;
  font-weight: 600;
  color: #212529;
}

.approver-role {
  font-size: 14px;
  color: #495057;
}

.approver-department {
  font-size: 13px;
  color: #6c757d;
}

/* 결재 플로우 */
.approval-flow {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.approval-steps {
  display: flex;
  align-items: center;
  justify-content: center;
}

.approval-step {
  display: flex;
  align-items: center;
}

.step-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.step-icon svg {
  width: 16px;
  height: 16px;
}

.step-completed {
  background: #4caf50;
  color: white;
}

.step-current {
  background: #2196f3;
  color: white;
}

.step-pending {
  background: #e0e0e0;
  color: #9e9e9e;
}

.step-connector {
  width: 40px;
  height: 2px;
  background: #e0e0e0;
}

/* 결재선 */
.approval-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.approval-person {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.person-name {
  font-size: 14px;
  font-weight: 500;
  color: #212529;
}

.person-role {
  font-size: 12px;
  color: #6c757d;
}

.approval-arrow {
  width: 24px;
  height: 24px;
  color: #adb5bd;
}

.approval-arrow svg {
  width: 24px;
  height: 24px;
}

/* 결재선 없음 */
.no-approval-line {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.no-line-text {
  font-size: 14px;
  color: #6c757d;
  font-style: italic;
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .card-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .status-section {
    justify-content: flex-start;
  }

  .approval-line {
    justify-content: flex-start;
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .document-info-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .document-icon-container {
    flex-direction: row;
  }
}
</style>
