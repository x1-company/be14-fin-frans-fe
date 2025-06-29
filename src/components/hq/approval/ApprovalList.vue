<template>
  <div class="info-form">
    <!-- ApprovalDetail 모달 제거됨 -->
    <!-- 문서 목록 및 탭 항상 렌더링 -->
    <div>
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
                      getDocumentTypeLabel(
                        document.categoryType ||
                          document.approvalDocuments?.categoryType
                      )
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
                  v-else-if="canCollaborate(document)"
                  class="action-btn collaborate-btn"
                  @click.stop="collaborateDocument(document)"
                >
                  협조하기
                </button>
                <button
                  v-else-if="canEdit(document)"
                  class="action-btn edit-btn"
                  @click.stop="editDocument(document)"
                >
                  수정하기
                </button>
                <button
                  v-else
                  class="action-btn detail-btn"
                  @click.stop="
                    () => {
                      console.log('상세보기 클릭!');
                      viewDocument(document);
                    }
                  "
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

    <!-- ApprovalEdit 모달 -->
    <ApprovalEdit
      v-if="showEditModal"
      :approvalId="editDocumentId"
      :type="editDocumentType"
      :initialData="editDocumentData"
      :isEditMode="true"
      @close="closeEditModal"
      @approval-submitted="handleApprovalSubmitted"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import ApprovalEdit from "./ApprovalEdit.vue";

const emit = defineEmits([
  "tab-change",
  "document-click",
  "document-view",
  "document-approve",
  "document-edit",
  "edit-document",
  "document-reject",
  "refresh-list",
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
const localActiveTab = ref(props.activeTab);
const activeTab = computed(() => localActiveTab.value);
const searchQuery = ref("");

// 모달 상태 관리
const showEditModal = ref(false);
const editDocumentData = ref(null);
const editDocumentType = ref("ORDER");
const editDocumentId = ref(null);

// 탭 설정
const tabs = [
  { label: "전체", value: "전체" },
  { label: "임시저장", value: "임시저장" },
  { label: "결재중", value: "결재중" },
  { label: "결재완료", value: "결재완료" },
  { label: "결재반려", value: "결재반려" },
];

// 상태 매핑
const statusMap = {
  DRAFT: "임시저장",
  IN_PROGRESS: "결재중",
  APPROVED: "결재완료",
  REJECTED: "결재반려",
};

// 필터링된 문서
const filteredDocuments = computed(() => {
  let filtered = [...(props.approvalList || [])];

  // 탭 필터링
  if (activeTab.value !== "전체") {
    const statusKey = Object.keys(statusMap).find(
      (key) => statusMap[key] === activeTab.value
    );
    filtered = filtered.filter((doc) => doc.status === statusKey);
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
  // 부모 컴포넌트로 이벤트를 전달하지 않고 로컬 상태만 변경
  localActiveTab.value = tabValue;

  // 사이드바 메뉴 선택을 위한 이벤트 전달
  const menuMapping = {
    전체: "상신-전체",
    임시저장: "임시저장",
    결재중: "결재중",
    결재완료: "결재완료",
    결재반려: "결재반려",
  };

  const menuToSelect = menuMapping[tabValue];
  if (menuToSelect) {
    emit("select-menu", menuToSelect);
  }
};

const handleSearch = () => {
  // 검색 로직은 computed에서 처리됨
};

const router = useRouter();
const openDocument = (document) => {
  if (document && document.approvalId) {
    router.push(`/approval/${document.approvalId}`);
  } else {
    console.warn("approvalId가 없습니다:", document);
  }
};

const viewDocument = (document) => {
  if (document && document.approvalId) {
    router.push(`/approval/${document.approvalId}`);
  } else {
    console.warn("approvalId가 없습니다:", document);
  }
};

const approveDocument = (document) => {
  if (document && document.approvalId) {
    router.push(`/approval/${document.approvalId}`);
  } else {
    console.warn("approvalId가 없습니다:", document);
  }
};

const collaborateDocument = (document) => {
  // emit("document-collaborate", document);
  // selectedDocument.value = document;
  // isDetailViewMode.value = true;
};

const editDocument = (document) => {
  console.log("수정하기 버튼 클릭:", document);

  // 수정할 문서 데이터 설정
  editDocumentData.value = {
    title: document.title,
    remarks: document.remarks,
    lines: document.lines || [],
    files: document.files || [],
    approvalDocuments: {
      documentIds: Array.isArray(document.approvalDocuments)
        ? document.approvalDocuments.map((doc) => doc.documentId)
        : document.approvalDocuments?.documentIds || [],
      categoryType: document.categoryType || document.type || "ORDER",
    },
    signUrl: document.signUrl || "",
  };

  // 결재 유형 설정
  editDocumentType.value = document.categoryType || document.type || "ORDER";

  // 모달 열기
  showEditModal.value = true;

  // 수정할 문서의 approvalId 저장
  editDocumentId.value = document.approvalId;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editDocumentData.value = null;
  editDocumentType.value = "ORDER";
  editDocumentId.value = null;
};

const handleApprovalSubmitted = (data) => {
  console.log("결재 수정 완료:", data);
  closeEditModal();
  // 목록 새로고침 이벤트 발생
  emit("refresh-list");
};

const canApprove = (document) => {
  // 결재예정 탭에서는 결재하기 버튼을 표시하지 않음
  return false;
};

const canEdit = (document) => {
  // 임시저장 상태이면 수정하기 버튼 표시 (전체 탭에서도)
  return document.status === "DRAFT";
};

const canCollaborate = (document) => {
  // 결재예정 탭에서는 협조하기 버튼을 표시하지 않음
  return false;
};

const getDocumentTypeClass = (code) => {
  if (code?.startsWith("APP")) return "type-approval";
  if (code?.startsWith("APR")) return "type-request";
  if (code?.startsWith("RPT")) return "type-report";
  return "type-default";
};

const getDocumentTypeLabel = (categoryType) => {
  switch (categoryType) {
    case "ORDER":
      return "주문서";
    case "RETURN":
      return "반품서";
    case "PURCHASE_ORDER":
      return "발주서";
    default:
      return "결재서";
  }
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
    case "임시저장":
      return "임시저장된 문서가 없습니다.";
    case "결재중":
      return "결재 진행중인 문서가 없습니다.";
    case "결재완료":
      return "결재 완료된 문서가 없습니다.";
    case "결재반려":
      return "반려된 문서가 없습니다.";
    default:
      return "등록된 결재 문서가 없습니다.";
  }
};

const handleDocumentApprove = (document) => {
  console.log("문서 승인됨:", document);
  // 부모 컴포넌트에 승인 이벤트 전달
  emit("document-approve", document);
};

const handleDocumentReject = (data) => {
  console.log("문서 반려됨:", data);
  // 부모 컴포넌트에 반려 이벤트 전달
  emit("document-reject", data);
};

const handleRefreshList = () => {
  console.log("목록 새로고침 요청");
  // 부모 컴포넌트에 목록 새로고침 이벤트 전달
  emit("refresh-list");
};

// props.activeTab이 변경될 때 localActiveTab 업데이트
watch(
  () => props.activeTab,
  (newTab) => {
    localActiveTab.value = newTab;
  }
);
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
  border-bottom: 1px solid transparent;
  transition: all 0.2s ease;
  font-size: 0.9rem;
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

/* 날짜 그룹 */
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
  font-size: 14px;
  font-weight: 500;
}

/* 문서 카드 */
.document-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.document-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.document-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #4066fa;
}

/* 문서 정보 */
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

.type-report {
  background: #f3e5f5;
  color: #7b1fa2;
}

.type-default {
  background: #f5f5f5;
  color: #757575;
}

.document-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.document-title {
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  margin: 0;
}

.document-meta {
  display: flex;
  gap: 12px;
  font-size: 14px;
  color: #6c757d;
}

.document-type {
  color: #4066fa;
  font-weight: 500;
}

.document-amount {
  color: #212529;
  font-weight: 600;
}

/* 액션 버튼 */
.document-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.approve-btn {
  background: #4066fa;
  color: white;
}

.approve-btn:hover {
  background: #3056e0;
}

.collaborate-btn {
  background: #ec4899;
  color: white;
}

.collaborate-btn:hover {
  background: #db2777;
}

.edit-btn {
  background: #ffeebd;
  color: #5c5c5c;
}

.edit-btn:hover {
  background: #ffe084;
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
  padding: 60px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #495057;
  font-size: 18px;
}

.empty-state p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

/* 반응형 */
@media (max-width: 768px) {
  .search-section {
    justify-content: stretch;
  }

  .search-box {
    width: 100%;
  }

  .document-card {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .document-actions {
    justify-content: center;
  }
}
</style>
