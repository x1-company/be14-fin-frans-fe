<template>
  <div class="app">
    <NavBar />
    <div class="main-container">
      <SideBar />
      <div v-if="!selectedReturnId">
        <ReturnList @selectReturn="handleSelectReturn" />
      </div>
      <div v-else>
        <ReturnDetailPage :returnId="selectedReturnId" @close="selectedReturnId = null" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import NavBar from '@/components/hq/common/NavBar.vue';
import SideBar from '@/components/hq/orders/OrderSideBar.vue';
import ReturnList from '@/components/hq/return/list/ReturnList.vue';

const selectedReturnId = ref(null);

function handleSelectReturn(returnId) {
  selectedReturnId.value = returnId;
}
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
    background: #f8f9fa;
    overflow: auto;
  }
  </style> 