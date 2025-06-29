<template>
  <div class="approval-detail">
    <!-- 헤더 영역 -->
    <div class="detail-header">
      <div class="header-top">
        <!-- 탭 메뉴 (결재문서 / 결재선) -->
        <div class="tab-navigation">
          <div
            class="tab-item"
            :class="{ active: activeTab === 'document' }"
            @click="activeTab = 'document'"
          >
            결재문서
          </div>
          <div
            class="tab-item"
            :class="{ active: activeTab === 'approvalLine' }"
            @click="activeTab = 'approvalLine'"
          >
            결재선
          </div>
        </div>
        <!-- 헤더 액션 버튼들 -->
        <div class="header-actions">
          <button
            v-if="canEditDocument"
            class="edit-button"
            @click="showEditConfirmModal = true"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
              ></path>
              <path
                d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
              ></path>
            </svg>
            수정하기
          </button>
          <button
            v-if="canResubmitDocument"
            class="resubmit-button"
            @click="showResubmitModal = true"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"
              ></path>
              <path d="M21 3v5h-5"></path>
              <path
                d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"
              ></path>
              <path d="M3 21v-5h5"></path>
            </svg>
            재기안
          </button>
          <button
            v-if="canPrintDocument"
            class="print-button"
            @click="showPdfModal = true"
          >
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

    <!-- 결재문서 탭 내용 -->
    <div v-if="activeTab === 'document'" class="detail-content">
      <div v-if="document">
        <!-- 결재 요청 알림 섹션 (현재 사용자 차례일 때만 표시) -->
        <div
          v-if="noticeInfo"
          class="notice-section"
          :class="
            noticeInfo.typeText === '결재' ? 'notice-approve' : 'notice-coop'
          "
        >
          <div class="notice-icon">ℹ️</div>
          <div class="notice-text">
            <strong>{{ noticeInfo.typeText }} 요청</strong><br />
            {{ currentUserName }} {{ currentUserDutyName }}님,
            {{ noticeInfo.line.seq }}차 {{ noticeInfo.typeText }}를 요청합니다.
            아래 문서를 검토하시고 승인 또는 반려 처리 부탁드립니다.
          </div>
        </div>

        <!-- 문서 제목 섹션 -->
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

        <!-- 문서 기본 정보 -->
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
                  props.document?.totalAmount ??
                    calculateTotalAmount(
                      documentContent?.history || document.history
                    )
                )
              }}</span>
            </div>
          </div>
        </div>

        <!-- 주문 내역 테이블 -->
        <div
          v-if="
            (documentContent?.history && documentContent.history.length > 0) ||
            (document.history && document.history.length > 0)
          "
          class="order-section"
        >
          <h2 class="section-title">{{ getHistorySectionTitle() }}</h2>
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
                  <td>{{
                    formatAmount(
                      item.amount ??
                        item.quantity * (item.salePrice || item.purchasePrice)
                    )
                  }}</td>
                  <td>{{
                    formatAmount(
                      item.amount ??
                        item.quantity * (item.salePrice || item.purchasePrice)
                    )
                  }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="6" class="total-label">합 계</td>
                  <td class="total-amount">{{
                    formatAmount(
                      props.document?.totalAmount ??
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

        <!-- 비고 섹션 -->
        <div
          v-if="documentContent?.remarks || document.remarks"
          class="notes-section"
        >
          <h2 class="section-title">비고</h2>
          <div class="notes-content">
            <p>{{ documentContent?.remarks || document.remarks }}</p>
          </div>
        </div>

        <!-- 첨부파일 섹션 -->
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
              <div class="file-icon">📄</div>
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

    <!-- 결재선 탭 내용 -->
    <div v-if="activeTab === 'approvalLine'" class="detail-content">
      <ApprovalLineDetail
        :approval-id="document.approvalId"
        :approval-detail="document"
      />
    </div>

    <!-- 결재 액션 버튼들 (현재 사용자 차례일 때만 표시) -->
    <ApprovalActionButtons
      v-if="isCurrentUserTurn"
      :document="document"
      @refresh-list="$emit('refresh-list')"
      @close-detail="goBack"
    />

    <!-- PDF 모달 -->
    <ApprovalPdfModal
      v-if="showPdfModal"
      :approval-id="document.approvalId"
      :is-visible="showPdfModal"
      @close="showPdfModal = false"
    />

    <!-- 수정 확인 모달 -->
    <div
      v-if="showEditConfirmModal"
      class="modal-overlay"
      @click="closeEditConfirmModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>문서 수정</h3>
        </div>
        <div class="modal-body">
          <p>문서를 수정하시겠습니까?</p>
          <p class="modal-description">
            수정 버튼을 누르면 임시저장의 상태로 변합니다.<br />
            임시저장 탭에서 수정이 가능합니다.
          </p>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel-btn" @click="closeEditConfirmModal">
            취소
          </button>
          <button class="modal-btn confirm-btn" @click="confirmEditDocument">
            수정
          </button>
        </div>
      </div>
    </div>

    <!-- 재기안 모달 -->
    <ApprovalEdit
      v-if="showResubmitModal"
      :approvalId="document.approvalId"
      :type="
        document.categoryType ||
        document.approvalDocuments?.categoryType ||
        'ORDER'
      "
      :initialData="document"
      :isEditMode="true"
      :isResubmitMode="true"
      @close="closeResubmitModal"
      @approval-submitted="handleResubmitSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import api from "@/lib/api";
import ApprovalLineDetail from "./ApprovalLineDetail.vue";
import ApprovalActionButtons from "./ApprovalActionButtons.vue";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import ApprovalPdfModal from "@/views/hq/approval/pdf/ApprovalPdfModal.vue";
import ApprovalEdit from "../ApprovalEdit.vue";

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const showPdfModal = ref(false);
const showEditConfirmModal = ref(false);
const showResubmitModal = ref(false);

// 결재문서/결재선 탭 선택 상태
const activeTab = ref("document"); // 'document' or 'approvalLine'

const emit = defineEmits(["close-detail", "approve", "reject", "refresh-list"]);

const props = defineProps({
  document: {
    type: Object,
    required: true,
  },
  approvalId: {
    type: [String, Number],
    required: false,
  },
  isCurrentUserTurn: {
    type: Boolean,
    default: null, // null이면 내부에서 계산, 값이 있으면 그 값을 사용
  },
  currentUserId: {
    type: [String, Number],
    required: true,
  },
});

// 결재선 정보와 문서 상세 내용
const approvalLine = ref(null);
const documentContent = ref(null);

// 현재 사용자 정보
const currentUserName = computed(() => authStore.userName);
const currentUserDutyName = computed(() => authStore.dutyName);

// 현재 사용자가 결재선에서 APPROVER/COOPERATOR + WAITING 인지 체크
const currentUserLine = computed(() => {
  if (!props.document?.lines || !props.currentUserId) return null;
  return props.document.lines.find(
    (line) =>
      String(line.id) === String(props.currentUserId) &&
      (line.type === "APPROVER" || line.type === "COOPERATOR") &&
      line.status === "WAITING"
  );
});

// 알림 메시지 및 버튼 노출 여부
const isCurrentUserTurn = computed(() => {
  if (!props.document?.lines || !props.currentUserId) return false;
  return props.document.lines.find(
    (line) =>
      String(line.id) === String(props.currentUserId) &&
      (line.type === "APPROVER" || line.type === "COOPERATOR") &&
      line.status === "WAITING"
  );
});

// 알림 메시지 정보
const noticeInfo = computed(() => {
  if (!currentUserLine.value) return null;
  const typeText = currentUserLine.value.type === "APPROVER" ? "결재" : "협조";
  return {
    line: currentUserLine.value,
    typeText,
  };
});

// 결재선 정보 가져오기
const fetchApprovalLine = async () => {
  if (!props.document?.approvalId) return;
  try {
    const response = await api.get(
      `/api/hq/approvals/detail/${props.document.approvalId}/lines`
    );
    approvalLine.value = response.data;
  } catch (error) {
    console.error("결재선 정보를 불러오는 데 실패했습니다.", error);
  }
};

// 문서 상세 내용 가져오기
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

// 뒤로가기(목록으로 이동)
const goBack = () => {
  emit("refresh-list");
  router.push("/approval?tab=전체"); // 항상 결재 목록의 '전체' 탭으로 이동
};

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}월 ${String(date.getDate()).padStart(2, "0")}일`;
};

// 금액 포맷팅
const formatAmount = (amount) => {
  if (!amount) return "₩0";
  return `₩${amount.toLocaleString()}`;
};

// 총 금액 계산
const calculateTotalAmount = (history) => {
  if (!history) return 0;
  return history.reduce((sum, item) => sum + item.quantity * item.salePrice, 0);
};

// 문서 상태 텍스트 변환
const getDocumentStatusText = (status) => {
  const statusMap = {
    DRAFT: "임시저장",
    IN_PROGRESS: "결재중",
    APPROVED: "결재완료",
    REJECTED: "결재반려",
  };
  return statusMap[status] || status;
};

// 문서 상태 CSS 클래스 변환
const getDocumentStatusClass = (status) => {
  const classMap = {
    DRAFT: "status-draft",
    IN_PROGRESS: "status-progress",
    APPROVED: "status-approved",
    REJECTED: "status-rejected",
  };
  return classMap[status] || "status-unknown";
};

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  console.log("ApprovalDetail mounted", props.document.approvalId);
  activeTab.value = "document"; // Always show document tab first
  fetchApprovalLine();
  fetchDocumentContent();
});

// 주문 내역 섹션 제목 계산
const getHistorySectionTitle = () => {
  // 디버깅을 위한 로그 추가
  console.log("document props:", props.document);
  console.log("approvalDocuments:", props.document?.approvalDocuments);
  console.log("categoryType:", props.document?.approvalDocuments?.categoryType);
  let categoryType = props.document?.categoryType;

  // 결재 유형에 따라 다른 제목 반환
  if (!categoryType && props.document?.approvalDocuments?.categoryType) {
    categoryType = props.document.approvalDocuments.categoryType;
  }
  switch (categoryType) {
    case "ORDER":
      return "주문 내역";
    case "RETURN":
      return "반품 내역";
    case "PURCHASE_ORDER":
      return "발주 내역";
    default:
      console.log("기본값 '주문 내역' 반환, categoryType:", categoryType);
      return "주문 내역";
  }
};

// 결재서 출력 버튼 노출 여부
const canPrintDocument = computed(() => {
  if (!props.document) return false;
  return (
    props.document.status === "APPROVED" || props.document.status === "REJECTED"
  );
});

// 문서 수정 버튼 노출 여부
const canEditDocument = computed(() => {
  console.log("=== canEditDocument 디버깅 ===");
  console.log("document:", props.document);
  console.log("document.status:", props.document?.status);
  console.log("document.drafterId:", props.document?.drafterId);
  console.log("props.currentUserId:", props.currentUserId);
  console.log("document.lines:", props.document?.lines);

  if (!props.document) {
    console.log("❌ document가 없음");
    return false;
  }

  // 결재중 상태에서만
  if (props.document.status !== "IN_PROGRESS") {
    console.log("❌ 상태가 IN_PROGRESS가 아님:", props.document.status);
    return false;
  }

  // 현재 사용자가 기안자인지
  if (String(props.document.drafterId) !== String(props.currentUserId)) {
    console.log(
      "❌ 기안자가 아님 - drafterId:",
      props.document.drafterId,
      "currentUserId:",
      props.currentUserId
    );
    return false;
  }

  // 첫 번째 결재자/협조자가 WAITING인지
  const firstLine = props.document.lines?.find(
    (line) => line.type === "APPROVER" || line.type === "COOPERATOR"
  );
  console.log("첫 번째 결재자/협조자:", firstLine);

  if (!firstLine) {
    console.log("❌ 첫 번째 결재자/협조자가 없음");
    return false;
  }

  const isWaiting = firstLine.status === "WAITING";
  console.log(
    "첫 번째 결재자/협조자 상태:",
    firstLine.status,
    "WAITING인가?",
    isWaiting
  );

  if (isWaiting) {
    console.log("✅ 수정하기 버튼 표시 조건 만족!");
  } else {
    console.log("❌ 첫 번째 결재자/협조자가 WAITING이 아님");
  }

  return isWaiting;
});

// 재기안 버튼 노출 여부
const canResubmitDocument = computed(() => {
  if (!props.document) return false;
  return props.document.status === "REJECTED";
});

// 수정 확인 모달 핸들러
const closeEditConfirmModal = () => {
  showEditConfirmModal.value = false;
};

const confirmEditDocument = async () => {
  if (!props.document) return;

  try {
    // 문서 상태를 임시저장으로 변경
    await api.patch(
      `/api/hq/approvals/${props.document.approvalId}/draft`,
      {
        isRequested: false,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    toast.success("문서가 임시저장 상태로 변경되었습니다.");

    // 임시저장 탭으로 이동
    router.push("/approval?tab=임시저장");

    closeEditConfirmModal();
  } catch (error) {
    console.error("문서 상태 변경 실패:", error);
    toast.error("문서 상태 변경에 실패했습니다.");
  }
};

// 재기안 모달 핸들러
const closeResubmitModal = () => {
  showResubmitModal.value = false;
};

const handleResubmitSuccess = () => {
  closeResubmitModal();
  toast.success("재기안이 완료되었습니다.");
  emit("refresh-list");
  router.push("/approval");
};
</script>

<style scoped>
.approval-detail {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-size: 15px;
  padding: 16px;
}

/* Header */
.detail-header {
  background: white;
  padding: 12px 16px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #e9ecef;
}

.tab-navigation {
  display: flex;
  margin-bottom: 0;
  background: #fff;
  align-items: flex-end;
  height: 48px;
}

.tab-item {
  padding: 0 32px 0 0;
  height: 48px;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 16px;
  color: #6b7280;
  position: relative;
  background: #fff;
  transition: color 0.2s;
  /* left: 32px; */
}

.tab-item.active {
  color: #3453c7;
  font-weight: 700;
  padding-right: 32px;
}

.tab-item.active::after {
  content: "";
  display: block;
  position: absolute;
  left: -13px;
  right: 20px;
  bottom: -1.5px;
  height: 3px;
  background: #3453c7;
  border-radius: 2px 2px 0 0;
  z-index: 2;
}

.tab-item:hover {
  color: #3453c7;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.edit-button,
.print-button,
.close-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-button:hover {
  background: #e9ecef;
  color: #212529;
}

.edit-button svg {
  width: 16px;
  height: 16px;
}

.resubmit-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #4066fa;
  color: white;
  border: 1px solid #4066fa;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.resubmit-button:hover {
  background: #3056e0;
  border-color: #3056e0;
}

.resubmit-button svg {
  width: 16px;
  height: 16px;
}

.print-button {
  background: #667eea;
  color: white;
}

.print-button:hover {
  background: #5a67d8;
}

.close-button {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.close-button:hover {
  background: #e9ecef;
  color: #495057;
}

.edit-button svg,
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
  background-color: white;
}

/* Notice */
.notice-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
}
.notice-approve {
  background: #eaf1ff;
  color: #2563eb;
  border: 1.5px solid #2563eb;
}
.notice-coop {
  background: #f5f0ff;
  color: #8b5cf6;
  border: 1.5px solid #8b5cf6;
}
.notice-icon {
  font-size: 22px;
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
  margin: 20px 16px 16px 16px;
}

.document-title {
  font-size: 20px;
  font-weight: 700;
  color: #212529;
  margin: 0 0 12px 0;
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
  padding: 12px 16px;
  margin-bottom: 16px;
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
  padding: 12px 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  margin: 0 0 12px 0;
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
  padding: 8px;
  background: #f8f9fa;
  font-weight: 500;
  text-align: left;
  color: #495057;
  border-bottom: 1px solid #dee2e6;
}

.order-table td {
  padding: 8px;
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
  padding: 12px 16px;
  margin-bottom: 16px;
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
  padding: 12px 16px;
  margin-bottom: 16px;
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
  width: 48px;
  height: 48px;
  /* background: #4066fa; */
  color: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.file-icon svg {
  width: 30px;
  height: 30px;
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
  padding: 7px 10px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 60px;
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

/* 수정 확인 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #212529;
}

.modal-body {
  padding: 20px 24px;
}

.modal-body p {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #495057;
  line-height: 1.5;
}

.modal-description {
  font-size: 13px !important;
  color: #6c757d !important;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid #667eea;
}

.modal-footer {
  padding: 0 24px 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.modal-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.cancel-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.confirm-btn {
  background: #667eea;
  color: white;
}

.confirm-btn:hover {
  background: #5a67d8;
}
</style>
