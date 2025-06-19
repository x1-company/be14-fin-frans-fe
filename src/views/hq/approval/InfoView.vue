<template>
  <div class="app">
    <NavBar />
    <div class="main-container">
      <!-- ✅ 이벤트 수신 연결 -->

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
        @select-template="handleTemplateSelect"
      />

      <!-- Info 컴포넌트에 selectedTemplate 전달 -->
      <Info
        :approvalList="approvalList"
        :activeTab="activeTab.toString()"
        :isRegistrationMode="isRegistrationMode"
        @tab-change="handleTabChange"
        @update:activeTab="handleTabChange"
        @active-tab-change="handleActiveTabChange"
        @toggle-registration-mode="handleToggleRegistrationMode"
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
