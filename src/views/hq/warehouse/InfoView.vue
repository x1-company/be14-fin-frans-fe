<template>
  <div class="app">
    <NavBar />
    <div class="main-container">
      <SideBar @select-warehouse="handleWarehouseSelect" />
      <Info :warehouse="selectedWarehouse" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import NavBar from "@/components/hq/common/NavBar.vue";
import SideBar from "@/components/hq/warehouse/SideBar.vue";
import Info from "@/components/hq/warehouse/Info.vue";

const selectedWarehouse = ref(null);

const handleWarehouseSelect = (warehouse) => {
  selectedWarehouse.value = warehouse;
  console.log("선택된 창고:", warehouse);
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