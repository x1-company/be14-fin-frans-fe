<template>
  <div class="info-container">
    <div class="breadcrumb-container">
      <Breadcrumb :items="breadcrumbItems" />
    </div>
    <div class="info-content-wrapper">
      <div class="info-wrapper">
        <InfoHeader
          :title="title"
          :desc="desc"
          :tabs="tabs"
          :activeTab="activeTabSwitch"
          @select-tab="updateTab"
          @update-breadcrumb="updateBreadcrumb"
        />
        <div class="toolbar">
          <SupplierSelector @supplier-selected="handleSupplierSelection" />
        </div>
        <div class="tab-content">
          <HqRequestedOrderList v-if="activeTabSwitch === 0" :supplierId="selectedSupplierId" />
          <HqCompletedOrderList v-if="activeTabSwitch === 1" :supplierId="selectedSupplierId" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Breadcrumb from "@/components/hq/common/Breadcrumb.vue";
import InfoHeader from '@/components/hq/delivery/common/InfoHeader.vue';
import SupplierSelector from '@/components/hq/delivery/common/SupplierSelector.vue';
import HqRequestedOrderList from '@/components/hq/delivery/HqRequestedOrderList.vue';
import HqCompletedOrderList from '@/components/hq/delivery/HqCompletedOrderList.vue';

const breadcrumbItems = ref(["HOME", "납품관리", "납품작성"]);
const selectedSupplierId = ref(null);

const handleSupplierSelection = (supplierId) => {
  selectedSupplierId.value = supplierId;
};

const updateBreadcrumb = (newItems) => {
  breadcrumbItems.value = newItems;
};

const tabs = ['납품작성', '납품목록'];

const tabInfo = ref([
  { title: "납품작성", desc: "납품 정보를 등록할 수 있습니다." },
  { title: "납품목록", desc: "납품 완료된 목록을 볼 수 있습니다." },
]);

const activeTabSwitch = ref(0);

const title = computed(() => tabInfo.value[activeTabSwitch.value]?.title || '납품작성');
const desc = computed(() => tabInfo.value[activeTabSwitch.value]?.desc || '납품 정보를 등록할 수 있습니다.');

const updateTab = (index) => {
  activeTabSwitch.value = index;
};
</script>

<style scoped>
.info-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.breadcrumb-container {
  padding: 16px 24px;
  background-color: #f8f9fa;
}
.info-content-wrapper {
  flex-grow: 1;
  padding: 24px;
  overflow-y: auto;
}
.info-wrapper {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.toolbar {
  padding: 16px 24px;
  border-bottom: 1px solid #e9ecef;
}
.tab-content {
  padding: 24px;
}
</style> 