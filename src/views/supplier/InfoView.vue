<template>
  <div class="app">
    <NavBar />
    <div class="main-container">
      <!-- ✅ 이벤트 수신 연결 -->
      <SideBar @select-company="handleCompanySelect" />
      <!-- ✅ company 전달 -->
      <Info :company="selectedCompany" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import NavBar from "@/components/NavBar.vue";
import SideBar from "@/components/supplier/SideBar.vue";
import Info from "@/components/supplier/Info.vue";

// ✅ 선택된 회사 상태 추가
const selectedCompany = ref(null);

// ✅ SideBar에서 emit할 때 처리할 함수
const handleCompanySelect = (company) => {
  selectedCompany.value = company;
  console.log("선택된 회사:", company); // 디버깅용
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
