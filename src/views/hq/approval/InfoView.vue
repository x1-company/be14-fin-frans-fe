<template>
  <div class="app">
    <NavBar />
    <div class="main-container">
      <!-- 일반 사이드바 (대시보드, 전자결재 탭) -->
      <SideBar
        v-if="currentTabIndex !== 2"
        :activeTab="activeTab.toString()"
        :counts="approvalCounts"
        @select-menu="handleSelectMenu"
        @tab-change="handleTabChange"
        @register-approval="handleRegisterApproval"
      />

      <!-- 템플릿 사이드바 (결재템플릿 탭) -->
      <TemplateSideBar
        v-if="currentTabIndex === 2"
        :selectedTemplate="selectedTemplate"
        :isReorderMode="isReorderMode"
        @select-template="handleTemplateSelect"
        @reorder-change="handleReorderChange"
        ref="templateSidebarRef"
      />

      <!-- Info 컴포넌트에 selectedTemplate 전달 -->
      <Info
        :approvalList="approvalList"
        :activeTab="activeTab.toString()"
        :selectedTemplate="selectedTemplate"
        :isRegistrationMode="isRegistrationMode"
        :reorderChanges="reorderChanges"
        @tab-change="handleTabChange"
        @update:activeTab="handleTabChange"
        @active-tab-change="handleActiveTabChange"
        @toggle-registration-mode="handleToggleRegistrationMode"
        @template-deleted="handleTemplateDeleted"
        @template-updated="handleTemplateUpdated"
        @reorder-mode-changed="handleReorderModeChanged"
        @reorder-complete="handleReorderComplete"
        @reorder-cancel="handleReorderCancel"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from "vue";
import NavBar from "@/components/hq/common/NavBar.vue";
import SideBar from "@/components/hq/approval/SideBar.vue";
import TemplateSideBar from "@/components/hq/approval/TemplateSideBar.vue";
import Info from "@/components/hq/approval/Info.vue";
import api from "@/lib/api";

const approvalList = ref([]);
const activeMenu = ref("전체");
const activeTab = ref("전체");
const currentTabIndex = ref(0);
const selectedTemplate = ref(null);
const isRegistrationMode = ref(false);
const isReorderMode = ref(false);
const templateSidebarRef = ref(null);
const reorderChanges = ref([]); // 순서 변경 정보 저장

const handleSelectMenu = (menuValue) => {
  activeMenu.value = menuValue;
  activeTab.value = menuValue;
};

const handleTabChange = (tabValue) => {
  activeTab.value = tabValue;
};

const handleActiveTabChange = (tabIndex) => {
  currentTabIndex.value = tabIndex;
};

const handleTemplateSelect = (template) => {
  selectedTemplate.value = template;
};

const handleRegisterApproval = () => {
  // 어떤 탭에서든 결재 등록 버튼을 누르면 전자결재 탭으로 이동하고 등록 모드 활성화
  currentTabIndex.value = 1; // 전자결재 탭 선택
  activeTab.value = "전자결재"; // Info 컴포넌트의 탭을 전자결재로 변경
  isRegistrationMode.value = true; // 등록 모드 활성화
};

const handleToggleRegistrationMode = (value) => {
  // 파라미터가 있으면 해당 값으로, 없으면 토글
  isRegistrationMode.value =
    value !== undefined ? value : !isRegistrationMode.value;
};

// 템플릿 삭제 처리
const handleTemplateDeleted = () => {
  selectedTemplate.value = null;
  // 사이드바 새로고침
  if (templateSidebarRef.value) {
    templateSidebarRef.value.refreshTemplates();
  }
};

// 템플릿 수정 처리
const handleTemplateUpdated = () => {
  // 사이드바 새로고침
  if (templateSidebarRef.value) {
    templateSidebarRef.value.refreshTemplates();
  }
};

// 순서 변경 모드 처리
const handleReorderModeChanged = (mode) => {
  isReorderMode.value = mode;
  if (!mode) {
    // 순서 변경 모드 종료 시 변경 정보 초기화
    reorderChanges.value = [];
  }
};

// 순서 변경 정보 저장
const handleReorderChange = (changeInfo) => {
  reorderChanges.value.push(changeInfo);
  console.log('순서 변경 정보 저장:', changeInfo);
};

// 순서 변경 완료 처리
const handleReorderComplete = async () => {
  if (reorderChanges.value.length === 0) {
    console.log('변경된 순서가 없습니다.');
    return;
  }

  try {
    // 모든 순서 변경을 API로 전송
    for (const change of reorderChanges.value) {
      await api.patch(`/api/hq/approvals/templates/${change.templateId}/seq/${change.newIndex + 1}`);
      console.log(`템플릿 ${change.templateId} 순서를 ${change.newIndex + 1}로 변경`);
    }
    
    console.log('모든 순서 변경 완료');
    
    // 사이드바 새로고침
    if (templateSidebarRef.value) {
      await templateSidebarRef.value.completeReorder();
    }
    
    // 변경 정보 초기화
    reorderChanges.value = [];
    
  } catch (error) {
    console.error('순서 변경 실패:', error);
    alert('순서 변경에 실패했습니다.');
    
    // 실패 시 사이드바 롤백
    if (templateSidebarRef.value) {
      templateSidebarRef.value.cancelReorder();
    }
  }
};

// 순서 변경 취소 처리
const handleReorderCancel = () => {
  reorderChanges.value = [];
  if (templateSidebarRef.value) {
    templateSidebarRef.value.cancelReorder();
  }
  console.log('순서 변경 취소됨');
};

const approvalCounts = ref({
  전체: 0,
  임시저장: 0,
  결재중: 0,
  결재완료: 0,
  결재반려: 0,
});

const fetchCounts = async () => {
  const endpoints = {
    전체: "/api/hq/approvals/list/submitted/all",
    임시저장: "/api/hq/approvals/list/submitted/draft",
    결재중: "/api/hq/approvals/list/submitted/in-progress",
    결재완료: "/api/hq/approvals/list/submitted/approved",
    결재반려: "/api/hq/approvals/list/submitted/rejected",
  };
  for (const key in endpoints) {
    try {
      const { data } = await api.get(endpoints[key]);
      approvalCounts.value[key] = data.length;
    } catch {
      approvalCounts.value[key] = 0;
    }
  }
};

onMounted(fetchCounts);

watch(
  [activeMenu, activeTab],
  async ([menu, tab]) => {
    const activeTab = tab || menu;
    let url = "";
    console.log(activeTab);
    if (activeTab === "임시저장") {
      url = "/api/hq/approvals/list/submitted/draft";
    } else if (activeTab === "전체") {
      url = "/api/hq/approvals/list/submitted/all";
    } else if (activeTab === "결재중") {
      url = "/api/hq/approvals/list/submitted/in-progress";
    } else if (activeTab === "결재완료") {
      url = "/api/hq/approvals/list/submitted/approved";
    } else if (activeTab === "결재반려") {
      url = "/api/hq/approvals/list/submitted/rejected";
    }

    if (url) {
      try {
        const { data } = await api.get(url);
        approvalList.value = data;
      } catch (error) {
        console.error("결재 목록 조회 실패:", error);
        approvalList.value = [];
      }
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}
</style>