<template>
  <div class="info-form">
    <ApprovalDetail
      v-if="isDetailViewMode"
      :document="selectedDocument"
      @close-detail="
        () => {
          isDetailViewMode.value = false;
          selectedDocument.value = null;
        }
      "
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
          <h3>수신 문서가 없습니다</h3>
          <p>{{ getEmptyMessage() }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import ApprovalDetail from "@/components/hq/approval/Detail/ApprovalDetail.vue";
import { useRouter } from "vue-router";

const emit = defineEmits([
  "tab-change",
  "document-click",
  "document-view",
  "document-approve",
  "document-edit",
]);

const props = defineProps({
  approvalList: {
    type: Array,
    required: true,
  },
  activeTab: { type: String, required: true },
});

const router = useRouter();

// 반응형 데이터
const activeTab = computed(() => props.activeTab);
const searchQuery = ref("");

// 상세 보기 모드 상태 관리
const isDetailViewMode = ref(false);
const selectedDocument = ref(null);

// 탭 설정 (수신 문서용)
const tabs = [
  { label: "전체", value: "전체" },
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
  let documents = props.approvalList || [];

  // 탭별 필터링
  if (activeTab.value !== "전체") {
    const targetStatus = Object.keys(statusMap).find(
      (key) => statusMap[key] === activeTab.value
    );
    if (targetStatus) {
      documents = documents.filter((doc) => doc.status === targetStatus);
    }
  }

  // 검색 필터링
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    documents = documents.filter(
      (doc) =>
        doc.title.toLowerCase().includes(query) ||
        doc.drafterName.toLowerCase().includes(query)
    );
  }

  return documents;
});

// 날짜별 그룹핑
const groupedDocuments = computed(() => {
  const groups = {};
  filteredDocuments.value.forEach((document) => {
    const date = formatDate(document.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(document);
  });

  return Object.keys(groups)
    .sort((a, b) => new Date(b) - new Date(a))
    .map((date) => ({
      date,
      documents: groups[date],
    }));
});

// 탭 선택
const selectTab = (tabValue) => {
  emit("tab-change", tabValue);
};

// 검색 처리
const handleSearch = () => {
  // 검색 로직은 computed에서 처리됨
};

// 문서 열기
const openDocument = (document) => {
  selectedDocument.value = document;
  isDetailViewMode.value = true;
  emit("document-click", document);
};

// 문서 상세보기
const viewDocument = (document) => {
  emit("document-view", document);
};

// 문서 결재
const approveDocument = (document) => {
  emit("document-approve", document);
};

// 문서 수정
const editDocument = (document) => {
  const id = document.approvalId || document.id || document.documentId;
  if (!id) {
    alert("approvalId가 없습니다!");
    return;
  }
  router.push({
    name: "approval-edit",
    params: { id },
  });
};

// 결재 가능 여부 확인
const canApprove = (document) => {
  return document.status === "IN_PROGRESS";
};

// 수정 가능 여부 확인
const canEdit = (document) => {
  return document.status === "DRAFT";
};

// 문서 타입별 클래스
const getDocumentTypeClass = (code) => {
  const typeMap = {
    PURCHASE: "type-purchase",
    ORDER: "type-order",
    RETURN: "type-return",
  };
  return typeMap[code] || "type-default";
};

// 문서 타입별 텍스트
const getDocumentTypeText = (code) => {
  const typeMap = {
    PURCHASE: "구매결재",
    ORDER: "주문결재",
    RETURN: "반품결재",
  };
  return typeMap[code] || "기타결재";
};

// 날짜 포맷팅
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// 날짜시간 포맷팅
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 금액 포맷팅
const formatAmount = (amount) => {
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
};

// 빈 상태 메시지
const getEmptyMessage = () => {
  const messages = {
    전체: "수신된 결재 문서가 없습니다.",
    결재중: "결재 중인 수신 문서가 없습니다.",
    결재완료: "결재 완료된 수신 문서가 없습니다.",
    결재반려: "결재 반려된 수신 문서가 없습니다.",
  };
  return messages[activeTab.value] || messages.전체;
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

.tab-container {
  margin-bottom: 24px;
}

.tab-list {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #e9ecef;
}

.tab-button {
  padding: 12px 24px;
  border: none;
  background: none;
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.tab-button:hover {
  color: #495057;
}

.tab-button.active {
  color: #4066fa;
  border-bottom-color: #4066fa;
}

.search-section {
  margin-bottom: 24px;
}

.search-box {
  position: relative;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #6c757d;
}

.search-box input {
  width: 100%;
  padding: 12px 12px 12px 44px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.search-box input:focus {
  border-color: #4066fa;
}

.document-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.date-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.date-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
}

.calendar-icon {
  width: 20px;
  height: 20px;
  color: #6c757d;
}

.date-text {
  font-size: 16px;
  font-weight: 600;
  color: #495057;
}

.document-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.document-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  background: #fff;
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
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.document-icon svg {
  width: 24px;
  height: 24px;
}

.type-purchase {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.type-order {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.type-return {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.type-default {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
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
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: #6c757d;
}

.document-type {
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
}

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
  background: #3451d1;
}

.edit-btn {
  background: #28a745;
  color: white;
}

.edit-btn:hover {
  background: #218838;
}

.detail-btn {
  background: #6c757d;
  color: white;
}

.detail-btn:hover {
  background: #5a6268;
}

.empty-state {
  text-align: center;
  padding: 48px;
  color: #6c757d;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #495057;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}
</style>
