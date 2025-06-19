<template>
  <div class="order-approval-form">
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
        <button
          class="add-approver-button"
          @click="showApprovalLineModal = true"
        >
          결재자 추가
        </button>
      </div>

      <div v-if="formData.approvalLines.length === 0" class="no-approval-line">
        <p>결재선이 지정되지 않았습니다.</p>
        <p>결재자나 추가하거나 템플릿을 불러와주세요.</p>
      </div>

      <div v-else>
        <div class="approval-tab-header">
          <span
            :class="['approval-tab', { active: approvalTab === 'APPROVER' }]"
            @click="approvalTab = 'APPROVER'"
            >결재</span
          >
          <span
            :class="[
              'approval-tab',
              { active: approvalTab === 'COLLABORATOR' },
            ]"
            @click="approvalTab = 'COLLABORATOR'"
            >협조</span
          >
        </div>
        <div v-if="approvalTab === 'APPROVER'">
          <div
            v-for="(line, idx) in formData.approvalLines.filter(
              (l) => l.type === 'APPROVER'
            )"
            :key="'approver-' + idx"
            class="approval-card approver"
          >
            <span class="order-num">{{ idx + 1 }}</span>
            <span class="circle-initial">{{ line.name[0] }}</span>
            <span class="user-info">
              <span class="user-name">{{ line.name }}</span>
              <span class="user-meta"
                >{{ line.position }} / {{ line.dept }}</span
              >
            </span>
            <span class="badge badge-approver">결재</span>
            <button class="remove-approver" @click="removeApprover(idx)"
              >×</button
            >
          </div>
        </div>
        <div v-if="approvalTab === 'COLLABORATOR'">
          <div
            v-for="(line, idx) in formData.approvalLines.filter(
              (l) => l.type === 'COLLABORATOR'
            )"
            :key="'collab-' + idx"
            class="approval-card collaborator"
          >
            <span class="circle-initial">{{ line.name[0] }}</span>
            <span class="user-info">
              <span class="user-name">{{ line.name }}</span>
              <span class="user-meta"
                >{{ line.position }} / {{ line.dept }}</span
              >
            </span>
            <span class="badge badge-collaborator">협조</span>
            <button class="remove-approver" @click="removeApprover(idx)"
              >×</button
            >
          </div>
        </div>
      </div>
    </div>
    <div class="approval-side-box">
      <div class="approval-tab-header">
        <span
          :class="['approval-tab', { active: sideTab === 'RECEIVER' }]"
          @click="sideTab = 'RECEIVER'"
          >수신</span
        >
        <span
          :class="['approval-tab', { active: sideTab === 'REFERENCE' }]"
          @click="sideTab = 'REFERENCE'"
          >참조</span
        >
      </div>
      <div v-if="sideTab === 'RECEIVER'">
        <div
          v-for="(line, idx) in formData.approvalLines.filter(
            (l) => l.type === 'RECEIVER'
          )"
          :key="'receiver-' + idx"
          class="approval-card receiver"
        >
          <span class="circle-initial">{{ line.name[0] }}</span>
          <span class="user-info">
            <span class="user-name">{{ line.name }}</span>
            <span class="user-meta">{{ line.position }} / {{ line.dept }}</span>
          </span>
          <span class="badge badge-receiver">수신</span>
          <button class="remove-approver" @click="removeApprover(idx)"
            >×</button
          >
        </div>
      </div>
      <div v-if="sideTab === 'REFERENCE'">
        <div
          v-for="(line, idx) in formData.approvalLines.filter(
            (l) => l.type === 'REFERENCE'
          )"
          :key="'ref-' + idx"
          class="approval-card reference"
        >
          <span class="circle-initial">{{ line.name[0] }}</span>
          <span class="user-info">
            <span class="user-name">{{ line.name }}</span>
            <span class="user-meta">{{ line.position }} / {{ line.dept }}</span>
          </span>
          <span class="badge badge-reference">참조</span>
          <button class="remove-approver" @click="removeApprover(idx)"
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

    <!-- OrderList 모달 -->
    <OrderList
      v-if="showOrderListModal"
      @close="showOrderListModal = false"
      @select-documents="handleSelectDocuments"
    />

    <!-- ApprovalLineModal 모달 -->
    <ApprovalLineModal
      v-if="showApprovalLineModal"
      @close="showApprovalLineModal = false"
      @confirm="handleApprovalLineConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import OrderList from "./modal/OrderList.vue";
import ApprovalLineModal from "./modal/ApprovalLineModal.vue";

const showModal = ref(false);
const showOrderListModal = ref(false);
const showApprovalLineModal = ref(false);

const emit = defineEmits(["form-data-updated"]);

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

const removeApprover = (index) => {
  formData.value.approvalLines.splice(index, 1);
  formData.value.approvalLines.forEach((line, idx) => {
    line.seq = idx + 1;
  });
  emitFormData();
};

const removeDocument = (docId) => {
  // documents 배열에서 삭제
  const docIndex = documents.value.findIndex((doc) => doc.id === docId);
  if (docIndex > -1) {
    documents.value.splice(docIndex, 1);
  }

  // approvalDocuments에서 삭제
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
  showOrderListModal.value = true;
};

const handleSelectDocuments = (selectedDocuments) => {
  selectedDocuments.forEach((doc) => {
    // 이미 존재하는 문서인지 확인
    const existingDoc = documents.value.find(
      (existing) => existing.id === doc.id
    );
    if (!existingDoc) {
      // 주문 코드를 문서명으로 사용하고, 매장명을 추가
      const documentName = `${doc.franchiseName} - ${doc.code}`;

      // 새로운 문서를 배열의 맨 앞에 추가
      documents.value.unshift({
        id: doc.id,
        name: documentName,
        date: formatDate(doc.createdAt),
        amount: doc.totalAmount,
      });

      // approvalDocuments에 추가
      formData.value.approvalDocuments.documentIds.push(doc.id);
    }
  });
  showOrderListModal.value = false;
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

// 부모로부터 선택된 문서 받기
const addSelectedDocuments = (selectedDocuments) => {
  selectedDocuments.forEach((doc) => {
    // 이미 존재하는 문서인지 확인
    const existingDoc = documents.value.find(
      (existing) => existing.id === doc.id
    );
    if (!existingDoc) {
      // 주문 코드를 문서명으로 사용하고, 매장명을 추가
      const documentName = `${doc.franchiseName} - ${doc.code}`;

      // 새로운 문서를 배열의 맨 앞에 추가
      documents.value.unshift({
        id: doc.id,
        name: documentName,
        date: formatDate(doc.createdAt),
        amount: doc.totalAmount,
      });

      // approvalDocuments에 추가
      formData.value.approvalDocuments.documentIds.push(doc.id);
    }
  });
  emitFormData();
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
  approvers,
  collaborators,
  receivers,
  references,
}) => {
  // 결재선 데이터 통합
  formData.value.approvalLines = [
    ...approvers.map((u) => ({ ...u, type: "APPROVER" })),
    ...collaborators.map((u) => ({ ...u, type: "COLLABORATOR" })),
    ...receivers.map((u) => ({ ...u, type: "RECEIVER" })),
    ...references.map((u) => ({ ...u, type: "REFERENCE" })),
  ];
  showApprovalLineModal.value = false;
};

const approvalTab = ref("APPROVER");
const sideTab = ref("RECEIVER");

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

.approval-line-grid {
  display: flex;
  gap: 32px;
}
.approval-line-left,
.approval-line-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.approval-card {
  display: flex;
  align-items: center;
  background: #f4f7fd;
  border-radius: 10px;
  padding: 14px 18px;
  gap: 14px;
  font-size: 15px;
  position: relative;
}
.approval-card.approver {
  border-left: 4px solid #2563eb;
}
.approval-card.collaborator {
  border-left: 4px solid #f472b6;
}
.approval-card.receiver {
  border-left: 4px solid #fbbf24;
}
.approval-card.reference {
  border-left: 4px solid #a78bfa;
}
.circle-initial {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #dbeafe;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 17px;
}
.approval-card.collaborator .circle-initial {
  background: #fbcfe8;
  color: #f472b6;
}
.approval-card.receiver .circle-initial {
  background: #fde68a;
  color: #b45309;
}
.approval-card.reference .circle-initial {
  background: #e9e1fa;
  color: #7c3aed;
}
.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.user-name {
  font-weight: 600;
  color: #222;
}
.user-meta {
  color: #666;
  font-size: 13px;
}
.badge {
  margin-left: auto;
  font-size: 13px;
  font-weight: 500;
  padding: 2px 12px;
  border-radius: 8px;
  background: #fff;
  border: 1.5px solid #d1d5db;
  color: #888;
}
.badge-approver {
  border-color: #2563eb;
  color: #2563eb;
}
.badge-collaborator {
  border-color: #f472b6;
  color: #f472b6;
}
.badge-receiver {
  border-color: #fbbf24;
  color: #b45309;
}
.badge-reference {
  border-color: #a78bfa;
  color: #7c3aed;
}
.order-num {
  font-weight: 700;
  color: #2563eb;
  margin-right: 8px;
  font-size: 16px;
}
.remove-approver {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 18px;
  margin-left: 8px;
}
.approval-tab-header {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
  gap: 16px;
}
.approval-tab {
  color: #bdbdbd;
  cursor: pointer;
  padding-bottom: 2px;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border-bottom 0.2s;
}
.approval-tab.active {
  color: #2563eb;
  border-bottom: 2px solid #2563eb;
}
.approval-side-box {
  margin-top: 32px;
}
</style>
