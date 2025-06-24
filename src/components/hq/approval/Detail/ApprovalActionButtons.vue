<template>
  <div class="approval-actions">
    <button
      class="action-button reject-button"
      @click="handleReject"
      :disabled="isProcessing"
    >
      <svg
        class="button-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </svg>
      <span class="button-text">{{ rejectButtonText }}</span>
    </button>

    <button
      class="action-button approve-button"
      @click="handleApprove"
      :disabled="isProcessing"
    >
      <svg
        class="button-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="20,6 9,17 4,12" />
        </svg>
      </svg>
      <span class="button-text">{{ approveButtonText }}</span>
    </button>

    <!-- 반려 사유 입력 모달 -->
    <div v-if="showRejectModal" class="modal-overlay" @click="closeRejectModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ rejectModalTitle }}</h3>
          <button class="close-button" @click="closeRejectModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <textarea
            v-model="rejectReason"
            :placeholder="rejectPlaceholder"
            rows="4"
            class="reason-textarea"
          ></textarea>
        </div>
        <div class="modal-footer">
          <button class="cancel-button" @click="closeRejectModal">
            취소
          </button>
          <button
            class="confirm-reject-button"
            @click="confirmReject"
            :disabled="!rejectReason.trim()"
          >
            반려 확정
          </button>
        </div>
      </div>
    </div>

    <!-- 승인 확인 모달 -->
    <div
      v-if="showApproveModal"
      class="modal-overlay"
      @click="closeApproveModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ approveModalTitle }}</h3>
          <button class="close-button" @click="closeApproveModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p>{{ approveModalContent }}</p>
          <textarea
            v-model="approveComment"
            :placeholder="approvePlaceholder"
            rows="3"
            class="reason-textarea"
          ></textarea>
        </div>
        <div class="modal-footer">
          <button class="cancel-button" @click="closeApproveModal">
            취소
          </button>
          <button class="confirm-approve-button" @click="confirmApprove">
            승인 확정
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

const emit = defineEmits(["approve", "reject"]);

const props = defineProps({
  document: {
    type: Object,
    required: true,
  },
});

const isProcessing = ref(false);
const showRejectModal = ref(false);
const showApproveModal = ref(false);
const rejectReason = ref("");
const approveComment = ref("");
const authStore = useAuthStore();

// 현재 사용자의 역할과 차례 확인
const currentUserLine = computed(() => {
  if (!props.document?.lines || !authStore.userId) return null;
  return props.document.lines.find(
    (line) =>
      String(line.id) === String(authStore.userId) && line.status === "WAITING"
  );
});

// 디버깅을 위한 콘솔 로그 추가
console.log("ApprovalActionButtons - currentUserLine:", currentUserLine.value);
console.log("ApprovalActionButtons - authStore.userId:", authStore.userId);
console.log("ApprovalActionButtons - document lines:", props.document?.lines);

// 사용자 타입 (결재자/협조자)
const userType = computed(() => {
  const line = currentUserLine.value;
  if (!line) return "결재"; // 기본값

  console.log("ApprovalActionButtons - line.type:", line.type);

  // userType이 명확하게 COOPERATOR인 경우에만 협조로 설정
  if (line.type === "COOPERATOR") {
    return "협조";
  } else if (line.type === "APPROVER") {
    return "결재";
  } else {
    // userType이 없거나 다른 값인 경우 기본값
    console.warn("ApprovalActionButtons - Unknown userType:", line.type);
    return "결재";
  }
});

// 버튼 텍스트
const approveButtonText = computed(() => {
  return "승인";
});

const rejectButtonText = computed(() => {
  return "반려";
});

// 모달 제목
const approveModalTitle = computed(() => {
  return "승인 확인";
});

const rejectModalTitle = computed(() => {
  return "반려 사유 입력";
});

// 모달 내용
const approveModalContent = computed(() => {
  return "이 문서를 승인하시겠습니까?";
});

const approvePlaceholder = computed(() => {
  return "승인 의견을 입력해주세요 (선택사항)";
});

const rejectPlaceholder = computed(() => {
  return "반려 사유를 입력해주세요...";
});

const handleReject = () => {
  if (isProcessing.value) return;
  showRejectModal.value = true;
};

const handleApprove = () => {
  if (isProcessing.value) return;
  showApproveModal.value = true;
};

const closeRejectModal = () => {
  showRejectModal.value = false;
  rejectReason.value = "";
};

const closeApproveModal = () => {
  showApproveModal.value = false;
  approveComment.value = "";
};

const confirmReject = async () => {
  if (!rejectReason.value.trim() || !props.document) return;

  isProcessing.value = true;
  try {
    const payload = {
      approvalType: userType.value,
      status: "반려",
      opinion: rejectReason.value.trim(),
    };

    await api.post(
      `/api/hq/approvals/${props.document.approvalId}/reject`,
      payload
    );

    emit("reject", {
      documentId: props.document.approvalId,
      reason: rejectReason.value.trim(),
    });
    closeRejectModal();
  } catch (error) {
    console.error("반려 처리 중 오류가 발생했습니다:", error);
    const errorMessage =
      userType.value === "결재"
        ? "반려 처리에 실패했습니다. 다시 시도해주세요."
        : "협조 반려 처리에 실패했습니다. 다시 시도해주세요.";
    alert(errorMessage);
  } finally {
    isProcessing.value = false;
  }
};

const confirmApprove = async () => {
  if (!props.document) return;

  isProcessing.value = true;
  try {
    const defaultComment =
      userType.value === "결재"
        ? "내용 확인하였습니다. 승인합니다."
        : "내용 확인하였습니다. 협조합니다.";

    const payload = {
      approvalType: userType.value,
      status: "승인",
      opinion: approveComment.value.trim() || defaultComment,
    };

    await api.post(
      `/api/hq/approvals/${props.document.approvalId}/approve`,
      payload
    );

    emit("approve", {
      documentId: props.document.approvalId,
      comment: approveComment.value.trim(),
    });
    closeApproveModal();
  } catch (error) {
    console.error("승인 처리 중 오류가 발생했습니다:", error);
    const errorMessage =
      userType.value === "결재"
        ? "승인 처리에 실패했습니다. 다시 시도해주세요."
        : "협조 승인 처리에 실패했습니다. 다시 시도해주세요.";
    alert(errorMessage);
  } finally {
    isProcessing.value = false;
  }
};
</script>

<style scoped>
.approval-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding: 20px;
  background-color: white;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 7px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 72px;
  border: 2px solid;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reject-button {
  background: white;
  color: #dc3545;
  border-color: #dc3545;
}

.reject-button:hover:not(:disabled) {
  background: #dc3545;
  color: white;
}

.approve-button {
  background: #4066fa;
  color: white;
  border-color: #4066fa;
}

.approve-button:hover:not(:disabled) {
  background: #3056e0;
  border-color: #3056e0;
}

.button-icon {
  width: 18px;
  height: 18px;
}

.button-text {
  font-size: 15px;
}

/* Modal Styles */
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
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #212529;
}

.close-button {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #f8f9fa;
  color: #495057;
}

.close-button svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 24px;
}

.modal-body p {
  margin: 0 0 16px 0;
  color: #495057;
  font-size: 16px;
}

.reason-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
}

.reason-textarea:focus {
  outline: none;
  border-color: #4066fa;
  box-shadow: 0 0 0 3px rgba(64, 102, 250, 0.1);
}

.reason-textarea::placeholder {
  color: #6c757d;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
}

.cancel-button {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  background: white;
  color: #495057;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.cancel-button:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.confirm-reject-button {
  padding: 8px 16px;
  border: none;
  background: #dc3545;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.confirm-reject-button:hover:not(:disabled) {
  background: #c82333;
}

.confirm-reject-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.confirm-approve-button {
  padding: 8px 16px;
  border: none;
  background: #28a745;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.confirm-approve-button:hover {
  background: #218838;
}

/* Responsive */
@media (max-width: 768px) {
  .approval-actions {
    flex-direction: column;
    gap: 12px;
  }

  .action-button {
    width: 100%;
  }

  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .modal-footer {
    flex-direction: column;
  }

  .cancel-button,
  .confirm-reject-button,
  .confirm-approve-button {
    width: 100%;
    padding: 12px;
  }
}
</style>
