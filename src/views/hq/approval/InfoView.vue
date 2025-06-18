<template>
  <div class="app">
    <NavBar />
    <div class="main-container">
      <!-- ✅ 이벤트 수신 연결 -->
      
      <!-- 대시보드 탭 -->
      <div v-if="activeTab === 0">
        대시보드
      </div>
      
      <!-- 전자결재 탭 -->
      <SideBar
        :activeTab="activeTab"
        :counts="approvalCounts"
        @select-menu="handleSelectMenu"
        @tab-change="handleTabChange"
        v-if="activeTab === 1"
      />
      
      
      <!-- 결재템플릿 탭 -->
      <TemplateSideBar 
        v-if="activeTab === 2" 
        ref="templateSidebarRef"
        :selectedTemplate="selectedTemplate"
        @select-template="handleTemplateSelect" 
      />
      
      <!-- Info 컴포넌트에 selectedTemplate 전달 -->
      <Info
        :approvalList="approvalList"
        :activeTab="activeTab"
        :selectedTemplate="selectedTemplate"
        @tab-change="handleTabChange"
        @update:activeTab="handleTabChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import NavBar from "@/components/hq/common/NavBar.vue";
import SideBar from "@/components/hq/approval/SideBar.vue";
import Info from "@/components/hq/approval/Info.vue";
import api from "@/lib/api";
import TemplateSideBar from "@/components/hq/approval/TemplateSideBar.vue";

const approvalList = ref([]);
const activeTab = ref(0); // 기본값 0 (대시보드 탭)

// 선택된 템플릿 상태 추가
const selectedTemplate = ref(null);

// 템플릿 사이드바 참조
const templateSidebarRef = ref(null);

// 탭 변경 처리 함수
const handleTabChange = async (val) => {
  const prevTab = activeTab.value;
  activeTab.value = val;
  
  // 템플릿 탭으로 변경된 경우 템플릿 목록 새로고침
  if (val === 2) {
    await nextTick();
    if (templateSidebarRef.value) {
      templateSidebarRef.value.refreshTemplates();
    }
  }
};

// SideBar에서 emit할 때 처리할 함수
const handleApprovalSelect = (approval) => {
  activeMenu.value = approval;
  console.log("선택된 결재목록:", approval);
};

// TemplateSideBar에서 템플릿 선택 시 처리할 함수
const handleTemplateSelect = (template) => {
  selectedTemplate.value = template;
  console.log("선택된 템플릿:", template);
};

const activeMenu = ref("전체");
const activeTab = ref("전체");

const handleSelectMenu = (menuValue) => {
  activeMenu.value = menuValue;
  activeTab.value = menuValue;
};

const handleTabChange = (tabValue) => {
  activeTab.value = tabValue;
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