<template>
  <div class="app">
    <NavBar />
    <div class="main-container">
      <PurchaseOrderInfo />
    </div>
  </div>
</template>

<script setup>
import NavBar from '@/components/hq/common/NavBar.vue';
import PurchaseOrderInfo from '@/components/hq/purchaseorder/Info.vue';
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