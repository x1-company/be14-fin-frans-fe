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
              <th>작성일</th>
              <th>금액</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(doc, index) in filteredDocuments" :key="doc.id">
              <td>{{ index + 1 }}</td>
              <td>{{ doc.code }}</td>
              <td>{{ doc.name }}</td>
              <td>{{ doc.date }}</td>
              <td>{{ formatCurrency(doc.amount) }}</td>
              <td>
                <button class="remove-button" @click="removeDocument(doc.id)">
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
            v-model="approvalAndCollaboratorLines"
            group="people"
            item-key="id"
            class="approval-draggable-list"
            :animation="200"
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
        <button class="add-file-button" @click="$emit('add-file')">
          파일 추가
        </button>
      </div>
      <div v-if="files.length > 0" class="file-list">
        <div v-for="(file, index) in files" :key="index" class="file-item">
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">{{ formatFileSize(file.size) }}</span>
          <button
            class="remove-file-button"
            @click="$emit('remove-file', index)"
          >
            ×
          </button>
        </div>
      </div>
      <div v-else class="no-files">
        <p>첨부된 파일이 없습니다.</p>
      </div>
    </div>

    <!-- OrderList 모달 -->
    <OrderList
      v-if="showOrderListModal && type === 'ORDER'"
      :isVisible="showOrderListModal"
      @close="showOrderListModal = false"
      @select-documents="handleSelectDocuments"
    />

    <!-- ReturnList 모달 -->
    <ReturnList
      v-if="showOrderListModal && type === 'RETURN'"
      :isVisible="showOrderListModal"
      @close="showOrderListModal = false"
      @select-documents="handleSelectDocuments"
    />

    <!-- PurchaseOrderList 모달 -->
    <PurchaseOrderList
      v-if="showOrderListModal && type === 'PURCHASE'"
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
import ReturnList from "./modal/ReturnList.vue";
import PurchaseOrderList from "./modal/PurchaseOrderList.vue";
import ApprovalLineModal from "./modal/ApprovalLineModal.vue";
import ApprovalTemplateModal from "./modal/ApprovalTemplateModal.vue";
import draggable from "vuedraggable";
import api from "@/lib/api";

const props = defineProps({
  type: String,
  files: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  "form-data-updated",
  "approval-submitted",
  "document-approve",
  "add-file",
  "remove-file",
]);

const showModal = ref(false);
const showOrderListModal = ref(false);
const showApprovalLineModal = ref(false);
const showTemplateModal = ref(false);
const isSubmitting = ref(false);

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

const documents = ref([]);

const filteredDocuments = computed(() => {
  if (!searchQuery.value) return documents.value;
  return documents.value.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

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

const isImage = (file) => {
  return file.name && file.name.match(/\.(jpeg|jpg|gif|png|bmp|webp)$/i);
};

const addApprover = () => {
  showApprovalLineModal.value = true;
};

const removeApprover = (id) => {
  formData.value.approvalLines = formData.value.approvalLines.filter(
    (line) => line.id !== id
  );
  emitFormData();
};

const removeDocument = (docId) => {
  const docIndex = documents.value.findIndex((doc) => doc.id === docId);
  if (docIndex > -1) {
    documents.value.splice(docIndex, 1);
  }

  const index = formData.value.approvalDocuments.documentIds.indexOf(docId);
  if (index > -1) {
    formData.value.approvalDocuments.documentIds.splice(index, 1);
  }
  emitFormData();
};

const uploadFiles = async (files) => {
  try {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    formData.append("type", "approval");

    const response = await api.post("/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("파일 업로드 실패:", error);
    throw new Error("파일 업로드에 실패했습니다.");
  }
};

const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files);
  try {
    const uploadedFiles = await uploadFiles(files);
    uploadedFiles.forEach((uploadedFile) => {
      formData.value.files.push({
        name:
          uploadedFile.originalName ||
          uploadedFile.name ||
          extractFilenameFromUrl(uploadedFile.url),
        size: uploadedFile.size,
        url: uploadedFile.url,
        uuid: uploadedFile.uuid,
      });
    });
  } catch (error) {
    console.error("파일 업로드 실패:", error);
    alert("파일 업로드에 실패했습니다. 다시 시도해주세요.");
  }
  emitFormData();
};

const extractFilenameFromUrl = (url) => {
  if (!url) return "파일명없음";
  const matches = url.match(/\/([^\/?#]+)(?:\?|#|$)/);
  return matches ? matches[1] : "파일명없음";
};

const handleAddDocument = () => {
  showOrderListModal.value = true;
};

const handleSelectDocuments = (selectedDocuments) => {
  selectedDocuments.forEach((doc) => {
    const existingDoc = documents.value.find(
      (existing) => existing.id === (doc.id || doc.code)
    );
    if (!existingDoc) {
      documents.value.unshift({
        id: doc.id || doc.code,
        code: doc.code,
        name: doc.franchiseName,
        date: formatDate(doc.createdAt),
        amount: doc.totalAmount,
      });

      formData.value.approvalDocuments.documentIds.push(doc.id || doc.code);
    }
  });
  showOrderListModal.value = false;
  emitFormData();
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

const addSelectedDocuments = (selectedDocuments) => {
  selectedDocuments.forEach((doc) => {
    const existingDoc = documents.value.find(
      (existing) => existing.id === doc.id
    );
    if (!existingDoc) {
      const documentName = `${doc.franchiseName} - ${doc.code}`;
      documents.value.unshift({
        id: doc.id,
        name: documentName,
        date: formatDate(doc.createdAt),
        amount: doc.totalAmount,
      });

      formData.value.approvalDocuments.documentIds.push(doc.id);
    }
  });
  emitFormData();
};

const emitFormData = () => {
  emit("form-data-updated", formData.value);
};

watch(
  formData,
  () => {
    emitFormData();
  },
  { deep: true }
);

const initializeForm = () => {
  formData.value.approvalDocuments.documentIds = [1, 2];
  emitFormData();
};

const updateFormData = (data) => {
  formData.value = { ...data };
};

const handleApprovalLineConfirm = ({
  approvalAndCollaboratorLines,
  receivers,
  references,
}) => {
  const approvalAndCollaboratorList = approvalAndCollaboratorLines.map((u) => ({
    ...u,
    userId: u.id || u.userId,
    type: u.type || (u.approverType ? u.approverType : "APPROVER"),
  }));

  const receiverList = receivers.map((u) => ({
    ...u,
    userId: u.id || u.userId,
    type: u.type || "RECIPIENT",
  }));

  const referenceList = references.map((u) => ({
    ...u,
    userId: u.id || u.userId,
    type: u.type || "REFERENCE",
  }));

  formData.value.approvalLines = [
    ...approvalAndCollaboratorList,
    ...receiverList,
    ...referenceList,
  ];

  showApprovalLineModal.value = false;
};

const approvalAndCollaboratorLines = computed({
  get() {
    return formData.value.approvalLines.filter(
      (line) => line.type === "APPROVER" || line.type === "COOPERATOR"
    );
  },
  set(newValue) {
    const otherLines = formData.value.approvalLines.filter(
      (line) => line.type !== "APPROVER" && line.type !== "COOPERATOR"
    );
    formData.value.approvalLines = [...newValue, ...otherLines];
  },
});

const receiverLines = computed(() =>
  formData.value.approvalLines.filter((line) => line.type === "RECIPIENT")
);

const referenceLines = computed(() =>
  formData.value.approvalLines.filter((line) => line.type === "REFERENCE")
);

const handleSelectTemplate = async (template) => {
  try {
    const { data } = await api.get(
      `/api/hq/approvals/templates/${template.id}`
    );

    formData.value.approvalLines = data.map((line) => ({
      ...line,
      id: line.userId || line.id,
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

const handleTempSave = async () => {
  if (isSubmitting.value) return;

  try {
    isSubmitting.value = true;

    const approvalLines = [];
    let seq = 1;

    approvalAndCollaboratorLines.value.forEach((line) => {
      approvalLines.push({
        userId: line.userId || line.id,
        seq: seq++,
        type: line.type,
      });
    });

    formData.value.approvalLines
      .filter((line) => line.type === "RECIPIENT" || line.type === "REFERENCE")
      .forEach((line) => {
        approvalLines.push({
          userId: line.userId || line.id,
          seq: 0,
          type: line.type,
        });
      });

    const files = formData.value.files.map((file) => ({
      name: file.name,
      url: file.url,
    }));

    const requestData = {
      title: formData.value.title,
      remarks: formData.value.remarks,
      isRequest: false,
      approvalLines: approvalLines,
      files: files,
      approvalDocuments: formData.value.approvalDocuments,
    };

    console.log("임시저장 전송 데이터 확인:", requestData);

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

const handleSubmit = async () => {
  if (isSubmitting.value) return;

  if (!formData.value.title.trim()) {
    alert("제목을 입력해주세요.");
    return;
  }

  if (!formData.value.remarks.trim()) {
    alert("내용을 입력해주세요.");
    return;
  }

  if (formData.value.approvalLines.length === 0) {
    alert("결재선을 지정해주세요.");
    return;
  }

  if (formData.value.approvalDocuments.documentIds.length === 0) {
    alert("주문 문서를 선택해주세요.");
    return;
  }

  try {
    isSubmitting.value = true;

    const approvalLines = [];
    let seq = 1;

    approvalAndCollaboratorLines.value.forEach((line) => {
      approvalLines.push({
        userId: line.userId || line.id,
        seq: seq++,
        type: line.type,
      });
    });

    formData.value.approvalLines
      .filter((line) => line.type === "RECIPIENT" || line.type === "REFERENCE")
      .forEach((line) => {
        approvalLines.push({
          userId: line.userId || line.id,
          seq: 0,
          type: line.type,
        });
      });

    const files = formData.value.files.map((file) => ({
      name: file.name,
      url: file.url,
    }));

    const requestData = {
      title: formData.value.title,
      remarks: formData.value.remarks,
      isRequest: true,
      approvalLines: approvalLines,
      files: files,
      approvalDocuments: formData.value.approvalDocuments,
    };

    console.log("전송 데이터 확인:", requestData);

    const response = await api.post("/api/hq/approvals", requestData);

    if (response.status === 200 || response.status === 201) {
      alert("결재가 등록되었습니다.");
      emit("approval-submitted", response.data);
    }
  } catch (error) {
    console.error("결재 등록 실패:", error);
    alert("결재 등록에 실패했습니다. 다시 시도해주세요.");
  } finally {
    isSubmitting.value = false;
  }
};

const handleApproveDocument = (document) => {
  emit("document-approve", document);
};

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
  font-size: 16px;
  padding: 4px;
}

.approve-button {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  margin-right: 8px;
}

.approve-button:hover {
  background: #2563eb;
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

/* 결재선 */
.approval-line-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.order-num.cooperator {
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

.circle-initial.cooperator {
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
  display: none; /* 기본 숨김 */
}

.badge-approver {
  background-color: #eff6ff;
  color: #3b82f6;
}

.badge-cooperator {
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

/* 발주 모달 플레이스홀더 스타일 */
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
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.modal-header button {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-header button:hover {
  color: #374151;
}

.modal-body {
  padding: 24px;
  text-align: center;
  color: #6b7280;
}
</style>
