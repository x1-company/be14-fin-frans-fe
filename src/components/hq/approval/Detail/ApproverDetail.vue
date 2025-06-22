<template>
  <div class="approval-detail">
    <!-- Header -->
    <div class="detail-header">
      <div class="header-top">
        <div class="header-tabs">
          <button
            :class="['tab-button', { active: activeTab === 'document' }]"
            @click="activeTab = 'document'"
          >
            결재문서
          </button>
          <button
            :class="['tab-button', { active: activeTab === 'approvalLine' }]"
            @click="activeTab = 'approvalLine'"
          >
            결재선
          </button>
        </div>
        <div class="header-actions">
          <button class="print-button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="6,9 6,2 18,2 18,9" />
              <path
                d="M6,18H4a2,2,0,0,1-2-2V11a2,2,0,0,1,2-2H20a2,2,0,0,1,2,2v5a2,2,0,0,1-2,2H18"
              />
              <polyline points="6,14 6,22 18,22 18,14" />
            </svg>
            결재서 출력
          </button>
          <button class="close-button" @click="goBack">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            닫기
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-if="activeTab === 'document'" class="detail-content">
      <div v-if="document">
        <!-- Notice -->
        <div v-if="noticeInfo" class="notice-section">
          <div class="notice-icon">ℹ️</div>
          <div class="notice-text">
            <strong>결재 요청</strong><br />
            {{ currentUserName }} {{ currentUserDutyName }}님,
            {{ noticeInfo.line.seq }}차 {{ noticeInfo.typeText }}를 요청합니다.
            아래 문서를 검토하시고 승인 또는 반려 처리 부탁드립니다.
          </div>
        </div>

        <!-- Document Title -->
        <div class="document-title-section">
          <h1 class="document-title">{{ document.title }}</h1>
          <div class="status-badges">
            <span
              :class="['status-badge', getDocumentStatusClass(document.status)]"
            >
              {{ getDocumentStatusText(document.status) }}
            </span>
          </div>
        </div>

        <!-- Document Info -->
        <div class="document-info">
          <div class="info-grid">
            <div class="info-item">
              <label>작성일자:</label>
              <span>{{ formatDate(document.createdAt) }}</span>
            </div>
            <div class="info-item">
              <label>작성자:</label>
              <span>{{ document.drafterName }}</span>
            </div>
            <div class="info-item">
              <label>문서번호:</label>
              <span>{{ document.code }}</span>
            </div>
            <div class="info-item">
              <label>총 금액:</label>
              <span class="amount">{{
                formatAmount(
                  calculateTotalAmount(
                    documentContent?.history || document.history
                  )
                )
              }}</span>
            </div>
          </div>
        </div>

        <!-- Order Details -->
        <div
          v-if="
            (documentContent?.history && documentContent.history.length > 0) ||
            (document.history && document.history.length > 0)
          "
          class="order-section"
        >
          <h2 class="section-title">주문 내역</h2>
          <div class="order-table-container">
            <table class="order-table">
              <thead>
                <tr>
                  <th>NO.</th>
                  <th>품목명</th>
                  <th>규격</th>
                  <th>단위</th>
                  <th>수량</th>
                  <th>단가</th>
                  <th>금액</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in documentContent?.history ||
                  document.history"
                  :key="item.historyId || index"
                >
                  <td>{{ index + 1 }}</td>
                  <td>{{ item.productName }}</td>
                  <td>{{ item.spec }}</td>
                  <td>{{ item.purchaseUnit }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ formatAmount(item.salePrice) }}</td>
                  <td>{{ formatAmount(item.quantity * item.salePrice) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="6" class="total-label">합 계</td>
                  <td class="total-amount">{{
                    formatAmount(
                      calculateTotalAmount(
                        documentContent?.history || document.history
                      )
                    )
                  }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Remarks -->
        <div
          v-if="documentContent?.remarks || document.remarks"
          class="notes-section"
        >
          <h2 class="section-title">비고</h2>
          <div class="notes-content">
            <p>{{ documentContent?.remarks || document.remarks }}</p>
          </div>
        </div>

        <!-- Attachments -->
        <div
          v-if="
            (documentContent?.files && documentContent.files.length > 0) ||
            (document.files && document.files.length > 0)
          "
          class="attachments-section"
        >
          <h2 class="section-title">첨부파일</h2>
          <div class="attachment-list">
            <div
              v-for="file in documentContent?.files || document.files"
              :key="file.fileId || file.id"
              class="attachment-item"
            >
              <div class="file-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                  />
                  <polyline points="14,2 14,8 20,8" />
                </svg>
              </div>
              <div class="file-info">
                <span class="file-name">{{ file.fileName || file.name }}</span>
              </div>
              <a :href="file.url" target="_blank" class="download-button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="loading-state"> 문서 내용을 불러오는 중입니다... </div>
    </div>

    <div v-if="activeTab === 'approvalLine'" class="detail-content">
      <ApprovalLineDetail :approval-line="approvalLine" />
    </div>

    <!-- Action Buttons -->
    <ApprovalActionButtons
      v-if="isCurrentUserTurn"
      :document="document"
      @refresh-list="$emit('refresh-list')"
      @close-detail="goBack"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "@/lib/api";
import ApprovalLineDetail from "./ApprovalLineDetail.vue";
import ApprovalActionButtons from "./ApprovalActionButtons.vue";
import { useAuthStore } from "@/stores/auth";

// 본문ㅡ결재선 탭 선택
const activeTab = ref("document"); // 'document' or 'approvalLine'

const emit = defineEmits(["close-detail", "approve", "reject", "refresh-list"]);

const props = defineProps({
  document: {
    type: Object,
    required: true,
  },
});

const approvalLine = ref(null);
const documentContent = ref(null);
const authStore = useAuthStore();
const currentUserId = computed(() => authStore.userId);
const currentUserName = computed(() => authStore.userName);
const currentUserDutyName = computed(() => authStore.dutyName);

const isCurrentUserTurn = computed(() => {
  if (!props.document || !currentUserId.value) {
    return false;
  }
  return props.document.lines?.some(
    (line) => line.id === currentUserId.value && line.status === "WAITING"
  );
});

const noticeInfo = computed(() => {
  if (!isCurrentUserTurn.value) {
    return null;
  }
  const userLine = props.document.lines?.find(
    (line) => line.id === currentUserId.value && line.status === "WAITING"
  );
  if (!userLine) {
    return null;
  }
  const typeText = userLine.type === "APPROVER" ? "결재" : "협조";
  return {
    line: userLine,
    typeText: typeText,
  };
});

const fetchApprovalLine = async () => {
  if (!props.document?.approvalId) return;
  try {
    const response = await api.get(
      `/api/hq/approvals/detail/${props.document.approvalId}/lines`
    );
    approvalLine.value = response.data;
  } catch (error) {
    console.error("결재선 정보를 불러오는 데 실패했습니다.", error);
    // 에러 처리 (예: 사용자에게 알림)
  }
};

const fetchDocumentContent = async () => {
  if (!props.document?.approvalId) return;
  try {
    const response = await api.get(
      `/api/hq/approvals/detail/${props.document.approvalId}/content`
    );
    if (response.data && response.data.length > 0) {
      documentContent.value = response.data[0];
    }
  } catch (error) {
    console.error("문서 내용을 불러오는 데 실패했습니다.", error);
  }
};

const goBack = () => {
  emit("close-detail");
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}월 ${String(date.getDate()).padStart(2, "0")}일`;
};

const formatAmount = (amount) => {
  if (!amount) return "₩0";
  return `₩${amount.toLocaleString()}`;
};

const calculateTotalAmount = (history) => {
  if (!history) return 0;
  return history.reduce((sum, item) => sum + item.quantity * item.salePrice, 0);
};

const getDocumentStatusText = (status) => {
  const statusMap = {
    DRAFT: "임시저장",
    IN_PROGRESS: "결재중",
    APPROVED: "결재완료",
    REJECTED: "결재반려",
  };
  return statusMap[status] || status;
};

const getDocumentStatusClass = (status) => {
  const classMap = {
    DRAFT: "status-draft",
    IN_PROGRESS: "status-progress",
    APPROVED: "status-approved",
    REJECTED: "status-rejected",
  };
  return classMap[status] || "status-unknown";
};

onMounted(() => {
  fetchApprovalLine();
  fetchDocumentContent();
});
</script>

<style scoped>
.approval-detail {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f8f9fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.detail-header {
  background: white;
  border-bottom: 1px solid #e9ecef;
  padding: 16px 24px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-tabs {
  display: flex;
  gap: 8px;
}

.tab-button {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  background: white;
  color: #495057;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.tab-button.active {
  background: #4066fa;
  color: white;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.print-button,
.close-button {
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

.print-button:hover,
.close-button:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.print-button svg,
.close-button svg {
  width: 16px;
  height: 16px;
}

/* Content */
.detail-content {
  flex: 1;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Notice */
.notice-section {
  background: #e3f2fd;
  border: 1px solid #bbdefb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
}

.notice-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.notice-text {
  color: #1565c0;
  font-size: 14px;
  line-height: 1.5;
}

/* Document Title */
.document-title-section {
  text-align: center;
  margin-bottom: 32px;
}

.document-title {
  font-size: 28px;
  font-weight: 700;
  color: #212529;
  margin: 0 0 16px 0;
}

.status-badges {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  margin-left: 8px;
}

.status-badge.status-draft {
  background-color: #e9ecef;
  color: #495057;
}
.status-badge.status-progress {
  background-color: #d1e7fd;
  color: #0c5460;
}
.status-badge.status-approved {
  background-color: #d4edda;
  color: #155724;
}
.status-badge.status-rejected {
  background-color: #f8d7da;
  color: #721c24;
}

/* Document Info */
.document-info {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f3f4;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  font-weight: 500;
  color: #6c757d;
  font-size: 14px;
}

.info-item span {
  color: #212529;
  font-size: 14px;
}

.info-item .amount {
  color: #4066fa;
  font-weight: 600;
  font-size: 16px;
}

/* Order Section */
.order-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #212529;
  margin: 0 0 20px 0;
}

.order-table-container {
  overflow-x: auto;
}

.order-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.order-table th {
  padding: 12px 16px;
  background: #f8f9fa;
  font-weight: 500;
  text-align: left;
  color: #495057;
  border-bottom: 1px solid #dee2e6;
}

.order-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e9ecef;
  color: #212529;
}

.total-row {
  font-weight: bold;
}

.total-label {
  text-align: center;
}

.total-amount {
  color: #4066fa;
  font-size: 16px;
}

/* Notes Section */
.notes-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.notes-content {
  color: #495057;
  line-height: 1.6;
}

.notes-details {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  margin-top: 16px;
}

.notes-details ul {
  margin: 8px 0;
  padding-left: 20px;
}

.notes-details li {
  margin-bottom: 4px;
}

/* Attachments */
.attachments-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-top: 32px;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.file-icon {
  width: 32px;
  height: 32px;
  background: #4066fa;
  color: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-icon svg {
  width: 16px;
  height: 16px;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-name {
  font-size: 14px;
  color: #212529;
  font-weight: 500;
}

.file-size {
  font-size: 12px;
  color: #6c757d;
}

.download-button {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.download-button:hover {
  background: #e9ecef;
  color: #495057;
}

.download-button svg {
  width: 16px;
  height: 16px;
}

/* Action Section */
.action-section {
  background: white;
  border-top: 1px solid #e9ecef;
  padding: 20px 24px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
  justify-content: center;
}

.reject-button {
  background: #dc3545;
  color: white;
}

.reject-button:hover {
  background: #c82333;
}

.approve-button {
  background: #28a745;
  color: white;
}

.approve-button:hover {
  background: #218838;
}

.action-button svg {
  width: 18px;
  height: 18px;
}

/* Responsive */
@media (max-width: 768px) {
  .detail-content {
    padding: 16px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .header-actions {
    flex-direction: column;
    gap: 8px;
  }

  .action-section {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
  }
}

.loading-state {
  text-align: center;
  padding: 24px;
  color: #6c757d;
}
</style>
