<template>
    <div class="app">
      <NavBar />
      <div class="main-container">
        <SideBar />
        <div v-if="order">
          <FrOrderActionButtons
            v-if="order && props.orderId"
            :orderId="props.orderId"
            :rejectedReason="order.rejectedReason"
            :status="order.status"
            :delivery-info="{
              deliveryCompany: order.deliveryCompany,
              name: order.driverName,
              phone: order.driverPhone,
              trackingNumber: order.trackingNumber
            }"
            @refreshOrder="fetchOrder"
          />
          <div class="progress-bar-wrapper">
            <OrderProgressBar :status="order.status" />
          </div>
          <div class="detail-wrapper">
            <FranchiseInfoCard :order="order" />
            <OrderInfoCard :order="order" />
            <ProductTable :products="order.products" :totalAmount="order.totalAmount" />
            <DeliveryInfoCard :order="order" />
          </div>
        </div>
        <!-- 로딩 상태 -->
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>로딩 중</p>
      </div>
      </div>
    </div>
  </template>
  
    
    <script setup>
    import api from '@/lib/api'
    import { ref, onMounted } from 'vue';
    import NavBar from '@/components/hq/common/NavBar.vue';
    import SideBar from '@/components/franchise/common/FrSideBar.vue';
    import FrOrderActionButtons from '@/components/franchise/order/button/FrOrderActionButtons.vue';
    import OrderProgressBar from '@/components/hq/orders/detail/OrderProgressBar.vue';
    import FranchiseInfoCard from '@/components/hq/orders/detail/FranchiseInfoCard.vue';
    import OrderInfoCard from '@/components/hq/orders/detail/OrderInfoCard.vue';
    import ProductTable from '@/components/hq/orders/detail/ProductTable.vue';
    import DeliveryInfoCard from '@/components/hq/orders/detail/DeliveryInfoCard.vue';
    
    const props = defineProps({
      orderId: {
        type: [String, Number],
        required: true
      }
    });
    
    const order = ref(null);
    const loading = ref(false);
  
    async function fetchOrder() {
      loading.value = true;
      try {
        const res = await api.get(`api/franchise/orders/${props.orderId}`);
        order.value = res.data ? res.data : res;
      } catch (error) {
        console.error('주문 상세 조회 실패:', error);
      } finally {
        loading.value = false;
      }
    }
  
    onMounted(fetchOrder);
    </script>
    
    <style scoped>
    .main-container {
      flex: 1;
      display: flex;
      background: #f8f9fa;
      overflow: auto;
      max-width: 1800px;
      width: 100%;
      margin: 0 auto;
    }
    
    .detail-wrapper {
      display: flex;
      flex-direction: column;
      width: 1200px;
      max-width: 1800px;
      margin: 0 0 0 70px;
      /* padding: 0 50px; */
    }
  
    .row {
      display: flex;
      gap: 24px;
      margin: 24px 0;
    }
  
    .app {
      height: 100vh;
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
  
    .spinner {
      margin: 20px auto;
      border: 4px solid #eee;
      border-top: 4px solid #4169e1;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      animation: spin 0.8s linear infinite;
    }
  
    .progress-bar-wrapper {
      margin-left: 100px;
      width: 1200px;
      max-width: 1800px;
    }
    </style>