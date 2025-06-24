<template>
    <div v-if="returnDetail">
      <ReturnActionButtons
        v-if="returnDetail && props.returnId"
        :returnId="props.returnId"
        :rejectedReason="returnDetail.rejectedReason"
        :status="returnDetail.status"
        :delivery-info="{
          deliveryCompany: returnDetail.deliveryCompany,
          name: returnDetail.driverName,
          phone: returnDetail.driverPhone,
          trackingNumber: returnDetail.trackingNumber
        }"
        @refreshOrder="fetchReturnDetail"
        @close="handleClose"
      />
      <div class="progress-bar-wrapper">
        <ReturnProgressBar :status="returnDetail.status" />
      </div>
      <div class="detail-wrapper">
        <FranchiseInfoCard :returnData="returnDetail" />
        <ReturnInfoCard :returnData="returnDetail" />
        <ProductTable
          :returnProducts="returnDetail.returnProducts"
          :totalAmount="returnDetail.totalAmount"
        />
        <DeliveryInfoCard :returnData="returnDetail" />
        <ApprovalInfoCard :returnData="returnDetail" />
      </div>
    </div>
    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>로딩 중</p>
    </div>
  </template>
  
  <script setup>
  import api from '@/lib/api'
  import { ref, onMounted } from 'vue';
  import ReturnProgressBar from '@/components/hq/return/detail/ReturnProgressBar.vue';
  import FranchiseInfoCard from '@/components/hq/return/detail/FranchiseInfoCard.vue';
  import ReturnInfoCard from '@/components/hq/return/detail/ReturnInfoCard.vue';
  import ProductTable from '@/components/hq/return/detail/ProductTable.vue';
  import DeliveryInfoCard from '@/components/hq/return/detail/DeliveryInfoCard.vue';
  import ApprovalInfoCard from '@/components/hq/return/detail/ApprovalInfoCard.vue';
  import ReturnActionButtons from '@/components/hq/return/detail/ReturnActionButtons.vue';
  
  const props = defineProps({
    returnId: {
      type: [String, Number],
      required: true
    }
  });
  
  const emit = defineEmits(['close']);
  
  const returnDetail = ref(null);
  const loading = ref(false);
  
  async function fetchReturnDetail() {
    loading.value = true;
    try {
      const res = await api.get(`/api/hq/franchise/return/${props.returnId}`);
      returnDetail.value = res.data ? res.data : res;
      console.log('📦 returnProducts:', returnDetail.value.returnProducts);
      
    } catch (e) {
      returnDetail.value = null;
    } finally {
      loading.value = false;
    }
  }
  
  function handleClose() {
    emit('close');
  }
  
  onMounted(fetchReturnDetail);
  </script>
  
  <style scoped>
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