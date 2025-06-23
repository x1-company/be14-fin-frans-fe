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
            :activeTab="activeTabSwitch"
            @select-tab="updateTab"
            @update-breadcrumb="updateBreadcrumb"
          />

          <!-- 결재 상세 -->
          <ApprovalDetail
            v-if="approvalId && approvalDetail"
            :document="approvalDetail"
            @close-detail="$emit('close-detail')"
            @refresh-list="$emit('refresh-list')"
          />

          <!-- 전자결재 목록 -->
          <InfoForm
            v-else-if="activeTabSwitch == 0 && !isRegistrationMode"
            :approvalList="approvalList"
            :activeTab="activeTab"
            :activeMenu="activeMenu"
            @tab-change="handleTabChange"
            @select-menu="handleSelectMenu"
            @refresh-list="$emit('refresh-list')"
          />

          <!-- 결재 등록 -->
          <ApprovalRegistration
            v-else-if="activeTabSwitch === 0 && isRegistrationMode"
            :selectedTemplate="props.selectedTemplate"
            @cancel="(value) => handleToggleRegistrationMode(value)"
            @approval-submitted="handleApprovalSubmitted"
            @counts-refresh="handleCountsRefresh"
          />

          <!-- 결재템플릿 -->
          <ApprovalTemplate
            v-else-if="activeTabSwitch === 1"
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

const activeTabSwitch = ref(0); // 기본값 0 (전자결재 탭)

// props로 받은 activeTab 값이 변경될 때 activeTabSwitch 업데이트
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
});

// props.activeTab 값이 변경될 때 activeTabSwitch 업데이트
watch(
  () => props.activeTab,
  (newValue) => {
    if (newValue === "결재템플릿" || newValue === "1") {
      activeTabSwitch.value = 1;
    } else {
      activeTabSwitch.value = 0;
    }
  },
  { immediate: true }
);

const title = computed(() => tabInfo.value[activeTabSwitch.value].title);
const desc = computed(() => tabInfo.value[activeTabSwitch.value].desc);

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
  "counts-refresh", // 새로 추가된 이벤트
]);

const updateTab = (newTabIndex) => {
  activeTabSwitch.value = newTabIndex;
  updateBreadcrumb(["HOME", "결재관리", tabInfo.value[newTabIndex].title]);

  // 결재템플릿 탭(인덱스 1)일 때는 currentTabIndex를 2로 설정
  if (newTabIndex === 1) {
    emit("active-tab-change", 2);
  } else {
    emit("active-tab-change", newTabIndex);
  }

  if (newTabIndex === 0) {
    emit("tab-change", "상신-전체");
    emit("toggle-registration-mode", false);
  }
};

const handleToggleRegistrationMode = (value) => {
  if (value === true) {
    activeTabSwitch.value = 0;
    updateBreadcrumb(["HOME", "결재관리", "전자결재"]);
    emit("active-tab-change", 0);
  }
  emit("toggle-registration-mode", value);
};

// 템플릿 관련 이벤트 핸들러
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

// 카운트 새로고침 이벤트 핸들러 추가
const handleCountsRefresh = () => {
  emit("counts-refresh");
};
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
