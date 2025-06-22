<template>
  <div class="app">
    <NavBar />
    <div class="main-container">
      <SideBar v-if="activeTab === 0" @select-warehouse="handleWarehouseSelect" />
      <Info :warehouse="selectedWarehouse" @tab-changed="updateActiveTab" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import NavBar from "@/components/hq/common/NavBar.vue";
import SideBar from "@/components/hq/warehouse/SideBar.vue";
import Info from "@/components/hq/warehouse/Info.vue";

const selectedWarehouse = ref({ id: 1, name: '기본 창고' }); // 기본값 설정
const activeTab = ref(0);

const handleWarehouseSelect = (warehouse) => {
  selectedWarehouse.value = warehouse;
};

const updateActiveTab = (tabIndex) => {
  activeTab.value = tabIndex;
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