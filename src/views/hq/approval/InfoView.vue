<template>
  <div class="app">
    <NavBar />
    <div class="main-container">
      <!-- 대시보드 탭 -->
      <div v-if="activeTab === 0">
        대시보드
      </div>
      
      <!-- 전자결재 탭 -->
      <SideBar v-if="activeTab === 1" @select-menu="handleApprovalSelect" />
      
      <!-- 결재템플릿 탭 -->
      <TemplateSideBar v-if="activeTab === 2" @select-template="handleTemplateSelect" />
      
      <!-- Info 컴포넌트에 selectedTemplate 전달 -->
      <Info
        :approvalList="approvalList"
        :activeTab="activeTab"
        :selectedTemplate="selectedTemplate"
        @update:activeTab="(val) => (activeTab = val)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import NavBar from "@/components/hq/common/NavBar.vue";
import SideBar from "@/components/hq/approval/SideBar.vue";
import Info from "@/components/hq/approval/Info.vue";
import api from "@/lib/api";
import TemplateSideBar from "@/components/hq/approval/TemplateSideBar.vue";

const authStore = useAuthStore();
const activeMenu = ref("전체");
const approvalList = ref([]);
const activeTab = ref(0); // 기본값 0 (대시보드 탭)

// 선택된 템플릿 상태 추가
const selectedTemplate = ref(null);

watch(
  activeMenu,
  async (menu) => {
    let url = "";
    console.log("현재 accessToken:", authStore.accessToken);

    if (menu === "임시저장") {
      url = "/api/hq/approvals/list/submitted/draft";
    } else if (menu === "전체") {
      url = "/api/hq/approvals/list/submitted/all";
    } else if (menu === "결재중") {
      url = "/api/hq/approvals/list/submitted/in-progress";
    } else if (menu === "결재완료") {
      url = "/api/hq/approvals/list/submitted/approved";
    } else if (menu === "결재반려") {
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