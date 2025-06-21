<template>
  <div class="approval-line-view">
    <!-- Header -->
    <div class="header-section">
      <div class="tab-navigation">
        <button
          :class="['tab-btn', { active: activeTab === 'document' }]"
          @click="$emit('tab-change', 'document')"
        >
          결재문서
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'approvalLine' }]"
          @click="$emit('tab-change', 'approvalLine')"
        >
          결재선
        </button>
      </div>
      <div class="header-actions">
        <button class="action-btn print-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="6,9 6,2 18,2 18,9" />
            <path
              d="M6,18H4a2,2,0,0,1-2-2V11a2,2,0,0,1,2-2H20a2,2,0,0,1,2,2v5a2,2,0,0,1-2,2H18"
            />
            <polyline points="6,14 6,22 18,22 18,14" />
          </svg>
          결재서 출력
        </button>
        <button class="action-btn close-btn" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          닫기
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="content-section">
      <!-- Title -->
      <div class="title-section">
        <h1 class="main-title">결재선</h1>
        <h2 class="sub-title">결재 진행 상황</h2>
      </div>

      <!-- Approval Progress Flow (결재자 + 협조자 순서) -->
      <div class="approval-flow">
        <div class="flow-container">
          <div
            v-for="(person, index) in approvalSequence"
            :key="person.id"
            class="flow-item"
          >
            <!-- Status Icon -->
            <div :class="['status-icon', getStatusIconClass(person.status)]">
              <svg
                v-if="person.status === 'completed'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <polyline points="20,6 9,17 4,12" />
              </svg>
              <svg
                v-else-if="person.status === 'pending'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
            </div>

            <!-- Person Info -->
            <div class="person-info">
              <div class="person-name">{{ person.name }}</div>
              <div class="person-position">{{ person.position }}</div>
              <div class="person-department">{{ person.department }}</div>
              <div v-if="person.processedAt" class="process-time">
                {{ formatDateTime(person.processedAt) }}
              </div>
            </div>

            <!-- Connection Line -->
            <div
              v-if="index < approvalSequence.length - 1"
              class="connection-line"
            ></div>
          </div>
        </div>
      </div>

      <!-- Approvers Section (결재자) -->
      <div class="section-container">
        <div class="section-header">
          <svg
            class="section-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M9 12l2 2 4-4" />
            <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" />
            <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" />
            <path d="M12 3v6" />
            <path d="M12 15v6" />
          </svg>
          <h3 class="section-title">결재자</h3>
        </div>

        <div class="person-list">
          <div
            v-for="approver in approvers"
            :key="approver.id"
            class="person-item"
          >
            <div class="person-main">
              <svg
                class="person-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              <div class="person-info">
                <div class="person-name-role">
                  {{ approver.name }} {{ approver.position }}
                </div>
                <div class="person-department">{{ approver.department }}</div>
                <div v-if="approver.processedAt" class="process-time">
                  처리: {{ formatDateTime(approver.processedAt) }}
                </div>
              </div>
              <div
                :class="['status-badge', getStatusBadgeClass(approver.status)]"
              >
                {{ getApproverStatusText(approver.status) }}
              </div>
            </div>

            <div v-if="approver.comment" class="person-comment">
              <div class="comment-text">{{ approver.comment }}</div>
              <div class="comment-time">{{
                formatDateTime(approver.commentTime)
              }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Collaborators Section -->
      <div class="section-container">
        <div class="section-header">
          <svg
            class="section-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <h3 class="section-title">협조자</h3>
        </div>

        <div class="person-list">
          <div
            v-for="collaborator in collaborators"
            :key="collaborator.id"
            class="person-item"
          >
            <div class="person-main">
              <svg
                class="person-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <div class="person-info">
                <div class="person-name-role">
                  {{ collaborator.name }} {{ collaborator.position }}
                </div>
                <div class="person-department">{{
                  collaborator.department
                }}</div>
              </div>
              <div
                :class="[
                  'status-badge',
                  getStatusBadgeClass(collaborator.status),
                ]"
              >
                {{ getStatusText(collaborator.status) }}
              </div>
            </div>

            <div v-if="collaborator.comment" class="person-comment">
              <div class="comment-text">{{ collaborator.comment }}</div>
              <div class="comment-time">{{
                formatDateTime(collaborator.commentTime)
              }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reference Section -->
      <div class="section-container">
        <div class="section-header">
          <svg
            class="section-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <h3 class="section-title">참조자</h3>
        </div>

        <div class="person-list">
          <div
            v-for="reference in references"
            :key="reference.id"
            class="person-item"
          >
            <div class="person-main">
              <svg
                class="person-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <div class="person-info">
                <div class="person-name-role">
                  {{ reference.name }} {{ reference.position }}
                </div>
                <div class="person-department">{{ reference.department }}</div>
                <div v-if="reference.readTime" class="read-time">
                  열람: {{ formatDateTime(reference.readTime) }}
                </div>
              </div>
              <div
                :class="['status-badge', getStatusBadgeClass(reference.status)]"
              >
                {{ getStatusText(reference.status) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recipients Section -->
      <div class="section-container">
        <div class="section-header">
          <svg
            class="section-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <h3 class="section-title">수신자</h3>
        </div>

        <div class="person-list">
          <div
            v-for="recipient in recipients"
            :key="recipient.id"
            class="person-item"
          >
            <div class="person-main">
              <svg
                class="person-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              <div class="person-info">
                <div class="person-name-role">
                  {{ recipient.name }} {{ recipient.position }}
                </div>
                <div class="person-department">{{ recipient.department }}</div>
              </div>
              <div
                :class="['status-badge', getStatusBadgeClass(recipient.status)]"
              >
                {{ getStatusText(recipient.status) }}
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

const props = defineProps({
  activeTab: {
    type: String,
    default: "approvalLine",
  },
});

const emit = defineEmits(["tab-change", "close"]);

// 결재자 데이터
const approvers = ref([
  {
    id: 1,
    name: "신민철",
    position: "사원",
    department: "영업팀",
    status: "completed",
    processedAt: "2025-05-30T15:35:00",
    comment: null,
    commentTime: null,
  },
  {
    id: 2,
    name: "김영희",
    position: "주임",
    department: "영업팀",
    status: "completed",
    processedAt: "2025-05-30T16:20:00",
    comment: null,
    commentTime: null,
  },
  {
    id: 3,
    name: "황수민",
    position: "대리",
    department: "영업팀",
    status: "pending",
    processedAt: null,
    comment: null,
    commentTime: null,
  },
]);

// 협조자 데이터
const collaborators = ref([
  {
    id: 1,
    name: "이지민",
    position: "과장",
    department: "재무팀",
    status: "waiting",
    comment: null,
    commentTime: null,
  },
  {
    id: 2,
    name: "박서연",
    position: "대리",
    department: "법무팀",
    status: "completed",
    comment: "계약 조건 및 법적 검토 완료하였습니다. 특별한 문제점은 없습니다.",
    commentTime: "2025-05-30T17:15:00",
  },
]);

const references = ref([
  {
    id: 1,
    name: "최민수",
    position: "팀장",
    department: "총무팀",
    status: "read",
    readTime: "2025-05-30T18:30:00",
  },
  {
    id: 2,
    name: "정하영",
    position: "사원",
    department: "구매팀",
    status: "unread",
    readTime: null,
  },
]);

const recipients = ref([
  {
    id: 1,
    name: "김태현",
    position: "과장",
    department: "총고관리팀",
    status: "waiting",
  },
]);

// 결재 순서 (결재자 + 협조자가 순서대로 진행)
const approvalSequence = computed(() => {
  // 결재자들을 먼저 추가하고, 그 다음에 협조자들을 추가
  const sequence = [...approvers.value];

  // 협조자 중에서 순서가 있는 경우 추가 (예: 특정 협조자가 결재 플로우에 포함되는 경우)
  // 여기서는 예시로 박서연 대리를 결재 플로우에 포함
  const flowCollaborators = collaborators.value.filter(
    (c) => c.name === "박서연"
  );
  sequence.push(...flowCollaborators);

  return sequence;
});

const getStatusIconClass = (status) => {
  switch (status) {
    case "completed":
      return "completed";
    case "pending":
      return "pending";
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
  background: #f8f9fa;
  min-height: 100vh;
}

/* Header */
.header-section {
  background: white;
  border-bottom: 1px solid #e9ecef;
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
  padding: 32px;
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
  align-items: center;
  justify-content: center;
  gap: 40px;
}

.flow-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.status-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.status-icon.completed {
  background: #28a745;
  color: white;
}

.status-icon.pending {
  background: #007bff;
  color: white;
}

.status-icon svg {
  width: 24px;
  height: 24px;
}

.person-info {
  text-align: center;
}

.person-name {
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 4px;
}

.person-position,
.person-department {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 2px;
}

.process-time {
  font-size: 12px;
  color: #6c757d;
  margin-top: 8px;
}

.connection-line {
  position: absolute;
  top: 24px;
  left: 100%;
  width: 40px;
  height: 2px;
  background: #dee2e6;
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
