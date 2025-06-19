<template>
  <div class="app">
    <NavBar />
    <div class="main-container">
      <SideBar />
      <div v-if="order">
        <OrderActionButtons :orderId="order.id" :rejectedReason="order.rejectedReason" />
        <OrderProgressBar :status="order.status" />
        <div class="detail-wrapper">
          <FranchiseInfoCard :order="order" />
          <OrderInfoCard :order="order" />
          <ProductTable :products="order.products" :totalAmount="order.totalAmount" />
          <DeliveryInfoCard :order="order" />
          <OutboundInfoCard :order="order" />
          <PaymentInfoCard :order="order" />
        </div>
      </div>
      <div v-else>로딩중...</div>
    </div>
  </div>
</template>

  
  <script setup>
  import api from '@/lib/api'
  import { ref, onMounted } from 'vue';
  import NavBar from '@/components/hq/common/NavBar.vue';
  import SideBar from '@/components/hq/orders/OrderSideBar.vue';
  import OrderProgressBar from '@/components/hq/orders/detail/OrderProgressBar.vue';
  import FranchiseInfoCard from '@/components/hq/orders/detail/FranchiseInfoCard.vue';
  import OrderInfoCard from '@/components/hq/orders/detail/OrderInfoCard.vue';
  import ProductTable from '@/components/hq/orders/detail/ProductTable.vue';
  import DeliveryInfoCard from '@/components/hq/orders/detail/DeliveryInfoCard.vue';
  import OutboundInfoCard from '@/components/hq/orders/detail/OutboundInfoCard.vue';
  import PaymentInfoCard from '@/components/hq/orders/detail/PaymentInfoCard.vue';
  import OrderActionButtons from '@/components/hq/orders/detail/OrderActionButtons.vue';
  
  const props = defineProps({
    orderId: {
      type: [String, Number],
      required: true
    }
  });
  
  const order = ref(null);
  
  onMounted(async () => {
    const res = await api.get(`api/hq/orders/${props.orderId}`);
    order.value = res.data ? res.data : res;
});
  </script>
  
  <style scoped>
  .main-container {
    flex: 1;
    display: flex;
    background: #f8f9fa;
    overflow: auto;
  }
  
  .detail-wrapper {
    display: flex;
    flex-direction: column;
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
  </style>