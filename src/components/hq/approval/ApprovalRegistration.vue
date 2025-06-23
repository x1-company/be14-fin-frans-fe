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

      <OrderApprovalForm
        v-if="selectedType === 'RETURN'"
        type="RETURN"
        ref="returnFormRef"
        @form-data-updated="handleFormDataUpdated"
        @add-document="handleAddDocument"
      />

      <OrderApprovalForm
        v-if="selectedType === 'PURCHASE'"
        type="PURCHASE_ORDER"
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
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import ApprovalTypeSelector from "./ApprovalTypeSelector.vue";
import OrderApprovalForm from "./OrderApprovalForm.vue";
import api from "@/lib/api";

const emit = defineEmits(["submit", "cancel", "approval-submitted", "counts-refresh"]);

const props = defineProps({
  selectedTemplate: { type: Object, default: null },
});

// 상태 관리
const selectedType = ref("ORDER");
const isSubmitting = ref(false);

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
  // 추가 필드들
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

  // 폼 초기화
  resetFormData();

  // 해당 폼 컴포넌트 초기화
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
  // 선택된 유형에 따라 데이터 병합
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
  // 현재 활성화된 폼 컴포넌트의 문서 추가 기능 호출
  const currentFormRef = getCurrentFormRef();
  if (currentFormRef && currentFormRef.handleAddDocument) {
    currentFormRef.handleAddDocument();
  }
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
      approvalLines: (() => {
        const approvalLines = [];
        let seq = 1;
        formData.value.approvalLines.forEach((line) => {
          approvalLines.push({
              userId: line.userId || line.id,
              seq: seq++,
              type: line.type,
            });
        });
        return approvalLines;
      })(),
      files: uploadedFiles,
      approvalDocuments: {
        categoryType:
          selectedType.value === "PURCHASE"
            ? "PURCHASE_ORDER"
            : selectedType.value,
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

    console.log("결재 등록 응답:", response.data);
    console.log("결재 ID:", response.data?.data?.id);

    if (response.status === 200 || response.status === 201) {
      alert(
        isRequest
          ? "결재 요청이 성공적으로 등록되었습니다."
          : "임시저장되었습니다."
      );
      resetFormData();

      // 카운트 새로고침 이벤트 발생
      emit("counts-refresh");

      if (isRequest && response.data?.data?.id) {
        // 결재 요청 성공 시 생성된 결재 ID를 전달
        console.log("결재 상세 페이지로 이동:", response.data.data.id);
        emit("approval-submitted", response.data.data);
      } else {
        // 임시저장이거나 ID가 없는 경우 기존 동작
        console.log("임시저장 또는 ID 없음, 등록 모드 종료");
        emit("cancel", true);
      }
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
  formData.append("files", file);
  formData.append("type", "approval");
  // formData.append("type", "HQ");
  const response = await api.post("/api/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (response.status === 200 || response.status === 201) {
    return response.data[0];
  } else {
    throw new Error("파일 업로드에 실패했습니다.");
  }
};

const handleCancel = () => {
  emit("cancel", false);
};

// 컴포넌트 마운트 시 초기화
onMounted(() => {
  // 초기 문서 ID 설정
  formData.value.approvalDocuments.documentIds = [1, 2];

  // 첫 번째 폼 초기화
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

/* 제출 버튼 */
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
</style>
