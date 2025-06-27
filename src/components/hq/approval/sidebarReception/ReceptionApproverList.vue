<template>
  <div class="info-form">
    <ApprovalDetail
      v-if="isDetailViewMode"
      :document="selectedDocument"
      :is-current-user-turn="canApprove(selectedDocument)"
      @close-detail="goBack"
    />

    <div v-else>
      <!-- 탭 메뉴 -->
      <div class="tab-container">
        <div class="tab-list">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            :class="['tab-button', { active: activeTab === tab.value }]"
            @click="selectTab(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- 검색 영역 -->
      <div class="search-section">
        <div class="search-box">
          <svg
            class="search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="결재자명 또는 제목을 입력하세요"
            v-model="searchQuery"
            @input="handleSearch"
          />
        </div>
      </div>

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
            <svg
              class="calendar-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
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
              <!-- 왼쪽: 문서 아이콘 및 정보 -->
              <div class="document-info">
                <div
                  class="document-icon"
                  :class="getDocumentTypeClass(document.code)"
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

                <div class="document-details">
                  <h3 class="document-title">{{ document.title }}</h3>
                  <div class="document-meta">
                    <span class="document-type">{{
                      getDocumentTypeText(document.code)
                    }}</span>
                    <span class="document-author"
                      >{{ document.drafterName }} /
                      {{ document.positionName }}</span
                    >
                    <span class="document-date">{{
                      formatDateTime(document.createdAt)
                    }}</span>
                    <span v-if="document.amount" class="document-amount">{{
                      formatAmount(document.amount)
                    }}</span>
                  </div>
                </div>
              </div>

              <!-- 오른쪽: 액션 버튼 -->
              <div class="document-actions">
                <button
                  v-if="canApprove(document)"
                  class="action-btn approve-btn"
                  @click.stop="approveDocument(document)"
                >
                  결재하기
                </button>
                <button
                  v-else-if="canEdit(document)"
                  class="action-btn edit-btn"
                  @click.stop="editDocument(document)"
                >
                  수정하기
                </button>
                <button
                  v-else-if="
                    !(
                      activeTab === '결재대기' ||
                      (activeTab === '전체' && canApprove(document))
                    )
                  "
                  class="action-btn detail-btn"
                  @click.stop="viewDocument(document)"
                >
                  상세보기
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 빈 상태 -->
        <div v-if="filteredDocuments.length === 0" class="empty-state">
          <div class="empty-icon">📄</div>
          <h3>결재 문서가 없습니다</h3>
          <p>{{ getEmptyMessage() }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import ApprovalDetail from "@/components/hq/approval/Detail/ApprovalDetail.vue";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";

const auth = useAuthStore();
const router = useRouter();
const toast = useToast();

const emit = defineEmits([
  "tab-change",
  "document-click",
  "document-view",
  "document-approve",
  "document-edit",
  "select-menu",
]);

const props = defineProps({
  approvalList: {
    type: Array,
    required: true,
  },
  activeTab: { type: String, required: true },
});

// 반응형 데이터
const activeTab = computed(() => props.activeTab);
const searchQuery = ref("");

// 상세 보기 모드 상태 관리
const isDetailViewMode = ref(false);
const selectedDocument = ref(null);

// 탭 설정 (결재문서용)
const tabs = [
  { label: "전체", value: "전체" },
  { label: "결재대기", value: "결재대기" },
  { label: "결재예정", value: "결재예정" },
  { label: "내 결재 승인", value: "내 결재 승인" },
  { label: "내 결재 반려", value: "내 결재 반려" },
];

// 상태 매핑
const statusMap = {
  WAITING: "결재대기",
  EXPECTED: "결재예정",
  APPROVED: "내 결재 승인",
  REJECTED: "내 결재 반려",
};

// 필터링된 문서
const filteredDocuments = computed(() => {
  let filtered = [...(props.approvalList || [])];

  // 탭 필터링
  if (activeTab.value !== "전체") {
    const statusKey = Object.keys(statusMap).find(
      (key) => statusMap[key] === activeTab.value
    );
    if (statusKey) {
      filtered = filtered.filter((doc) =>
        doc.lines.some(
          (line) => line.id === auth.userId && line.status === statusKey
        )
      );
    }
  }

  // 검색 필터링
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (doc) =>
        doc.title?.toLowerCase().includes(query) ||
        doc.drafterName?.toLowerCase().includes(query) ||
        doc.deptName?.toLowerCase().includes(query) ||
        // 결재자명으로도 검색 가능
        doc.lines?.some((line) =>
          line.approverName?.toLowerCase().includes(query)
        )
    );
  }

  return filtered;
});

// 날짜별로 그룹화된 문서
const groupedDocuments = computed(() => {
  const groups = {};

  filteredDocuments.value.forEach((doc) => {
    const date = new Date(doc.createdAt);
    const dateKey = `${date.getFullYear()}.${String(
      date.getMonth() + 1
    ).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} ${getWeekday(
      date
    )}`;

    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: dateKey,
        documents: [],
      };
    }
    groups[dateKey].documents.push(doc);
  });

  // 날짜순 정렬 (최신순)
  return Object.values(groups).sort((a, b) => {
    const dateA = new Date(a.date.split(" ")[0].replace(/\./g, "-"));
    const dateB = new Date(b.date.split(" ")[0].replace(/\./g, "-"));
    return dateB - dateA;
  });
});

// 메서드
const selectTab = (tabValue) => {
  emit("tab-change", tabValue);

  // 사이드바 메뉴 선택을 위한 이벤트 전달
  const menuMapping = {
    전체: "결재-전체",
    결재대기: "결재대기",
    결재예정: "결재예정",
    "내 결재 승인": "내 결재 승인",
    "내 결재 반려": "내 결재 반려",
  };

  const menuToSelect = menuMapping[tabValue];
  if (menuToSelect) {
    emit("select-menu", menuToSelect);
  }
};

const handleSearch = () => {
  // 검색 로직은 computed에서 처리됨
};

const openDocument = (document) => {
  emit("document-click", document);
};

const viewDocument = (document) => {
  emit("document-view", document);
};

const approveDocument = (document) => {
  router.push(`/approval/${document.approvalId}`);
};

const editDocument = (document) => {
  const id = document.approvalId || document.id || document.documentId;
  if (!id) {
    toast.warning("approvalId가 없습니다!");
    return;
  }
  router.push({
    name: "approval-register",
    params: { approvalId: id },
  });
};

const canApprove = (document) => {
  // 현재 로그인한 사용자가 이 문서의 결재선에 'APPROVER'로 있고 상태가 'WAITING'인 경우
  return document.lines?.some(
    (line) =>
      line.id === auth.userId &&
      line.type === "APPROVER" &&
      line.status === "WAITING"
  );
};

const canEdit = (document) => {
  // 임시저장 상태이거나 기안자가 본인인 경우 (실제로는 현재 사용자 정보와 비교해야 함)
  return document.status === "DRAFT";
};

const getDocumentTypeClass = (code) => {
  if (code?.startsWith("APP")) return "type-approval";
  if (code?.startsWith("APR")) return "type-request";
  if (code?.startsWith("RPT")) return "type-report";
  return "type-default";
};

const getDocumentTypeText = (code) => {
  if (code?.startsWith("APP")) return "결재서";
  if (code?.startsWith("APR")) return "요청서";
  if (code?.startsWith("RPT")) return "보고서";
  return "문서";
};

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

const formatAmount = (amount) => {
  if (!amount) return "";
  return `₩${amount.toLocaleString()}`;
};

const getEmptyMessage = () => {
  switch (activeTab.value) {
    case "결재대기":
      return "결재 대기중인 문서가 없습니다.";
    case "결재예정":
      return "결재 예정된 문서가 없습니다.";
    case "내 결재 승인":
      return "내가 승인한 문서가 없습니다.";
    case "내 결재 반려":
      return "내가 반려한 문서가 없습니다.";
    default:
      return "등록된 결재 문서가 없습니다.";
  }
};

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.info-form {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: white;
  border-radius: 0 0 12px 12px;
  overflow: hidden;
}

/* 탭 메뉴 */
.tab-container {
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.tab-list {
  display: flex;
  padding: 0 24px;
  background-color: white;
}

.tab-button {
  padding: 8px 25px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  color: #6c757d;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
}

.tab-button:hover {
  color: #495057;
}

.tab-button.active {
  color: #4066fa;
  border-bottom-color: #4066fa;
  border-bottom: 2px solid #1976d2;
  background: none;
}

/* 검색 영역 */
.search-section {
  padding: 20px 24px;
  display: flex;
  justify-content: flex-end;
}

.search-box {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 24px;
  padding: 8px 16px;
  width: 320px;
  gap: 8px;
}

.search-icon {
  width: 16px;
  height: 16px;
  color: #969696;
}

.search-box input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: 14px;
  color: #495057;
}

.search-box input::placeholder {
  color: #969696;
}

/* 문서 목록 */
.document-list {
  padding: 0 80px;
}

.date-group {
  margin-bottom: 32px;
}

.date-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: #6c757d;
}

.calendar-icon {
  width: 16px;
  height: 16px;
}

.date-text {
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

.document-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.document-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.document-card:hover {
  border-color: #4066fa;
  box-shadow: 0 4px 12px rgba(64, 102, 250, 0.1);
}

.document-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.document-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  color: #6c757d;
}

.document-icon.type-approval {
  background: #e3f2fd;
  color: #1976d2;
}

.document-icon.type-request {
  background: #fff3e0;
  color: #f57c00;
}

.document-icon.type-report {
  background: #f3e5f5;
  color: #7b1fa2;
}

.document-icon svg {
  width: 20px;
  height: 20px;
}

.document-details {
  flex: 1;
}

.document-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #212529;
}

.document-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #6c757d;
}

.document-type {
  font-weight: 500;
  color: #4066fa;
}

.document-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.approve-btn {
  background: #4066fa;
  color: white;
}

.approve-btn:hover {
  background: #3551d1;
}

.edit-btn {
  background: #28a745;
  color: white;
}

.edit-btn:hover {
  background: #218838;
}

.detail-btn {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
}

.detail-btn:hover {
  background: #e9ecef;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 80px 24px;
  color: #6c757d;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #495057;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}
</style>
