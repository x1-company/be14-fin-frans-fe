<template>
  <div class="order-approval-form">
    <!-- 결재문서 선택 -->
    <div class="form-section">
      <div class="section-header">
        <h3 class="section-title">결재문서</h3>
        <button class="add-document-button" @click="handleAddDocument"
          >문서 추가</button
        >
      </div>

      <div class="document-table">
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>문서번호</th>
              <th>가맹점명</th>
              <th>작성일자</th>
              <th>금액</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="selectedDocuments.length === 0">
              <td colspan="6" class="text-center">문서를 추가해주세요.</td>
            </tr>
            <tr
              v-for="(doc, index) in selectedDocuments"
              :key="doc.id ?? doc.code"
            >
              <td>{{ index + 1 }}</td>
              <td>{{ doc.code }}</td>
              <td>{{ doc.franchiseName }}</td>
              <td>{{ formatDate(doc.createdAt) }}</td>
              <td>{{ doc.totalAmount?.toLocaleString() }}원</td>
              <td>
                <button class="remove-button" @click="removeDocument(index)">
                  ×
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 결재 내용 -->
    <div class="form-section">
      <h3 class="section-title">결재 내용</h3>
      <div class="content-form">
        <div class="form-group">
          <label>제목</label>
          <input
            type="text"
            v-model="formData.title"
            placeholder="결재 제목을 입력하세요"
            class="title-input"
          />
        </div>
        <div class="form-group">
          <label>내용</label>
          <textarea
            v-model="formData.remarks"
            placeholder="결재 내용을 입력하세요"
            class="content-textarea"
            maxlength="255"
            @input="updateRemarksCount"
          ></textarea>
          <div class="char-count">{{ remarksLength }}/255</div>
        </div>
      </div>
    </div>

    <!-- 결재선 -->
    <div class="form-section">
      <div class="section-header">
        <h3 class="section-title">결재선</h3>
        <div class="header-buttons">
          <button class="load-template-button" @click="showTemplateModal = true"
            >결재선 불러오기</button
          >
          <button
            class="add-approver-button"
            @click="showApprovalLineModal = true"
          >
            결재자 추가
          </button>
        </div>
      </div>

      <div v-if="formData.approvalLines.length === 0" class="no-approval-line">
        <p>결재선이 지정되지 않았습니다.</p>
        <p>결재자를 추가하거나 템플릿을 불러와주세요.</p>
      </div>

      <div v-else class="approval-line-list approval-line-row">
        <div class="approval-line-left">
          <div class="side-section-title main">결재 / 협조</div>
          <draggable
            :list="approvalAndCollaboratorLines"
            group="people"
            item-key="id"
            class="approval-draggable-list"
            :animation="200"
            @end="onDragEnd"
          >
            <template #item="{ element, index }">
              <div class="approval-card" :class="element.type.toLowerCase()">
                <span class="order-num" :class="element.type.toLowerCase()">{{
                  index + 1
                }}</span>
                <span
                  class="circle-initial"
                  :class="element.type.toLowerCase()"
                  >{{ element.name[0] }}</span
                >
                <div class="user-info">
                  <span class="user-name">{{ element.name }}</span>
                  <span class="user-meta"
                    >{{ element.position }} / {{ element.dept }}</span
                  >
                </div>
                <span
                  class="badge"
                  :class="`badge-${element.type.toLowerCase()}`"
                >
                  {{ element.type === "APPROVER" ? "결재" : "협조" }}
                </span>
                <button
                  class="remove-approver"
                  @click="removeApprover(element.id)"
                >
                  ×
                </button>
              </div>
            </template>
          </draggable>
        </div>
        <div class="approval-line-right">
          <div v-if="receiverLines.length > 0" class="approval-side-section">
            <div class="side-section-title receiver">수신</div>
            <div
              v-for="line in receiverLines"
              :key="line.id"
              class="approval-card receiver"
            >
              <span class="circle-initial receiver">{{ line.name[0] }}</span>
              <div class="user-info">
                <span class="user-name">{{ line.name }}</span>
                <span class="user-meta"
                  >{{ line.position }} / {{ line.dept }}</span
                >
              </div>
              <button class="remove-approver" @click="removeApprover(line.id)">
                ×
              </button>
            </div>
          </div>
          <div v-if="referenceLines.length > 0" class="approval-side-section">
            <div class="side-section-title reference">참조</div>
            <div
              v-for="line in referenceLines"
              :key="line.id"
              class="approval-card reference"
            >
              <span class="circle-initial reference">{{ line.name[0] }}</span>
              <div class="user-info">
                <span class="user-name">{{ line.name }}</span>
                <span class="user-meta"
                  >{{ line.position }} / {{ line.dept }}</span
                >
              </div>
              <button class="remove-approver" @click="removeApprover(line.id)">
                ×
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 첨부파일 -->
    <div class="form-section">
      <div class="section-header">
        <h3 class="section-title">첨부파일</h3>
        <div class="header-buttons">
          <button class="add-file-button" @click="openFilePicker"
            >파일 추가</button
          >
          <input
            type="file"
            ref="fileInput"
            multiple
            @change="handleFileSelect"
            style="display: none"
          />
        </div>
      </div>

      <div v-if="formData.files.length === 0" class="no-files-attached">
        <p>첨부된 파일이 없습니다.</p>
      </div>

      <div v-else class="file-list">
        <div
          v-for="(file, index) in formData.files"
          :key="index"
          class="file-item"
        >
          <div class="file-info">
            <div class="file-icon">📄</div>
            <div class="file-details">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-size">{{ formatFileSize(file.size) }}</div>
            </div>
          </div>
          <div class="file-actions">
            <span class="file-status">완료</span>
            <button class="remove-file" @click="removeFile(index)">×</button>
          </div>
        </div>
      </div>
    </div>

    <!-- OrderList 모달 -->
    <OrderList
      v-if="showOrderListModal"
      :isVisible="showOrderListModal"
      @close="showOrderListModal = false"
      @select-documents="handleSelectDocuments"
    />

    <!-- 결재선 지정 모달 -->
    <ApprovalLineModal
      v-if="showApprovalLineModal"
      :initial-lines="formData.approvalLines"
      @close="showApprovalLineModal = false"
      @confirm="handleApprovalLineConfirm"
    />

    <!-- 결재선 템플릿 모달 -->
    <ApprovalTemplateModal
      v-if="showTemplateModal"
      @close="showTemplateModal = false"
      @select-template="handleSelectTemplate"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import OrderList from "./modal/OrderList.vue";
import ApprovalLineModal from "./modal/ApprovalLineModal.vue";
import ApprovalTemplateModal from "./modal/ApprovalTemplateModal.vue";
import draggable from "vuedraggable";
import api from "@/lib/api";
import { useRouter } from "vue-router";
// import { approvalRequest } from "@/lib/api/approval.js";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
console.log("accessToken:", authStore.accessToken);

const router = useRouter();

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
});

const showModal = ref(false);
const showOrderListModal = ref(false);
const showApprovalLineModal = ref(false);
const showTemplateModal = ref(false);
const isSubmitting = ref(false);

const emit = defineEmits(["form-data-updated", "approval-submitted"]);

const searchQuery = ref("");
const formData = ref({
  title: "",
  remarks: "",
  approvalLines: [],
  files: [],
  approvalDocuments: {
    categoryType: "ORDER",
    documentIds: [],
  },
});

const fileInput = ref(null);

const selectedDocuments = ref([]);

// 문서 목록
const documents = ref([]);

// 계산된 속성
const filteredDocuments = computed(() => {
  if (!searchQuery.value) return documents.value;
  return documents.value.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// 메서드
const formatCurrency = (amount) => {
  return `₩${amount.toLocaleString()}`;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getApproverTypeLabel = (type) => {
  const labels = {
    APPROVER: "결재자",
    COLLABORATOR: "협조자",
    VIEWER: "참조자",
  };
  return labels[type] || "결재자";
};

const addApprover = () => {
  showApprovalLineModal.value = true;
};

const handleAddApprover = (approvalLineData) => {
  // 결재선에 추가
  formData.value.approvalLines.push({
    userId: approvalLineData.userId,
    userName: approvalLineData.userName,
    userEmail: approvalLineData.userEmail,
    department: approvalLineData.department,
    seq: formData.value.approvalLines.length + 1,
    type: approvalLineData.type,
  });

  showApprovalLineModal.value = false;
  emitFormData();
};

const removeApprover = (id) => {
  formData.value.approvalLines = formData.value.approvalLines.filter(
    (line) => line.id !== id
  );
  emitFormData();
};

const removeDocument = (index) => {
  const removedItem = selectedDocuments.value.splice(index, 1)[0];
  if (removedItem && typeof removedItem.id === "number") {
    const idIndex = formData.value.approvalDocuments.documentIds.indexOf(
      removedItem.id
    );
    if (idIndex > -1) {
      formData.value.approvalDocuments.documentIds.splice(idIndex, 1);
    }
  }
  emitFormData();
};

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  files.forEach((file) => {
    formData.value.files.push({
      name: file.name,
      size: file.size,
      file: file,
      url: "",
    });
  });
  emitFormData();
};

const removeFile = (index) => {
  formData.value.files.splice(index, 1);
  emitFormData();
};

const handleAddDocument = () => {
  showOrderListModal.value = true;
};

const handleSelectDocuments = (selectedItems) => {
  // Append new documents to the existing list, avoiding duplicates
  selectedItems.forEach((newItem) => {
    const isDuplicate = selectedDocuments.value.some(
      (existingDoc) =>
        (newItem.id !== undefined && existingDoc.id === newItem.id) ||
        existingDoc.code === newItem.code
    );
    if (!isDuplicate) {
      selectedDocuments.value.push(newItem);
    }
  });

  // Rebuild the documentIds array to be in sync with the updated selectedDocuments list
  formData.value.approvalDocuments.documentIds = selectedDocuments.value
    .map((doc) => doc.id)
    .filter((id) => typeof id === "number");

  showOrderListModal.value = false;
  emitFormData();
};

const addSelectedDocuments = (selectedDocuments) => {
  // 1. documentIds 배열을 새로 만듭니다.
  formData.value.approvalDocuments.documentIds = [];

  selectedDocuments.forEach((doc) => {
    const displayId = doc.id ?? doc.code;
    const existingDoc = documents.value.find(
      (existing) => existing.id === displayId
    );
    if (!existingDoc) {
      const documentName = doc.franchiseName || `문서 (${doc.code})`;
      documents.value.unshift({
        id: displayId,
        name: documentName,
        date: formatDate(doc.createdAt),
        amount: doc.totalAmount || 0,
      });
    }
    // 숫자 id만 추가
    if (doc.id !== null && doc.id !== undefined) {
      formData.value.approvalDocuments.documentIds.push(doc.id);
    }
  });
  emitFormData();
};

// 날짜 포맷팅 함수 추가
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

const emitFormData = () => {
  emit("form-data-updated", formData.value);
};

// 폼 데이터 변경 감지
watch(
  formData,
  () => {
    emitFormData();
  },
  { deep: true }
);

// 초기화
const initializeForm = () => {
  formData.value.approvalDocuments.documentIds = [1, 2];
  emitFormData();
};

// 부모로부터 데이터 받기
const updateFormData = (data) => {
  formData.value = { ...data };
};

const handleApprovalLineConfirm = ({
  approvalAndCollaboratorLines,
  receivers,
  references,
}) => {
  const receiverList = receivers.map((u) => ({
    ...u,
    type: "RECEIVER",
    userId: u.id || u.userId,
  }));
  const referenceList = references.map((u) => ({
    ...u,
    type: "REFERENCE",
    userId: u.id || u.userId,
  }));

  // approvalAndCollaboratorLines에도 userId 추가
  const approvalAndCollaboratorList = approvalAndCollaboratorLines.map((u) => ({
    ...u,
    userId: u.id || u.userId,
  }));

  formData.value.approvalLines = [
    ...approvalAndCollaboratorList,
    ...receiverList,
    ...referenceList,
  ];

  showApprovalLineModal.value = false;
};

const approvalAndCollaboratorLines = computed(() =>
  formData.value.approvalLines.filter(
    (line) => line.type === "APPROVER" || line.type === "COLLABORATOR"
  )
);

const receiverLines = computed(() =>
  formData.value.approvalLines.filter((line) => line.type === "RECEIVER")
);

const referenceLines = computed(() =>
  formData.value.approvalLines.filter((line) => line.type === "REFERENCE")
);

const approvalTab = ref("APPROVER");
const sideTab = ref("RECEIVER");

const handleSelectTemplate = async (template) => {
  // 템플릿 상세 결재선 정보 조회
  try {
    const { data } = await api.get(
      `/api/hq/approvals/templates/${template.id}`
    );
    // data가 결재선 배열(approvalLines)이라고 가정
    formData.value.approvalLines = data.map((line) => ({
      ...line,
      id: line.userId || line.id, // 내부 일관성 위해 id 필드 보장
      name: line.userName || line.name,
      position: line.positionName || line.position,
      dept: line.departmentName || line.dept,
      type: line.type,
    }));
  } catch (error) {
    alert("템플릿 결재선 정보를 불러오지 못했습니다.");
    console.error(error);
  }
  showTemplateModal.value = false;
};

const remarksLength = computed(() => formData.value.remarks.length);
const updateRemarksCount = () => {
  if (formData.value.remarks.length > 255) {
    formData.value.remarks = formData.value.remarks.slice(0, 255);
  }
};

const onDragEnd = () => {
  formData.value.approvalLines = [
    ...approvalAndCollaboratorLines.value,
    ...receiverLines.value,
    ...referenceLines.value,
  ];
};

const openFilePicker = () => {
  fileInput.value.click();
};

const handleTempSave = async () => {
  if (isSubmitting.value) return;

  try {
    isSubmitting.value = true;

    // 결재선 데이터 변환
    const approvalLines = formData.value.approvalLines
      .filter(
        (line) => line.type === "APPROVER" || line.type === "COLLABORATOR"
      )
      .map((line, index) => ({
        userId: line.userId || line.id || 1, // 기본값 설정
        seq: index + 1,
        type: line.type,
      }));

    // 파일 데이터 변환 (실제로는 파일 업로드 후 URL을 받아야 함)
    const files = formData.value.files.map((file) => ({
      name: file.name,
      url: file.url || "https://files.company.com/docs/temp-file.pdf", // 임시 URL
    }));

    const requestData = {
      title: formData.value.title,
      remarks: formData.value.remarks,
      isRequest: false, // 임시저장
      approvalLines: formData.value.approvalLines
        .filter(
          (line) => line.type === "APPROVER" || line.type === "COLLABORATOR"
        ) // ✅ 필터링
        .map((line, index) => ({
          userId: line.userId,
          seq: index + 1,
          type: line.type,
        })), // ✅ 변환
      files: files,
      approvalDocuments: formData.value.approvalDocuments,
    };

    const response = await api.post("/api/hq/approvals", requestData);

    if (response.status === 200 || response.status === 201) {
      alert("임시저장이 완료되었습니다.");
    }
  } catch (error) {
    console.error("임시저장 실패:", error);
    alert("임시저장에 실패했습니다. 다시 시도해주세요.");
  } finally {
    isSubmitting.value = false;
  }
};

const submitApproval = async () => {
  const currentFormRef = getCurrentFormRef();
  if (currentFormRef && currentFormRef.getFormData) {
    const currentFormData = currentFormRef.getFormData();
    formData.value = { ...formData.value, ...currentFormData };
    formData.value.approvalDocuments = { ...currentFormData.approvalDocuments };
  }

  if (!formData.value.title.trim()) {
    alert("제목을 입력해주세요.");
    return;
  }

  if (formData.value.approvalLines.length === 0) {
    alert("결재선을 설정해주세요.");
    return;
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
      isRequest: formData.value.isRequest,
      approvalLines: formData.value.approvalLines
        .filter(
          (line) => line.type === "APPROVER" || line.type === "COLLABORATOR"
        )
        .map((line, index) => ({
          userId: line.userId,
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
      alert("결재 요청이 성공적으로 등록되었습니다.");
      resetFormData();
    } else {
      throw new Error("결재 요청 등록에 실패했습니다.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("결재 요청 등록 중 오류가 발생했습니다.");
  } finally {
    isSubmitting.value = false;
  }
};

// const handleSubmit = async () => {
//   if (isSubmitting.value) return;

//   // 필수 필드 검증
//   if (!formData.value.title.trim()) {
//     alert("제목을 입력해주세요.");
//     return;
//   }

//   if (!formData.value.remarks.trim()) {
//     alert("내용을 입력해주세요.");
//     return;
//   }

//   if (formData.value.approvalLines.length === 0) {
//     alert("결재선을 지정해주세요.");
//     return;
//   }

//   if (formData.value.approvalDocuments.documentIds.length === 0) {
//     alert("주문 문서를 선택해주세요.");
//     return;
//   }

//   try {
//     isSubmitting.value = true;

//     // 결재선 데이터 변환
//     const approvalLines = formData.value.approvalLines
//       .filter(
//         (line) => line.type === "APPROVER" || line.type === "COLLABORATOR"
//       )
//       .map((line, index) => ({
//         userId: line.userId || line.id || 1, // 기본값 설정
//         seq: index + 1,
//         type: line.type,
//       }));

//     // 파일 데이터 변환 (실제로는 파일 업로드 후 URL을 받아야 함)
//     const files = formData.value.files.map((file) => ({
//       name: file.name,
//       url: file.url || "https://files.company.com/docs/temp-file.pdf", // 임시 URL
//     }));

//     const requestData = {
//       title: formData.value.title,
//       remarks: formData.value.remarks,
//       isRequest: true, // 결재 등록
//       approvalLines: approvalLines,
//       files: files,
//       approvalDocuments: formData.value.approvalDocuments,
//     };

//     const response = await api.post("/api/hq/approvals", requestData);

//     if (response.status === 200 || response.status === 201) {
//       alert("결재가 등록되었습니다.");
//       // 성공 후 폼 초기화 또는 다른 페이지로 이동
//       emit("approval-submitted", response.data);
//     }
//   } catch (error) {
//     console.error("결재 등록 실패:", error);
//     alert("결재 등록에 실패했습니다. 다시 시도해주세요.");
//   } finally {
//     isSubmitting.value = false;
//   }
// };

defineExpose({
  initializeForm,
  updateFormData,
  getFormData: () => formData.value,
  addSelectedDocuments,
});
</script>

<style scoped>
.order-approval-form {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.form-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.header-buttons {
  display: flex;
  gap: 8px;
}

.load-template-button,
.add-approver-button {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.add-approver-button {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.side-section-title.main {
  color: #374151;
  font-weight: 600;
}

/* 문서 검색 */
.document-search {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-input-wrapper {
  display: flex;
  gap: 8px;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  width: 200px;
}

.search-button,
.add-document-button {
  padding: 8px 16px;
  background: #3b82f6;
  color: #fff;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.search-button:hover,
.add-document-button:hover {
  background: #2563eb;
  border-color: #2563eb;
}

/* 문서 테이블 */
.document-table {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.document-table table {
  width: 100%;
  border-collapse: collapse;
}

.document-table th,
.document-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  color: #000000;
}

.document-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #000000;
}

.document-table td {
  color: #000000;
}

.document-table tr:hover {
  background-color: #f9fafb;
}

.remove-button {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
  font-weight: bold;
}

.remove-button:hover {
  color: #dc2626;
}

/* 결재 내용 */
.content-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #374151;
}

.title-input {
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
}

.textarea-wrapper {
  position: relative;
  width: 100%;
}

.content-textarea {
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
}

.char-count {
  text-align: right;
  font-size: 13px;
  color: #888;
  margin-top: 4px;
  margin-right: 2px;
}

.textarea-wrapper,
.char-count-box {
  all: unset;
}

/* 결재선 */
.approval-line-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.approval-line-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.approver-name {
}

/* 파일 업로드 */
.file-upload-area {
  margin-bottom: 20px;
}

.file-upload-button {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  font-size: 20px;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  font-weight: 500;
  color: #374151;
}

.file-size {
  font-size: 12px;
  color: #6b7280;
}

.file-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-status {
  font-size: 12px;
  color: #10b981;
}

.remove-file {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
}

.approval-line-row {
  display: flex;
  flex-direction: row;
  gap: 32px;
  align-items: flex-start;
}
.approval-line-left {
  flex: 2;
  min-width: 0;
}
.approval-line-right {
  flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.approval-side-section {
  margin-bottom: 12px;
}
.approval-card {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  background-color: #ffffff;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  position: relative;
}
.order-num {
  font-size: 16px;
  font-weight: 600;
  width: 24px;
}
.order-num.approver {
  color: #3b82f6;
}
.order-num.collaborator {
  color: #ec4899;
}
.circle-initial {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  margin: 0 16px;
}
.circle-initial.approver {
  background-color: #3b82f6;
}
.circle-initial.collaborator {
  background-color: #ec4899;
}
.circle-initial.receiver {
  background-color: #f59e0b;
}
.circle-initial.reference {
  background-color: #8b5cf6;
}
.user-info {
  flex: 1;
}
.user-name {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}
.user-meta {
  font-size: 13px;
  color: #6b7280;
  margin-top: 2px;
}
.badge {
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
  margin-left: 16px;
  display: none; /* 기본적으로 숨김 */
}
.badge-approver {
  background-color: #eff6ff;
  color: #3b82f6;
}
.badge-collaborator {
  background-color: #fdf2f8;
  color: #ec4899;
}
.remove-approver {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 24px;
  cursor: pointer;
  padding: 0 8px;
}
.side-section-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #8b5cf6;
}
.side-section-title.receiver {
  color: #fbbf24;
}
.side-section-title.reference {
  color: #a78bfa;
}

.no-approval-line {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 8px;
  margin-top: 16px;
}
.no-approval-line p:first-child {
  font-weight: 600;
  margin-bottom: 8px;
}

.add-file-button {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
}

.submit-button,
.temp-save-button {
  padding: 12px 24px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.submit-button {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  font-weight: 600;
}
.submit-button:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
}

.temp-save-button {
  background: #f3f4f6;
  color: #374151;
}
.temp-save-button:hover:not(:disabled) {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.submit-button:disabled,
.temp-save-button:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  border-color: #d1d5db;
}
</style>
