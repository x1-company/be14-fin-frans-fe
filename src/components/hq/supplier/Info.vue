<script setup>
import { ref, computed, watch } from "vue";
import api from "@/lib/api";

import Breadcrumb from "@/components/hq/common/Breadcrumb.vue";
import InfoHeader from "@/components/hq/supplier/InfoHeader.vue";
import InfoForm from "@/components/hq/supplier/InfoForm.vue";
import PurchaseOrderInfo from "@/components/hq/purchaseorder/Info.vue";
import PurchaseOrderRegister from "@/components/hq/purchaseorder/PurchaseOrderRegister.vue";

const props = defineProps({
  company: Object,
});

const supplier = ref(null);
const breadcrumbItems = ref(["HOME", "공급처관리", "공급처정보"]);

const tabs = [
  {
    key: "supplier-info",
    label: "공급처 정보",
    desc: "공급처의 기본 정보와 계약 현황을 확인하고 관리할 수 있습니다.",
  },
  {
    key: "delivery-info",
    label: "납품관리",
    desc: "해당 공급처의 납품 현황을 관리합니다.",
  },
  {
    key: "purchase-order",
    label: "발주관리",
    desc: "해당 공급처의 발주 현황을 확인하고 관리할 수 있습니다.",
  },
];

const activeTab = ref("supplier-info");
const purchaseOrderViewMode = ref("list"); // 'list' or 'register'

const pageTitle = computed(() => {
  if (activeTab.value === "purchase-order") {
    return purchaseOrderViewMode.value === "list" ? "발주관리" : "발주등록";
  }
  const currentTab = tabs.find((t) => t.key === activeTab.value);
  return currentTab ? currentTab.label : "공급처 정보";
});

const pageDesc = computed(() => {
  const currentTab = tabs.find((t) => t.key === activeTab.value);
  return currentTab ? currentTab.desc : "";
});

const selectedSupplierId = computed(() => props.company?.id);

watch(
  () => props.company,
  async (newCompany) => {
    if (newCompany && newCompany.id) {
      try {
        const { data } = await api.get(
          `/api/hq/suppliers/detail/${newCompany.id}`
        );
        supplier.value = data;
      } catch (e) {
        console.error("Failed to fetch supplier details:", e);
        supplier.value = null;
      }
    } else {
      supplier.value = null;
    }
    // When company changes, reset to supplier info tab
    activeTab.value = "supplier-info";
    purchaseOrderViewMode.value = "list";
  },
  { immediate: true }
);

function handleTabChange(tabKey) {
  activeTab.value = tabKey;
  purchaseOrderViewMode.value = "list"; // Reset to list view when changing tabs
}

const updateBreadcrumb = (newItems) => {
  breadcrumbItems.value = newItems;
};
</script>

<template>
  <div class="info-container">
    <div class="breadcrumb-container">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <div class="info-content">
      <div class="info-group">
        <InfoHeader
          :title="pageTitle"
          :desc="pageDesc"
          :tabs="tabs"
          :active-tab="activeTab"
          @tab-change="handleTabChange"
          @update-breadcrumb="updateBreadcrumb"
        />
        <div class="content-area">
          <div v-if="activeTab === 'supplier-info'">
            <InfoForm
              v-if="selectedSupplierId"
              :supplierId="selectedSupplierId"
            />
            <div v-else class="no-selection">
              <div class="no-selection-icon">🏢</div>
              <h3>공급처를 선택해주세요</h3>
              <p
                >왼쪽 목록에서 공급처를 선택하면 상세 정보를 확인할 수
                있습니다.</p
              >
            </div>
          </div>
          <div v-else-if="activeTab === 'purchase-order'">
            <div v-if="supplier">
              <PurchaseOrderInfo
                v-if="purchaseOrderViewMode === 'list'"
                :supplier="supplier"
                :key="supplier.id"
                @show-register-view="purchaseOrderViewMode = 'register'"
              />
              <PurchaseOrderRegister
                v-if="purchaseOrderViewMode === 'register'"
                :supplier="supplier"
                @cancel-register="purchaseOrderViewMode = 'list'"
              />
            </div>
            <div v-else class="no-selection">
              <div class="no-selection-icon">🏢</div>
              <h3>공급처를 선택해주세요</h3>
              <p
                >왼쪽 목록에서 공급처를 선택하면 상세 정보를 확인할 수
                있습니다.</p
              >
            </div>
          </div>
          <div
            v-else-if="activeTab === 'delivery-info'"
            class="p-8 text-center text-gray-500"
          >
            납품관리 기능은 현재 준비중입니다.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f8f9fa;
}
.breadcrumb-container {
  padding: 16px 24px;
  background-color: #f8f9fa;
}
.info-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px 24px;
}
.info-group {
  border-radius: 12px;
  overflow: hidden;
  background-color: #4066fa; /* For the header part */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.content-area {
  background-color: white;
}
.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  color: #6c757d;
  background: #f8f9fa;
  border-radius: 12px;
  min-height: 320px;
}
.no-selection-icon {
  font-size: 48px;
  margin-bottom: 16px;
}
.no-selection h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #212529;
  font-weight: 600;
}
.no-selection p {
  margin: 0;
  color: #6c757d;
  font-size: 15px;
}
</style>
