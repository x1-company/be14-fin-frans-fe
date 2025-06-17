<template>
  <div class="app">
    <NavBar />
    <div class="main-container">
      <!-- ✅ 이벤트 수신 연결 -->
      <SideBar @select-approval="handleApprovalSelect" />
      <!-- <InfoHeader @select-approval="handleApprovalInfoSelect" /> -->
      <!-- ✅ company 전달 -->
      <Info :approvalList="approvalList" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import NavBar from "@/components/hq/common/NavBar.vue";
import SideBar from "@/components/hq/approval/SideBar.vue";
import Info from "@/components/hq/approval/Info.vue"; // 미구현 컴포넌트 임시 추가
import { watch } from "vue";
import api from "@/lib/api";

const authStore = useAuthStore();
const activeMenu = ref("전체");
const approvalList = ref([]);

watch(
  activeMenu,
  async (menu) => {
    let url = "";
    console.log("현재 accessToken:", authStore.accessToken);

    if (menu === "임시저장") {
      url = "/api/hq/approvals/list/submitted/draft";
    } else if (menu === "전체") {
      url = "/api/hq/approvals/list/submitted/all";
    }
    // ...다른 메뉴도 추가
    if (url) {
      const { data } = await api.get(url);
      approvalList.value = data;
    }
  },
  { immediate: true }
);

// ✅ 선택된 결재목록 상태 추가
const selectedApproval = ref(["임시저장", "결재중", "결재완료", "결재반려"]);

// ✅ SideBar에서 emit할 때 처리할 함수
const handleApprovalSelect = (approval) => {
  selectedApproval.value = approval;
  console.log("선택된 결재목록:", approval); // 디버깅용
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
