<template>
  <div class="info-container">
    <div class="breadcrumb-container">
      <Breadcrumb :items="breadcrumbItems" />
    </div>
    <div class="info-content">
      <div class="header-banner">
        <div class="info-group">
          <InfoHeader
            :title="headerTitle"
            :desc="headerDesc"
            :tabs="['대시보드', '자재관리', '재고관리', '입출고현황']"
            :activeTab="currentTab"
            @change-tab="handleTabChange"
          />
          <!-- URL 파라미터(id) 유무에 따라 상세 컴포넌트 또는 목록/대시보드 표시 -->
          <ProductDetail v-if="productId" :productId="productId" />
          <template v-else>
            <InfoForm v-if="activeTab === 0" :warehouseId="selectedWarehouseId" />
            <ProductListTable v-if="activeTab === 1" />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Breadcrumb from '@/components/hq/common/Breadcrumb.vue';
import InfoHeader from './InfoHeader.vue';
import InfoForm from './InfoForm.vue';
import ProductListTable from './ProductListTable.vue';
import ProductDetail from './ProductDetail.vue';

const props = defineProps({
  warehouse: Object,
});

const emit = defineEmits(['tab-changed']);
const route = useRoute();
const router = useRouter();

const activeTab = ref(route.query.tab ? parseInt(route.query.tab, 10) : 0);

// URL의 id 파라미터를 computed로 관리
const productId = computed(() => route.params.id || null);

// 헤더 제목/설명/활성탭을 URL 상태에 따라 동적으로 변경
const headerTitle = computed(() => {
  if (productId.value) return '자재 상세';
  return ['창고 대시보드', '자재 목록', '재고 목록', '입출고 현황'][activeTab.value];
});

const headerDesc = computed(() => {
  if (productId.value) return '자재에 대한 상세 정보를 확인할 수 있습니다.';
  return [
    '창고 관리를 위한 편리한 대시보드를 제공합니다.',
    '자재 목록을 조회하고 관리할 수 있습니다.',
    '재고 현황을 확인할 수 있습니다.',
    '입출고 내역을 확인할 수 있습니다.',
  ][activeTab.value];
});

const currentTab = computed(() => {
  if (productId.value) return 1; // 상세 페이지에서는 '자재관리' 탭 활성화
  return activeTab.value;
});

// 빵조각(Breadcrumb) 경로를 URL 상태에 따라 동적으로 변경
const breadcrumbItems = computed(() => {
  if (productId.value) {
    return ['HOME', '창고관리', '자재관리', '자재상세'];
  }
  const tabBreadcrumbs = [
    ['HOME', '창고관리', '대시보드'],
    ['HOME', '창고관리', '자재관리'],
    ['HOME', '창고관리', '재고관리'],
    ['HOME', '창고관리', '입출고현황'],
  ];
  return tabBreadcrumbs[activeTab.value];
});

// 탭 클릭 핸들러
const handleTabChange = tabIndex => {
  // 상세 페이지에서 탭을 누르면 목록으로 이동
  if (productId.value) {
    router.push({ path: '/warehouse', query: { tab: tabIndex } });
  } else {
    activeTab.value = tabIndex;
  }
};

watch(activeTab, newTab => {
  emit('tab-changed', newTab);
}, { immediate: true }); // 즉시 실행하여 초기 탭 정보 전달

const selectedWarehouseId = computed(() => props.warehouse?.id);
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