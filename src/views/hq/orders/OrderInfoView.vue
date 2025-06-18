<template>
    <div class="app">
      <NavBar />
      <div class="main-container">

        <SideBar />
        <OrderInfo />
      </div>
    </div>
  </template>
  
  <script setup>
  import NavBar from '@/components/hq/common/NavBar.vue';
  import SideBar from '@/components/hq/orders/SideBar.vue';
  import OrderInfo from '@/components/hq/orders/Info.vue';
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