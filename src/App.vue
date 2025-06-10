<script setup>
import { ref } from "vue";
import NavBar from "./components/NavBar.vue";
import SideBar from "./components/supplier/SideBar.vue";
import Breadcrumb from "./components/Breadcrumb.vue";
import InfoHeader from "./components/supplier/InfoHeader.vue";
import InfoForm from "./components/supplier/InfoForm.vue";

const selectedSupplierId = ref(null);
const breadcrumbItems = ref(["HOME", "공급처관리", "공급처정보"]);

// SideBar에서 공급처 선택 시 호출될 함수
// InfoForm이 직접 데이터를 가져오므로, 여기서는 id만 받아 InfoForm으로 전달
function handleSelectSupplier(id) {
  selectedSupplierId.value = id;
  console.log("App.vue에서 선택된 공급처 ID:", id);
}

// NavBar 또는 InfoHeader에서 전달된 브레드크럼 경로를 업데이트하는 함수
function updateBreadcrumb(newItems) {
  breadcrumbItems.value = newItems;
}
</script>

<template>
  <NavBar @update-breadcrumb="updateBreadcrumb" />
  <div class="layout">
    <main>
      <SideBar @selectSupplier="handleSelectSupplier" />
      <div class="main-content">
        <div class="breadcrumb-container">
          <Breadcrumb :items="breadcrumbItems" />
        </div>
        <div class="info-group">
          <InfoHeader
            title="공급처 정보"
            desc="공급처의 기본 정보와 계약 현황을 확인하고 관리할 수 있습니다."
            :tabs="['공급처 정보', '납품관리', '발주관리']"
            :activeTab="0"
            @update-breadcrumb="updateBreadcrumb"
          />
          <!-- InfoForm에 supplierId만 넘겨주면 됨 -->
          <InfoForm :supplierId="selectedSupplierId" />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: row;
  /* height: calc(100vh - 48px); NavBar 높이만큼 빼줌 */
  height: 100%;
}
main {
  display: flex;
  flex-direction: row;
  flex: 1;
  padding-top: 0; /* padding-top 제거 */
  background: #fafbff;
  height: 100%;
}
.breadcrumb-container {
  padding-top: 16px; /* main의 padding-top을 여기로 이동 */
  flex: 1;
  max-width: 300px;
}
.info-group {
  width: 1100px;
  max-width: 100%;
  margin: 16px auto 0 auto; /* breadcrumb-container와의 간격 유지 */
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 2;
}

.main-content {
  display: flex;
  flex-direction: column; /* breadcrumb-container, info-group을 상하로 */
  width: 1100px;
  max-width: 100%;
  margin: 0 auto;
  padding-top: 16px;
  gap: 16px; /* 상하 간격 */
  height: 100%;
}
</style>

