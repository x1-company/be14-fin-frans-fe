<template>
  <div class="purchase-approval-form">
    <!-- 발주 문서 선택 -->
    <div class="form-section">
      <h3 class="section-title">발주 문서 선택</h3>
      <div class="document-search">
        <div class="search-input-wrapper">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="문서 검색"
            class="search-input"
          />
          <button class="search-button">검색</button>
        </div>
        <button class="add-document-button" @click="handleAddDocument"
          >문서 추가</button
        >
      </div>

      <div class="document-table">
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>문서명</th>
              <th>작성일</th>
              <th>발주 금액</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="doc in filteredDocuments" :key="doc.id">
              <td>{{ doc.id }}</td>
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

    <!-- 공급업체 정보 -->
    <div class="form-section">
      <h3 class="section-title">공급업체 정보</h3>
      <div class="supplier-form">
        <div class="form-group">
          <label>공급업체명</label>
          <input
            type="text"
            v-model="formData.supplierName"
            placeholder="공급업체명을 입력하세요"
            class="supplier-input"
          />
        </div>
        <div class="form-group">
          <label>계약 기간</label>
          <div class="contract-period">
            <input
              type="date"
              v-model="formData.contractStartDate"
              class="date-input"
            />
            <span>~</span>
            <input
              type="date"
              v-model="formData.contractEndDate"
              class="date-input"
            />
          </div>
        </div>
        <div class="form-group">
          <label>계약 조건</label>
          <textarea
            v-model="formData.contractTerms"
            placeholder="계약 조건을 입력하세요"
            class="contract-textarea"
          ></textarea>
        </div>
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
          ></textarea>
        </div>
      </div>
    </div>

    <!-- 결재선 -->
    <div class="form-section">
      <h3 class="section-title">결재선</h3>
      <div class="approval-line-header">
        <button class="load-template-button">결재선 불러오기</button>
        <button class="add-approver-button" @click="addApprover"
          >결재자 추가</button
        >
      </div>

      <div v-if="formData.approvalLines.length === 0" class="no-approval-line">
        <p>결재선이 지정되지 않았습니다.</p>
        <p>결재자나 추가하거나 템플릿을 불러와주세요.</p>
      </div>

      <div v-else class="approval-line-list">
        <div
          v-for="(line, index) in formData.approvalLines"
          :key="index"
          class="approval-line-item"
        >
          <span class="approver-name">결재자 {{ line.userId }}</span>
          <span class="approver-type">{{
            getApproverTypeLabel(line.type)
          }}</span>
          <button class="remove-approver" @click="removeApprover(index)"
            >×</button
          >
        </div>
      </div>
    </div>

    <!-- 첨부파일 -->
    <div class="form-section">
      <h3 class="section-title">첨부파일</h3>
      <div class="file-upload-area">
        <input
          type="file"
          ref="fileInput"
          @change="handleFileSelect"
          multiple
          style="display: none"
        />
        <button class="file-upload-button" @click="$refs.fileInput.click()">
          파일 추가
        </button>
      </div>

      <div v-if="formData.files.length > 0" class="file-list">
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
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const emit = defineEmits(["form-data-updated"]);

const searchQuery = ref("");
const formData = ref({
  title: "",
  remarks: "",
  supplierName: "",
  contractStartDate: "",
  contractEndDate: "",
  contractTerms: "",
  approvalLines: [],
  files: [],
  approvalDocuments: {
    categoryType: "PURCHASE",
    documentIds: [],
  },
});

// 문서 목록
const documents = ref([
  {
    id: 1,
    name: "KFC 원재료 발주서",
    date: "2025.05.30",
    amount: 2500000,
  },
  { id: 2, name: "KFC 포장재 발주서", date: "2025.05.29", amount: 1800000 },
]);

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
  formData.value.approvalLines.push({
    userId: Date.now(),
    seq: formData.value.approvalLines.length + 1,
    type: "APPROVER",
  });
  emitFormData();
};

const removeApprover = (index) => {
  formData.value.approvalLines.splice(index, 1);
  formData.value.approvalLines.forEach((line, idx) => {
    line.seq = idx + 1;
  });
  emitFormData();
};

const removeDocument = (docId) => {
  const index = formData.value.approvalDocuments.documentIds.indexOf(docId);
  if (index > -1) {
    formData.value.approvalDocuments.documentIds.splice(index, 1);
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
  // 문서 추가 로직
  emit("add-document");
};

// 부모로부터 선택된 문서 받기
const addSelectedDocuments = (selectedDocuments) => {
  selectedDocuments.forEach((doc) => {
    documents.value.push({
      id: doc.id,
      name: doc.franchiseName + " 발주 문서",
      date: doc.createdAt.split("T")[0],
      amount: doc.totalAmount,
    });
    // approvalDocuments에 추가
    formData.value.approvalDocuments.documentIds.push(doc.id);
  });
  emitFormData();
};

const emitFormData = () => {
  emit("form-data-updated", formData.value);
};

// 초기화
const initializeForm = () => {
  formData.value.approvalDocuments.documentIds = [1, 2];
  emitFormData();
};

// 부모로부터 데이터 받기
const updateFormData = (data) => {
  formData.value = { ...data };
};

// 폼 데이터 변경 감지
watch(
  formData,
  () => {
    emitFormData();
  },
  { deep: true }
);

defineExpose({
  initializeForm,
  updateFormData,
  getFormData: () => formData.value,
  addSelectedDocuments,
});
</script>

<style scoped>
.purchase-approval-form {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.form-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #1f2937;
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
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
}

.search-button:hover,
.add-document-button:hover {
  background: #e5e7eb;
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
}

.document-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.remove-button {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
}

/* 공급업체 정보 */
.supplier-form {
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

.supplier-input {
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
}

.contract-period {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-input {
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
}

.contract-textarea {
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
}

/* 결재 내용 */
.content-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.title-input {
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
}

.content-textarea {
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
}

/* 결재선 */
.approval-line-header {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.load-template-button,
.add-approver-button {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}

.add-approver-button {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.no-approval-line {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 6px;
}

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
</style>
