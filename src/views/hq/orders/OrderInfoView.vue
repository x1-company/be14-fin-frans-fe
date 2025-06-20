<template>
    <div class="app">
      <NavBar />
      <div class="main-container">

        <SideBar @select-franchise="handleSelectFranchise" />
        <OrderInfo :orders="orders" />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import NavBar from '@/components/hq/common/NavBar.vue';
  import SideBar from '@/components/hq/orders/OrderSideBar.vue';
  import OrderInfo from '@/components/hq/orders/Info.vue';
  import api from '@/lib/api';

  const orders = ref([]);
  const selectedFranchiseId = ref(null);

  async function fetchOrders(franchiseId = null, page = 1, size = 10) {
    const params = { page, size };
    if (franchiseId) params.franchiseId = franchiseId;
    const { data } = await api.get('/api/hq/orders', { params });
    orders.value = data.content;
  }

  function handleSelectFranchise(franchiseId) {
    if (selectedFranchiseId.value === franchiseId) {
      selectedFranchiseId.value = null;
      fetchOrders();
    } else {
      selectedFranchiseId.value = franchiseId;
      fetchOrders(franchiseId);
    }
  }

  // 최초 전체 주문 목록 불러오기
  fetchOrders();
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