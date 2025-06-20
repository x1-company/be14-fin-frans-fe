<script setup>
import InfoHeader from './InfoHeader.vue';
import InfoForm from './list/InfoForm.vue';
import Breadcrumb from "@/components/hq/common/Breadcrumb.vue";
import { ref } from 'vue';

const props = defineProps({
  orders: Array,
});

const breadcrumbItems = ref(["HOME", "가맹점관리", "주문관리"]);
const updateBreadcrumb = (newItems) => {
  breadcrumbItems.value = newItems;
};
const tabs = [
  '대시보드',
  '가맹점 정보',
  '주문관리',
  '반품관리',
  '매출관리',
  '재고관리',
];
const activeTab = 2; // 주문관리
</script>

<template>
  <div class="info-container">
    <div class="breadcrumb-container">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <!-- Scrollable Content -->
    <div class="order-info-wrapper">
      <InfoHeader
        title="주문 관리"
        desc="가맹점 별 주문 현황을 확인할 수 있습니다."
        :tabs="tabs"
        :activeTab="activeTab"
        @update-breadcrumb="updateBreadcrumb"
      />
      <InfoForm :orders="orders" />
    </div>
  </div>
</template>

<style scoped>
.info-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8f9fa;
}

.order-info-wrapper {
  width: 100%;
  max-width: 1250px;
  margin: 0px auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px 0 rgba(64, 102, 250, 0.06);
  padding: 0 0 32px 0;
}

.breadcrumb {
  padding: 20px 0 30px 100px;
  font-size: 14px;
  color: #6c757d;
}

</style> 