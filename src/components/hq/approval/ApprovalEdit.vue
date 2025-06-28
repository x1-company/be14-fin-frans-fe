<template>
  <!-- 모달 오버레이 -->
  <div class="modal-overlay" @click="handleCloseModal">
    <div class="modal-container" @click.stop>
      <!-- 모달 헤더 -->
      <div class="modal-header">
        <h3 class="modal-title">{{
          props.isEditMode ? "결재 수정" : "결재 등록"
        }}</h3>
        <button class="close-button" @click="handleCloseModal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- 모달 내용 -->
      <div class="modal-body">
        <div class="order-approval-form">
          <!-- 결재문서 선택 -->
          <div class="form-section">
            <div class="section-header">
              <h3 class="section-title">{{ sectionTitle }}</h3>
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
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(doc, index) in documentDetails"
                    :key="doc.id || index"
                  >
                    <td>{{ index + 1 }}</td>
                    <td>{{ doc.documentNo || doc.code || "-" }}</td>
                    <td>{{ doc.franchiseName || doc.name || "-" }}</td>
                    <td>{{ doc.createdAt || doc.date || "-" }}</td>
                    <td>{{ formatCurrency(doc.amount || doc.totalAmount) }}</td>
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
                <label>비고</label>
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
                <button
                  class="load-template-button"
                  @click="showTemplateModal = true"
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

            <div
              v-if="formData.approvalLines.length === 0"
              class="no-approval-line"
            >
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
                    <div
                      class="approval-card"
                      :class="element.type.toLowerCase()"
                    >
                      <span
                        class="order-num"
                        :class="element.type.toLowerCase()"
                        >{{ index + 1 }}</span
                      >
                      <span
                        class="circle-initial"
                        :class="element.type.toLowerCase()"
                        >{{ element.name ? element.name[0] : "-" }}</span
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
                <div
                  v-if="receiverLines.length > 0"
                  class="approval-side-section"
                >
                  <div class="side-section-title receiver">수신</div>
                  <div
                    v-for="line in receiverLines"
                    :key="line.id"
                    class="approval-card receiver"
                  >
                    <span class="circle-initial receiver">{{
                      line.name ? line.name[0] : "-"
                    }}</span>
                    <div class="user-info">
                      <span class="user-name">{{ line.name }}</span>
                      <span class="user-meta"
                        >{{ line.position }} / {{ line.dept }}</span
                      >
                    </div>
                    <button
                      class="remove-approver"
                      @click="removeApprover(line.id)"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div
                  v-if="referenceLines.length > 0"
                  class="approval-side-section"
                >
                  <div class="side-section-title reference">참조</div>
                  <div
                    v-for="line in referenceLines"
                    :key="line.id"
                    class="approval-card reference"
                  >
                    <span class="circle-initial reference">{{
                      line.name ? line.name[0] : "-"
                    }}</span>
                    <div class="user-info">
                      <span class="user-name">{{ line.name }}</span>
                      <span class="user-meta"
                        >{{ line.position }} / {{ line.dept }}</span
                      >
                    </div>
                    <button
                      class="remove-approver"
                      @click="removeApprover(line.id)"
                    >
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
                <button class="add-file-button" @click="openFilePicker">
                  파일 추가
                </button>
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
                    <div class="file-size">
                      <template
                        v-if="file.size !== undefined && file.size !== null"
                      >
                        {{ formatFileSize(file.size) }}
                      </template>
                      <template v-else-if="file.url">
                        <span v-if="file._sizeLoading">...</span>
                        <span v-else>{{
                          fetchAndShowFileSize(file, index)
                        }}</span>
                      </template>
                      <template v-else>-</template>
                    </div>
                  </div>
                </div>
                <div class="file-actions">
                  <span class="file-status">완료</span>
                  <button class="remove-file" @click="removeFile(index)"
                    >×</button
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- 저장/등록 버튼 영역 -->
          <div class="action-buttons">
            <!-- 재기안 모드일 때는 재기안 버튼만 표시 -->
            <template v-if="props.isResubmitMode">
              <button
                class="register-button"
                @click="handleResubmit"
                :disabled="isSubmitting"
              >
                재기안
              </button>
            </template>
            <!-- 일반 수정 모드일 때는 수정/등록 버튼 표시 -->
            <template v-else>
              <button
                class="edit-button"
                @click="handleEdit"
                :disabled="isSubmitting"
              >
                수정
              </button>
              <button
                class="register-button"
                @click="handleRegister"
                :disabled="isSubmitting"
              >
                등록
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 통합 문서 선택 모달 -->
    <UnifiedDocumentList
      v-if="showOrderListModal"
      :type="type"
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
import { ref, computed, watch, onMounted, nextTick } from "vue";
import UnifiedDocumentList from "./modal/UnifiedDocumentList.vue";
import ApprovalLineModal from "./modal/ApprovalLineModal.vue";
import ApprovalTemplateModal from "./modal/ApprovalTemplateModal.vue";
import draggable from "vuedraggable";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import { useToast } from "@/composables/useToast";

const toast = useToast();

const props = defineProps({
  type: String,
  approvalId: {
    type: [String, Number],
    default: null,
  },
  files: {
    type: Array,
    default: () => [],
  },
  initialData: {
    type: Object,
    default: null,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
  isResubmitMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "form-data-updated",
  "approval-submitted",
  "document-approve",
  "add-file",
  "remove-file",
  "close",
  "refresh-list",
]);

const showModal = ref(false);
const showOrderListModal = ref(false);
const showApprovalLineModal = ref(false);
const showTemplateModal = ref(false);
const isSubmitting = ref(false);

// 파일 입력을 위한 ref 추가
const fileInput = ref(null);

const searchQuery = ref("");
const formData = ref({
  title: "",
  remarks: "",
  approvalLines: [],
  files: [],
  approvalDocuments: {
    documentIds: [],
  },
  signUrl: "",
});

// authStore에서 사용자 서명 자동 설정
const authStore = useAuthStore();

// 컴포넌트 마운트 시 사용자 서명 자동 설정
onMounted(async () => {
  console.log("[ApprovalEdit] mounted, props:", { ...props });

  // 수정 모드이고 approvalId가 있으면 기존 데이터 로드
  if (props.isEditMode && props.approvalId) {
    try {
      // 재기안 모드일 때는 re-draft API 사용, 그렇지 않으면 기존 draft API 사용
      const endpoint = props.isResubmitMode
        ? `/api/hq/approvals/re-draft/${props.approvalId}`
        : `/api/hq/approvals/draft/${props.approvalId}`;

      console.log(
        "[ApprovalEdit] API endpoint:",
        endpoint,
        "isResubmitMode:",
        props.isResubmitMode
      );

      const response = await api.get(endpoint);
      console.log(response);
      if (response.status === 200 && response.data) {
        const approvalData = response.data;
        formData.value = {
          title: approvalData.title || "",
          remarks: approvalData.remarks || "",
          approvalLines: (approvalData.lines || []).map((line) => ({
            ...line,
            name: line.approverName || line.name,
            dept: line.deptName || line.dept,
            position: line.positionName || line.position,
          })),
          files: (approvalData.files || []).map((f) => ({
            name: f.name || f.fileName,
            url: f.url,
          })),
          approvalDocuments: {
            documentIds: Array.isArray(approvalData.approvalDocuments)
              ? approvalData.approvalDocuments.map((doc) => doc.documentId)
              : [],
            categoryType: approvalData.categoryType || props.type,
          },
          signUrl: approvalData.signUrl || "",
        };
        await nextTick();
        emitFormData();

        // 문서 ID가 있으면 문서 정보도 가져오기
        if (
          Array.isArray(approvalData.approvalDocuments) &&
          approvalData.approvalDocuments.length > 0
        ) {
          // 문서 정보가 이미 배열로 들어온 경우 바로 할당
          documents.value = approvalData.approvalDocuments.map((doc) => ({
            ...doc,
            date: formatDate(doc.createdAt),
            createdAt: formatDate(doc.createdAt),
            name: doc.franchiseName || doc.name,
            amount: doc.amount || doc.totalAmount,
            code: doc.documentNo || doc.code,
          }));
        }
      }
    } catch (error) {
      console.error("결재 데이터 로드 실패:", error);
    }
  }

  if (authStore.userSignUrl) {
    formData.value.signUrl = authStore.userSignUrl;
    emitFormData();
  }
});

const categoryType = computed(() => {
  if (props.type === "PURCHASE_ORDER") {
    return "PURCHASE_ORDER";
  }
  return props.type;
});

const documents = ref([]);

const filteredDocuments = computed(() => {
  if (!searchQuery.value) return documents.value;
  return documents.value.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "-";
  return `₩${parseInt(amount, 10).toLocaleString()}`;
};

const formatFileSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return "-";
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
      (existing) => existing.id === doc.id
    );
    if (!existingDoc) {
      let documentData = {
        id: doc.id,
        code: doc.code,
        date: formatDate(doc.createdAt),
        createdAt: formatDate(doc.createdAt),
        amount: doc.totalAmount,
      };

      // 결재 유형에 따라 다른 필드 매핑
      switch (props.type) {
        case "ORDER":
          documentData.name = doc.franchiseName;
          break;
        case "RETURN":
          documentData.name = doc.name; // franchiseName -> name 으로 수정
          documentData.description = doc.description;
          break;
        case "PURCHASE_ORDER":
          documentData.name = doc.supplierName;
          break;
        default:
          documentData.name = doc.franchiseName || doc.name;
      }

      documents.value.unshift(documentData);
      formData.value.approvalDocuments.documentIds.push(doc.id);
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

// initialData가 변경될 때 폼 데이터 업데이트
watch(
  () => props.initialData,
  (newData) => {
    console.log("[ApprovalEdit] initialData changed, props:", { ...props });
    if (newData) {
      // 수정 모드일 때는 기존 데이터를 폼에 채움
      if (props.isEditMode) {
        formData.value = {
          title: newData.title || "",
          remarks: newData.remarks || "",
          approvalLines: (newData.lines || []).map((line) => ({
            ...line,
            name: line.approverName || line.name,
            dept: line.deptName || line.dept,
            position: line.positionName || line.position,
          })),
          files: (newData.files || []).map((f) => ({
            name: f.name || f.fileName,
            url: f.url,
          })),
          approvalDocuments: {
            documentIds: Array.isArray(newData.approvalDocuments)
              ? newData.approvalDocuments.map((doc) => doc.documentId)
              : [],
            categoryType: newData.categoryType || props.type,
          },
          signUrl: newData.signUrl || "",
        };

        // 문서 ID가 있으면 문서 정보도 가져오기
        if (
          Array.isArray(newData.approvalDocuments) &&
          newData.approvalDocuments.length > 0
        ) {
          fetchDocuments(
            newData.approvalDocuments.map((doc) => doc.documentId)
          );
        }
      } else {
        // 등록 모드일 때는 기존 로직 유지
        formData.value = {
          ...formData.value,
          ...newData,
          approvalDocuments: {
            ...formData.value.approvalDocuments,
            ...newData.approvalDocuments,
          },
        };

        // 문서 ID가 있으면 문서 정보도 가져오기
        if (newData.approvalDocuments?.documentIds?.length > 0) {
          fetchDocuments(newData.approvalDocuments.documentIds);
        }
      }
    }
  },
  { immediate: true, deep: true }
);

const initializeForm = () => {
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
    toast.error("템플릿 결재선 정보를 불러오지 못했습니다.");
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

const router = useRouter();

const handleEdit = async () => {
  if (isSubmitting.value) return;

  // 제목, 결재선, 결재문서 모두 필수
  if (!formData.value.title || !formData.value.title.trim()) {
    toast.error("제목을 입력해주세요.");
    return;
  }
  if (
    !formData.value.approvalLines ||
    formData.value.approvalLines.length === 0
  ) {
    toast.error("결재선을 지정해주세요.");
    return;
  }
  if (
    !formData.value.approvalDocuments ||
    !formData.value.approvalDocuments.documentIds ||
    formData.value.approvalDocuments.documentIds.length === 0
  ) {
    toast.error("주문 문서를 선택해주세요.");
    return;
  }

  try {
    isSubmitting.value = true;

    // 파일 업로드 및 files 배열 생성
    const uploadedFiles = [];
    for (const file of formData.value.files) {
      if (!file.url && file.file) {
        const uploadedUrlArr = await uploadFiles([file.file]);
        const uploadedUrl = Array.isArray(uploadedUrlArr)
          ? uploadedUrlArr[0]
          : uploadedUrlArr;
        uploadedFiles.push({
          name: file.name,
          url: uploadedUrl,
        });
      } else if (file.url) {
        uploadedFiles.push({
          name: file.name,
          url: file.url,
        });
      }
    }

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

    const requestData = {
      title: formData.value.title,
      remarks: formData.value.remarks,
      isRequest: false,
      approvalLines: approvalLines,
      files: uploadedFiles,
      approvalDocuments: {
        ...formData.value.approvalDocuments,
        categoryType: categoryType.value,
      },
    };

    console.log("임시저장 전송 데이터 확인:", requestData);

    const response = await api.put(
      `/api/hq/approvals/${props.approvalId}`,
      requestData
    );

    if (response.status === 200 || response.status === 201) {
      toast.success("임시저장이 완료되었습니다.");
      emit("approval-submitted", response.data);
      router.push("/approval").then(() => {
        window.location.reload();
      });
    }
  } catch (error) {
    console.error("임시저장 실패:", error);
    toast.error("임시저장에 실패했습니다. 다시 시도해주세요.");
  } finally {
    isSubmitting.value = false;
  }
};

const handleRegister = async () => {
  if (isSubmitting.value) return;

  // 디버깅용: formData 값 확인
  console.log(
    "handleRegister formData:",
    JSON.parse(JSON.stringify(formData.value))
  );

  if (!formData.value.title || !formData.value.title.trim()) {
    toast.error("제목을 입력해주세요.");
    return;
  }
  if (
    !formData.value.approvalLines ||
    formData.value.approvalLines.length === 0
  ) {
    toast.error("결재선을 지정해주세요.");
    return;
  }
  if (
    !formData.value.approvalDocuments ||
    !formData.value.approvalDocuments.documentIds ||
    formData.value.approvalDocuments.documentIds.length === 0
  ) {
    toast.error("주문 문서를 선택해주세요.");
    return;
  }

  try {
    isSubmitting.value = true;

    // 파일 업로드 및 files 배열 생성
    const uploadedFiles = [];
    for (const file of formData.value.files) {
      if (!file.url && file.file) {
        // 새로 추가된 파일만 업로드
        const uploadedUrl = await uploadFiles([file.file]);
        uploadedFiles.push({
          name: file.name,
          url: uploadedUrl[0],
        });
      } else {
        // 이미 업로드된 파일
        uploadedFiles.push({
          name: file.name,
          url: file.url,
        });
      }
    }

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

    const requestData = {
      title: formData.value.title,
      remarks: formData.value.remarks,
      isRequest: true,
      approvalLines: approvalLines,
      files: uploadedFiles,
      approvalDocuments: {
        categoryType: formData.value.approvalDocuments.categoryType,
        documentIds: formData.value.approvalDocuments.documentIds,
      },
    };

    console.log("결재등록 PATCH body:", requestData);

    // PUT 요청
    const response = await api.put(
      `/api/hq/approvals/${props.approvalId}`,
      requestData
    );

    if (response.status === 200 || response.status === 201) {
      const message = props.isEditMode
        ? "결재가 수정되었습니다."
        : "결재가 등록되었습니다.";
      toast.success(message);
      emit("approval-submitted", response.data);

      // 결재 상세 페이지로 이동
      router.push(`/approval/${props.approvalId}`);
    }
  } catch (error) {
    console.error("결재 등록/수정 실패:", error);
    const message = props.isEditMode
      ? "결재 수정에 실패했습니다."
      : "결재 등록에 실패했습니다.";
    toast.error(message + " 다시 시도해주세요.");
  } finally {
    isSubmitting.value = false;
  }
};

const handleApproveDocument = (document) => {
  emit("document-approve", document);
};

// 결재 유형에 따른 동적 컬럼 헤더
const tableHeaders = computed(() => {
  switch (props.type) {
    case "ORDER":
      return ["No.", "문서번호", "주문일", "가맹점명", "금액"];
    case "RETURN":
      return ["No.", "문서번호", "반품일", "반품사유", "금액"];
    case "PURCHASE_ORDER":
      return ["No.", "문서번호", "발주일", "공급처명", "금액"];
    default:
      return ["No.", "문서번호", "작성일", "작성자", "금액"];
  }
});

// 결재 유형에 따른 동적 필드명
const fieldNames = computed(() => {
  switch (props.type) {
    case "ORDER":
      return {
        dateField: "createdAt",
        nameField: "franchiseName",
        amountField: "totalAmount",
      };
    case "RETURN":
      return {
        dateField: "createdAt",
        nameField: "description",
        amountField: "totalAmount",
      };
    case "PURCHASE_ORDER":
      return {
        dateField: "createdAt",
        nameField: "supplierName",
        amountField: "totalAmount",
      };
    default:
      return {
        dateField: "createdAt",
        nameField: "name",
        amountField: "amount",
      };
  }
});

// 결재 유형에 따른 섹션 제목
const sectionTitle = computed(() => {
  switch (props.type) {
    case "ORDER":
      return "주문 문서";
    case "RETURN":
      return "반품 문서";
    case "PURCHASE_ORDER":
      return "발주 문서";
    default:
      return "결재 문서";
  }
});

// 결재 유형에 따른 문서 테이블 헤더
const documentTableHeaders = computed(() => {
  switch (props.type) {
    case "ORDER":
      return ["No.", "문서번호", "작성일", "가맹점명", "금액"];
    case "RETURN":
      return ["No.", "문서번호", "가맹점명", "작성일", "반품사유", "금액"];
    case "PURCHASE_ORDER":
      return ["No.", "문서번호", "작성일", "공급처명", "금액"];
    default:
      return ["No.", "문서번호", "작성일", "작성자", "금액"];
  }
});

// 파일 선택 창 열기
const openFilePicker = () => {
  fileInput.value.click();
};

// 파일 제거
const removeFile = (index) => {
  formData.value.files.splice(index, 1);
  emitFormData();
};

// 문서 ID로 문서 정보 가져오기
const fetchDocuments = async (documentIds) => {
  try {
    const promises = documentIds.map(async (id) => {
      // 결재 유형에 따라 다른 API 엔드포인트 사용
      let endpoint;
      switch (props.type) {
        case "ORDER":
          endpoint = `/api/hq/orders/${id}`;
          break;
        case "RETURN":
          endpoint = `/api/hq/returns/${id}`;
          break;
        case "PURCHASE_ORDER":
          endpoint = `/api/hq/purchases/${id}`;
          break;
        default:
          return null;
      }

      const response = await api.get(endpoint);
      return response.data;
    });

    const fetchedDocuments = await Promise.all(promises);
    const validDocuments = fetchedDocuments.filter((doc) => doc !== null);

    // documents 배열에 추가
    validDocuments.forEach((doc) => {
      const existingDoc = documents.value.find(
        (existing) => existing.id === doc.id
      );
      if (!existingDoc) {
        let documentData = {
          id: doc.id || doc.code,
          code: doc.code,
          date: formatDate(doc.createdAt),
          createdAt: formatDate(doc.createdAt),
          amount: doc.totalAmount,
        };

        // 결재 유형에 따라 다른 필드 매핑
        switch (props.type) {
          case "ORDER":
            documentData.name = doc.franchiseName;
            break;
          case "RETURN":
            documentData.name = doc.name;
            documentData.description = doc.description;
            break;
          case "PURCHASE_ORDER":
            documentData.name = doc.supplierName;
            break;
          default:
            documentData.name = doc.franchiseName || doc.name;
        }

        documents.value.push(documentData);
      }
    });
  } catch (error) {
    console.error("문서 정보 가져오기 실패:", error);
  }
};

// 문서 테이블에서 문서 상세정보를 보여주기 위한 computed 추가
const documentDetails = computed(() => documents.value);

// 결재선 상세정보를 보여주기 위한 computed 추가
const approvalLineDetails = computed(() => {
  return Array.isArray(props.initialData?.lines) ? props.initialData.lines : [];
});

// 모달 닫기 핸들러 수정
const handleCloseModal = () => {
  emit("close");
  emit("refresh-list");
  router.push("/approval");
};

// 재기안 핸들러
const handleResubmit = async () => {
  if (isSubmitting.value) return;

  // 제목, 결재선, 결재문서 모두 필수
  if (!formData.value.title || !formData.value.title.trim()) {
    toast.error("제목을 입력해주세요.");
    return;
  }
  if (
    !formData.value.approvalLines ||
    formData.value.approvalLines.length === 0
  ) {
    toast.error("결재선을 지정해주세요.");
    return;
  }
  if (
    !formData.value.approvalDocuments ||
    !formData.value.approvalDocuments.documentIds ||
    formData.value.approvalDocuments.documentIds.length === 0
  ) {
    toast.error("주문 문서를 선택해주세요.");
    return;
  }

  try {
    isSubmitting.value = true;

    // 파일 업로드 및 files 배열 생성 (handleEdit와 동일)
    const uploadedFiles = [];
    for (const file of formData.value.files) {
      if (!file.url && file.file) {
        const uploadedUrlArr = await uploadFiles([file.file]);
        const uploadedUrl = Array.isArray(uploadedUrlArr)
          ? uploadedUrlArr[0]
          : uploadedUrlArr;
        uploadedFiles.push({
          name: file.name,
          url: uploadedUrl,
        });
      } else if (file.url) {
        uploadedFiles.push({
          name: file.name,
          url: file.url,
        });
      }
    }

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

    const requestData = {
      title: formData.value.title,
      remarks: formData.value.remarks,
      isRequest: true,
      approvalLines: approvalLines,
      files: uploadedFiles,
      approvalDocuments: {
        categoryType: formData.value.approvalDocuments.categoryType,
        documentIds: formData.value.approvalDocuments.documentIds,
      },
    };

    const response = await api.put(
      `/api/hq/approvals/${props.approvalId}`,
      requestData
    );

    if (response.status === 200 || response.status === 201) {
      toast.success("재기안이 완료되었습니다.");
      emit("approval-submitted", response.data);
      router.push("/approval").then(() => {
        window.location.reload();
      });
    }
  } catch (error) {
    console.error("재기안 실패:", error);
    toast.error("재기안에 실패했습니다. 다시 시도해주세요.");
  } finally {
    isSubmitting.value = false;
  }
};

// 파일 크기 동적 조회 함수
const fetchFileSize = async (file, index) => {
  if (!file.url || file.size) return;
  try {
    const response = await fetch(file.url, { method: "HEAD" });
    const size = response.headers.get("Content-Length");
    if (size) {
      // 반응형으로 할당
      formData.value.files[index].size = Number(size);
    } else {
      formData.value.files[index].size = null;
    }
  } catch (e) {
    formData.value.files[index].size = null;
  }
};

// fetchAndShowFileSize 함수 추가
const fetchAndShowFileSize = (file, index) => {
  if (!file._sizeLoading) {
    file._sizeLoading = true;
    fetchFileSize(file, index).then(() => {
      file._sizeLoading = false;
    });
  }
  return "...";
};

defineExpose({
  initializeForm,
  updateFormData,
  getFormData: () => formData.value,
  addSelectedDocuments,
});
</script>

<style scoped>
/* 모달 스타일 추가 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  max-width: 1200px;
  width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.close-button svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 0;
  max-height: calc(90vh - 80px);
  overflow-y: auto;
}

/* 기존 스타일 유지 */
.order-approval-form {
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding: 24px;
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
  margin-top: 32px;
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
  gap: 16px;
  margin-top: 32px;
}

.edit-button,
.register-button {
  padding: 12px 24px;
  border-radius: 6px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-button {
  background: #f3f4f6;
  color: #374151;
}

.edit-button:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.register-button {
  background: #4066fa;
  color: white;
  border: 1px solid #4066fa;
}

.register-button:disabled {
  background: #b3c6fa;
  color: #f3f4f6;
  cursor: not-allowed;
}

/* 파일 첨부 */
.file-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 8px;
  background: #f9fafb;
}

.file-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.file-icon {
  font-size: 24px;
  margin-right: 12px;
}

.file-details {
  display: flex;
  flex-direction: column;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px; /* ← 길이 제한 */
}

.file-size {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.file-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-status {
  font-size: 12px;
  color: #10b981; /* green */
  font-weight: 600;
}

.remove-file {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 16px;
}
</style>
