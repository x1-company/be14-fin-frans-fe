<template>
  <div class="info-container">
    <div class="breadcrumb-container">
      <Breadcrumb :items="breadcrumbItems" />
    </div>
    <div class="info-content">
      <div class="header-banner">
        <div class="info-group">
          <InfoHeader
            title="창고 대시보드"
            desc="창고 관리를 위한 편리한 대시보드를 제공합니다."
            :tabs="['대시보드', '자재관리', '재고관리', '입출고현황']"
            :activeTab="activeTab"
            @change-tab="activeTab = $event"
          />
          <InfoForm v-if="activeTab === 0" :warehouseId="selectedWarehouseId" />
          <!-- 추후 다른 탭도 확장 가능 -->
        </div>
      </div>
      <!-- 본문 시작: 필요시 추가 -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import Breadcrumb from "@/components/hq/common/Breadcrumb.vue";
import InfoHeader from "./InfoHeader.vue";
import InfoForm from "./InfoForm.vue";

const props = defineProps({
  warehouse: Object,
});

const warehouseDetail = ref(null);
const breadcrumbItems = ref(["HOME", "창고관리", "대시보드"]);
const activeTab = ref(0);
const selectedWarehouseId = computed(() => props.warehouse?.id);

const updateBreadcrumb = (newItems) => {
  breadcrumbItems.value = newItems;
};

onMounted(async () => {
  // 추후 warehouse 상세 API 연동 시 사용
  // if (!props.warehouse?.id) return;
  // const { data } = await api.get(`/api/hq/warehouses/detail/${props.warehouse.id}`);
  // warehouseDetail.value = data;
});
</script>

<style scoped>
.info-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8f9fa;
}
.breadcrumb-container {
  padding: 16px 24px 0 24px;
}
.info-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 0 24px 0;
}
.header-banner {
  color: white;
  padding: 32px 24px 0 24px;
}
.info-group {
  background: transparent;
}
</style> 