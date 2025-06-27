<template>
  <div class="info-container">
    <div class="breadcrumb-container">
      <Breadcrumb :items="breadcrumbItems || []" />
    </div>
    <div class="info-content">
      <div class="header-banner">
        <div class="info-group">
          <InfoHeader
            :title="title"
            :desc="desc"
            :tabs="['전자결재', '결재템플릿']"
            :activeTab="props.activeTabSwitch"
            @select-tab="updateTab"
            @update-breadcrumb="updateBreadcrumb"
          />

          <!-- 수정 모드 -->
          <ApprovalEdit
            v-if="isEditMode"
            :approvalId="editApprovalId"
            :type="editApprovalType"
            :initialData="editApprovalDoc"
            @close="handleCloseEdit"
          />

          <!-- 결재 상세 -->
          <ApprovalDetail
            v-else-if="approvalId && approvalDetail"
            :document="approvalDetail"
            :approvalId="approvalId"
            :currentUserId="authStore.userId"
            @close-detail="$emit('close-detail')"
            @refresh-list="$emit('refresh-list')"
          />

          <!-- 전자결재 목록 -->
          <InfoForm
            v-else-if="props.activeTabSwitch == 0 && !isRegistrationMode"
            :approvalList="safeApprovalList"
            :activeTab="props.activeTab"
            :activeMenu="props.activeMenu"
            @tab-change="handleTabChange"
            @select-menu="handleSelectMenu"
            @refresh-list="$emit('refresh-list')"
            @edit-document="handleEditDocument"
          />

          <!-- 결재 등록 -->
          <ApprovalRegistration
            v-else-if="props.activeTabSwitch === 0 && isRegistrationMode"
            :selectedTemplate="props.selectedTemplate"
            :approvalId="props.approvalId"
            @cancel="(value) => handleToggleRegistrationMode(value)"
            @approval-submitted="handleApprovalSubmitted"
            @counts-refresh="handleCountsRefresh"
            @draft-saved="handleDraftSaved"
          />

          <!-- 결재템플릿 -->
          <ApprovalTemplate
            v-else-if="props.activeTabSwitch === 1"
            :selectedTemplate="props.selectedTemplate"
            :reorderChanges="props.reorderChanges"
            @template-deleted="handleTemplateDeleted"
            @template-updated="handleTemplateUpdated"
            @reorder-mode-changed="handleReorderModeChanged"
            @reorder-complete="handleReorderComplete"
            @reorder-cancel="handleReorderCancel"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import Breadcrumb from "@/components/hq/common/Breadcrumb.vue";
import InfoHeader from "@/components/hq/approval/InfoHeader.vue";
import InfoForm from "@/components/hq/approval/InfoForm.vue";
import ApprovalTemplate from "@/components/hq/approval/ApprovalTemplate.vue";
import ApprovalRegistration from "@/components/hq/approval/ApprovalRegistration.vue";
import ApprovalDetail from "@/components/hq/approval/Detail/ApprovalDetail.vue";
import ApprovalEdit from "@/components/hq/approval/ApprovalEdit.vue";
import { useAuthStore } from "@/stores/auth";
import api from "@/lib/api";

const authStore = useAuthStore();

const isEditMode = ref(false);
const editApprovalId = ref(null);
const editApprovalType = ref("ORDER");
const editApprovalDoc = ref(null);

// approvalDocuments가 documentIds만 있을 때 상세 문서 배열을 fetch하는 함수
async function fetchDocumentsByIds(documentIds) {
  // 예시: ORDER 타입만 처리, 필요시 타입별로 분기
  const promises = documentIds.map((id) =>
    api.get(`/api/hq/orders/${id}`).then((res) => res.data)
  );
  return Promise.all(promises);
}

// handleEditDocument를 비동기로 변경
const handleEditDocument = async (document) => {
  isEditMode.value = true;
  editApprovalId.value = document.approvalId;
  editApprovalType.value = document.categoryType || document.type || "ORDER";
  let docs = [];
  if (Array.isArray(document.approvalDocuments)) {
    docs = document.approvalDocuments;
  } else if (Array.isArray(document.approvalDocuments?.documents)) {
    docs = document.approvalDocuments.documents;
  } else if (Array.isArray(document.approvalDocuments?.documentIds)) {
    docs = await fetchDocumentsByIds(document.approvalDocuments.documentIds);
  }
  editApprovalDoc.value = {
    ...document,
    approvalDocuments: docs,
  };
};

const handleCloseEdit = () => {
  isEditMode.value = false;
  editApprovalId.value = null;
  editApprovalType.value = "ORDER";
  editApprovalDoc.value = null;
};

const handleTabChange = (tabValue) => {
  emit("tab-change", tabValue); // InfoView.vue 로 전달
};

const breadcrumbItems = ref(["HOME", "결재관리", "전자결재"]);
const updateBreadcrumb = (newItems) => {
  breadcrumbItems.value = newItems;
};

const tabInfo = ref([
  { title: "전자결재", desc: "전자 결재를 관리할 수 있습니다." },
  { title: "결재템플릿", desc: "결재 템플릿을 관리할 수 있습니다." },
]);

const props = defineProps({
  approvalList: Array,
  selectedTemplate: { type: Object, default: null },
  activeTab: String,
  activeMenu: String,
  handleTabChange: Function,
  isRegistrationMode: Boolean,
  reorderChanges: Array,
  approvalId: [String, Number],
  approvalDetail: Object,
  activeTabSwitch: Number,
});

const title = computed(() => tabInfo.value[props.activeTabSwitch].title);
const desc = computed(() => tabInfo.value[props.activeTabSwitch].desc);

const emit = defineEmits([
  "tab-change",
  "active-tab-change",
  "toggle-registration-mode",
  "template-deleted",
  "template-updated",
  "reorder-mode-changed",
  "reorder-complete",
  "reorder-cancel",
  "refresh-list",
  "approval-submitted",
  "close-detail",
  "select-menu",
  "counts-refresh",
]);

const updateTab = (newTabIndex) => {
  updateBreadcrumb(["HOME", "결재관리", tabInfo.value[newTabIndex].title]);

  // 탭 인덱스에 따라 적절한 이벤트 발생
  if (newTabIndex === 1) {
    // 결재템플릿 탭
    emit("active-tab-change", 2);
  } else if (newTabIndex === 0) {
    // 전자결재 탭
    emit("active-tab-change", 1);
    emit("tab-change", "상신-전체");
    emit("toggle-registration-mode", false);
  }
};

const handleToggleRegistrationMode = (value) => {
  if (value === true) {
    emit("toggle-registration-mode", value);
  }
};

const handleTemplateDeleted = () => {
  emit("template-deleted");
};

const handleTemplateUpdated = () => {
  emit("template-updated");
};

const handleReorderModeChanged = (mode) => {
  emit("reorder-mode-changed", mode);
};

const handleReorderComplete = () => {
  emit("reorder-complete");
};

const handleReorderCancel = () => {
  emit("reorder-cancel");
};

const handleApprovalSubmitted = (approvalData) => {
  emit("approval-submitted", approvalData);
};

const handleSelectMenu = (menu) => {
  emit("select-menu", menu);
};

const handleCountsRefresh = () => {
  emit("counts-refresh");
};

const handleDraftSaved = () => {
  emit("toggle-registration-mode", false);
  emit("refresh-list");
};

const safeApprovalList = computed(() =>
  (props.approvalList || []).map((item) => ({
    ...item,
    title: item?.title || "-",
    desc: item?.desc || "-",
  }))
);
</script>

<style scoped>
.info-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8f9fa;
}

.info-header {
  border-bottom: 1px solid #e9ecef;
}

.breadcrumb {
  padding: 16px 24px;
  font-size: 14px;
  color: #6c757d;
}

.separator {
  margin: 0 8px;
}

.header-banner {
  color: white;
  padding: 32px 24px;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 8px 0;
}

.page-description {
  margin: 0 0 24px 0;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-outline {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-primary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-primary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.info-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.content-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 24px;
}

.content-header h2 {
  margin: 0;
  color: #212529;
}

.edit-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.info-sections {
  background: white;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.section-title {
  margin: 0 0 20px 0;
  color: #212529;
  font-size: 18px;
  font-weight: 600;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  gap: 24px;
}

.info-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full-width {
  flex: 2;
}

.info-item label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.info-item span {
  font-size: 15px;
  color: #212529;
}

.postal-code {
  font-size: 13px;
  color: #6c757d;
  margin-top: 4px;
}

.contact-grid {
  display: flex;
  gap: 32px;
}

.contact-item {
  flex: 1;
}

.contact-item label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 12px;
}

.contact-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f3f4;
}

.contact-details:last-child {
  border-bottom: none;
}

.contact-label {
  font-size: 14px;
  color: #6c757d;
}

.contact-value {
  font-size: 14px;
  color: #212529;
  font-weight: 500;
}
</style>
