<template>
  <component :is="currentPage" />
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import SupplierPage from '@/views/auth/supplier/SupplierPage.vue';
import HqDeliveryInfoPage from '@/views/hq/delivery/HqDeliveryInfoPage.vue';

const authStore = useAuthStore();

// 로그인한 사용자가 본사 직원이면 HqDeliveryInfoPage, 공급처 직원이면 SupplierPage를 보여줌
const currentPage = computed(() => {
  // authStore에 supplierId가 있으면 공급처, 없으면 본사 직원으로 판단
  if (authStore.supplierId) {
    return SupplierPage;
  } else {
    return HqDeliveryInfoPage;
  }
});
</script> 