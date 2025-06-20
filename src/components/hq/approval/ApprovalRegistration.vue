<template>
  <div class="info-form">
    <div class="approval-form-container">
      <!-- 결재 유형 선택 컴포넌트 -->
      <ApprovalTypeSelector @type-selected="handleTypeSelected" />

      <!-- 선택된 유형에 따른 폼 컴포넌트 -->
      <OrderApprovalForm
        v-if="selectedType === 'ORDER'"
        type="ORDER"
        ref="orderFormRef"
        @form-data-updated="handleFormDataUpdated"
        @add-document="handleAddDocument"
      />

      <ReturnApprovalForm
        v-if="selectedType === 'RETURN'"
        ref="returnFormRef"
        @form-data-updated="handleFormDataUpdated"
        @add-document="handleAddDocument"
      />

      <PurchaseApprovalForm
        v-if="selectedType === 'PURCHASE'"
        ref="purchaseFormRef"
        @form-data-updated="handleFormDataUpdated"
        @add-document="handleAddDocument"
      />

      <!-- 제출 버튼 -->
      <div class="form-actions">
        <button class="cancel-button" @click="handleCancel"> 취소 </button>
        <div class="action-buttons-right">
          <button
            class="temp-save-button"
            @click="handleTempSave"
            :disabled="isSubmitting"
          >
            임시저장
          </button>
          <button
            class="submit-button"
            @click="submitApproval"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? "처리중..." : "결재요청" }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ReturnList 모달 -->
  <div
    v-if="showReturnListModal"
    class="modal-overlay"
    @click="handleCloseReturnList"
  >
    <div class="modal-content" @click.stop>
      <ReturnList
        @close="handleCloseReturnList"
        @select-documents="handleDocumentSelection"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import ReturnList from "./modal/ReturnList.vue";
import ApprovalTypeSelector from "./ApprovalTypeSelector.vue";
import OrderApprovalForm from "./OrderApprovalForm.vue";
import ReturnApprovalForm from "./ReturnApprovalForm.vue";
import PurchaseApprovalForm from "./PurchaseApprovalForm.vue";
import api from "@/lib/api";

const emit = defineEmits(["submit", "cancel"]);
const props = defineProps({
  selectedTemplate: { type: Object, default: null },
});

// 상태 관리
const selectedType = ref("ORDER");
const isSubmitting = ref(false);
const showReturnListModal = ref(false);

// 폼 참조
const orderFormRef = ref(null);
const returnFormRef = ref(null);
const purchaseFormRef = ref(null);

// 통합된 폼 데이터
const formData = ref({
  title: "",
  remarks: "",
  isRequest: true,
  approvalLines: [],
  files: [],
  approvalDocuments: {
    categoryType: "ORDER",
    documentIds: [],
  },
  returnReason: "",
  detailedReason: "",
  supplierName: "",
  contractStartDate: "",
  contractEndDate: "",
  contractTerms: "",
});

// 결재 유형 변경 핸들러
const handleTypeSelected = (type) => {
  selectedType.value = type;
  formData.value.approvalDocuments.categoryType = type;
  resetFormData();

  nextTick(() => {
    const currentFormRef = getCurrentFormRef();
    if (currentFormRef && currentFormRef.initializeForm) {
      currentFormRef.initializeForm();
    }
  });
};

// 현재 활성화된 폼 참조 가져오기
const getCurrentFormRef = () => {
  switch (selectedType.value) {
    case "ORDER":
      return orderFormRef.value;
    case "RETURN":
      return returnFormRef.value;
    case "PURCHASE":
      return purchaseFormRef.value;
    default:
      return null;
  }
};

// 폼 데이터 업데이트 핸들러
const handleFormDataUpdated = (data) => {
  formData.value = {
    ...formData.value,
    ...data,
    approvalDocuments: {
      ...formData.value.approvalDocuments,
      ...data.approvalDocuments,
    },
  };
};

// 문서 추가 핸들러
const handleAddDocument = () => {
  showReturnListModal.value = true;
};

// ReturnList에서 문서 선택 완료 핸들러
const handleDocumentSelection = (selectedDocuments) => {
  const currentFormRef = getCurrentFormRef();
  if (currentFormRef && currentFormRef.addSelectedDocuments) {
    currentFormRef.addSelectedDocuments(selectedDocuments);
  }
  showReturnListModal.value = false;
};

// ReturnList 모달 닫기 핸들러
const handleCloseReturnList = () => {
  showReturnListModal.value = false;
};

// 폼 데이터 초기화
const resetFormData = () => {
  formData.value = {
    title: "",
    remarks: "",
    isRequest: true,
    approvalLines: [],
    files: [],
    approvalDocuments: {
      categoryType: selectedType.value,
      documentIds: [],
    },
    returnReason: "",
    detailedReason: "",
    supplierName: "",
    contractStartDate: "",
    contractEndDate: "",
    contractTerms: "",
  };
};

const processAndSubmit = async (isRequest) => {
  const currentFormRef = getCurrentFormRef();
  if (currentFormRef && currentFormRef.getFormData) {
    const currentFormData = currentFormRef.getFormData();
    formData.value = { ...formData.value, ...currentFormData };
    formData.value.approvalDocuments = { ...currentFormData.approvalDocuments };
  }

  if (isRequest) {
    if (
      !formData.value.title.trim() ||
      formData.value.title.trim().length < 2
    ) {
      alert("제목을 2자 이상 입력해주세요.");
      return;
    }

    if (formData.value.approvalLines.length === 0) {
      alert("결재선을 설정해주세요.");
      return;
    }
  } else {
    if (!formData.value.title.trim()) {
      formData.value.title = "임시 저장 문서";
    }
  }

  isSubmitting.value = true;

  try {
    const uploadedFiles = [];
    for (const fileData of formData.value.files) {
      if (fileData.file) {
        const uploadedUrl = await uploadFile(fileData.file);
        uploadedFiles.push({
          name: fileData.name,
          url: uploadedUrl,
        });
      }
    }

    const requestData = {
      title: formData.value.title,
      remarks: formData.value.remarks,
      isRequest: isRequest,
      approvalLines: formData.value.approvalLines
        .filter(
          (line) => line.type === "APPROVER" || line.type === "COLLABORATOR"
        )
        .map((line, index) => ({
          userId: line.userId || line.id,
          seq: index + 1,
          type: line.type,
        })),
      files: uploadedFiles,
      approvalDocuments: {
        categoryType: selectedType.value,
        documentIds: formData.value.approvalDocuments.documentIds,
      },
      returnReason: formData.value.returnReason,
      detailedReason: formData.value.detailedReason,
      supplierName: formData.value.supplierName,
      contractStartDate: formData.value.contractStartDate,
      contractEndDate: formData.value.contractEndDate,
      contractTerms: formData.value.contractTerms,
    };

    const response = await api.post("/api/hq/approvals", requestData);

    if (response.status === 200 || response.status === 201) {
      alert(
        isRequest
          ? "결재 요청이 성공적으로 등록되었습니다."
          : "임시저장되었습니다."
      );
      resetFormData();
      emit("cancel", true);
    } else {
      throw new Error(
        isRequest
          ? "결재 요청 등록에 실패했습니다."
          : "임시저장에 실패했습니다."
      );
    }
  } catch (error) {
    console.error("Error:", error);
    alert(
      (isRequest ? "결재 요청 등록" : "임시저장") + " 중 오류가 발생했습니다."
    );
  } finally {
    isSubmitting.value = false;
  }
};

const submitApproval = async () => {
  await processAndSubmit(true);
};

const handleTempSave = async () => {
  await processAndSubmit(false);
};

const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/api/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (response.status === 200 || response.status === 201) {
    return response.data.url;
  } else {
    throw new Error("파일 업로드에 실패했습니다.");
  }
};

const handleCancel = () => {
  emit("cancel", false);
};

// 컴포넌트 마운트 시 초기화
onMounted(() => {
  formData.value.approvalDocuments.documentIds = [1, 2];

  nextTick(() => {
    if (orderFormRef.value && orderFormRef.value.initializeForm) {
      orderFormRef.value.initializeForm();
    }
  });
});
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

.approval-form-container {
  max-width: 1000px;
  margin: 0 auto;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.action-buttons-right {
  display: flex;
  gap: 8px;
}

.cancel-button,
.submit-button,
.temp-save-button {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
}

.cancel-button {
  background: none;
  color: #6b7280;
}

.temp-save-button {
  background: #fff;
  color: #3b82f6;
  border-color: #3b82f6;
}

.submit-button {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.submit-button:disabled {
  background: #e5e7eb;
  border-color: #d1d5db;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
</style>
