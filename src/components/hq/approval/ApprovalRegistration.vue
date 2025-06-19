<template>
  <div class="approval-form-container">
    <!-- 결재 유형 선택 -->
    <div class="form-section">
      <h3 class="section-title">결재 유형 선택</h3>
      <div class="approval-type-cards">
        <div
          v-for="type in approvalTypes"
          :key="type.value"
          :class="[
            'approval-type-card',
            { active: selectedType === type.value },
          ]"
          @click="selectedType = type.value"
        >
          <div class="card-icon" :style="{ color: type.color }">
            <component :is="type.icon" />
          </div>
          <span class="card-label">{{ type.label }}</span>
        </div>
      </div>
    </div>

    <!-- 주문 문서 선택 -->
    <div class="form-section">
      <h3 class="section-title">주문 문서 선택</h3>
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
        <button class="add-document-button">문서 추가</button>
      </div>

      <div class="document-table">
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>문서명</th>
              <th>작성일</th>
              <th>금액</th>
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

    <!-- 제출 버튼 -->
    <div class="form-actions">
      <button class="cancel-button" @click="handleCancel"> 취소 </button>
      <button
        class="submit-button"
        @click="submitApproval"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? "처리중..." : "결재요청" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const emit = defineEmits(["cancel"]);

// 상태 관리
const selectedType = ref("ORDER");
const searchQuery = ref("");
const isSubmitting = ref(false);

// 폼 데이터
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
});

// 결재 유형 옵션
const approvalTypes = ref([
  { value: "ORDER", label: "주문 결재", color: "#3b82f6", icon: "FileText" },
  {
    value: "PURCHASE",
    label: "발주 결재",
    color: "#10b981",
    icon: "ShoppingCart",
  },
  { value: "RETURN", label: "반품 결재", color: "#f59e0b", icon: "RotateCcw" },
]);

// 문서 목록
const documents = ref([
  {
    id: 1,
    name: "KFC 관리운영 위 6건 주문 결재",
    date: "2025.05.30",
    amount: 1250000,
  },
  { id: 2, name: "KFC 입점 주문 결재", date: "2025.05.30", amount: 890000 },
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
    userId: Date.now(), // 임시 ID
    seq: formData.value.approvalLines.length + 1,
    type: "APPROVER",
  });
};

const removeApprover = (index) => {
  formData.value.approvalLines.splice(index, 1);
  // 순서 재정렬
  formData.value.approvalLines.forEach((line, idx) => {
    line.seq = idx + 1;
  });
};

const removeDocument = (docId) => {
  const index = formData.value.approvalDocuments.documentIds.indexOf(docId);
  if (index > -1) {
    formData.value.approvalDocuments.documentIds.splice(index, 1);
  }
};

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  files.forEach((file) => {
    formData.value.files.push({
      name: file.name,
      size: file.size,
      file: file,
      url: "", // 업로드 후 설정될 URL
    });
  });
};

const removeFile = (index) => {
  formData.value.files.splice(index, 1);
};

const submitApproval = async () => {
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
    // 파일 업로드 처리
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

    // API 요청 데이터 구성
    const requestData = {
      title: formData.value.title,
      remarks: formData.value.remarks,
      isRequest: formData.value.isRequest,
      approvalLines: formData.value.approvalLines,
      files: uploadedFiles,
      approvalDocuments: {
        categoryType: selectedType.value,
        documentIds: formData.value.approvalDocuments.documentIds,
      },
    };

    // API 호출
    const response = await fetch("/api/approvals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (response.ok) {
      alert("결재 요청이 성공적으로 등록되었습니다.");
      // 폼 초기화 또는 페이지 이동
      resetForm();
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

const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/files/upload", {
    method: "POST",
    body: formData,
  });

  if (response.ok) {
    const result = await response.json();
    return result.url;
  } else {
    throw new Error("파일 업로드에 실패했습니다.");
  }
};

const resetForm = () => {
  formData.value = {
    title: "",
    remarks: "",
    isRequest: true,
    approvalLines: [],
    files: [],
    approvalDocuments: {
      categoryType: "ORDER",
      documentIds: [],
    },
  };
  selectedType.value = "ORDER";
  searchQuery.value = "";
};

const handleCancel = () => {
  emit("cancel", false);
};

// 컴포넌트 마운트 시 초기화
onMounted(() => {
  // 초기 문서 ID 설정
  formData.value.approvalDocuments.documentIds = [1, 2];
});
</script>

<style scoped>
.approval-form-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
}

.form-section {
  margin-bottom: 40px;
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

/* 결재 유형 선택 */
.approval-type-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.approval-type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.approval-type-card:hover {
  border-color: #d1d5db;
}

.approval-type-card.active {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.card-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.card-label {
  font-weight: 500;
  color: #374151;
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

/* 제출 버튼 */
.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.cancel-button,
.submit-button {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
}

.cancel-button {
  background: none;
  color: #6b7280;
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
