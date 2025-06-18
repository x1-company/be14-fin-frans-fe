<template>
  <div class="app">
    <NavBar />
    <div class="main-container">
      <!-- ✅ 이벤트 수신 연결 -->
      <SideBar
        :activeTab="activeTab"
        :counts="approvalCounts"
        @select-menu="handleSelectMenu"
        @tab-change="handleTabChange"
      />
      <!-- ✅ company 전달 -->
      <Info
        :approvalList="approvalList"
        :activeTab="activeTab"
        @tab-change="handleTabChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import NavBar from "@/components/hq/common/NavBar.vue";
import SideBar from "@/components/hq/approval/SideBar.vue";
import Info from "@/components/hq/approval/Info.vue";
import api from "@/lib/api";

const approvalList = ref([]);

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
