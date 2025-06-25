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

        <!-- 탭별 컨텐츠 영역 -->
        <div class="tab-content">
          <div v-if="activeTabSwitch === 0" class="content-section">
            <h3>대시보드 컨텐츠</h3>
            <p>대시보드 내용이 여기에 표시됩니다.</p>
            <p>컴포넌트 생성 후 여기에 넣으면 됩니다</p>
          </div>

          <FranchiseInfo v-if="activeTabSwitch === 1" />

          <div v-if="activeTabSwitch === 2">
            <OrderRegister v-if="showOrderRegister" @back-to-list="showOrderRegister = false" />
            
            <div v-else-if="orderDetailId">
              <div v-if="loading">로딩 중...</div>
              <div v-else-if="!order">주문 상세 데이터를 불러올 수 없습니다.</div>
              <div v-else>
                <FrOrderActionButtons
                    :orderId="orderDetailId"
                    :rejectedReason="order?.rejectedReason"
                    :status="order?.status"
                    :delivery-info="{
                        deliveryCompany: order?.deliveryCompany,
                        name: order?.driverName,
                        phone: order?.driverPhone,
                        trackingNumber: order?.trackingNumber
                    }"
                    @refreshOrder="fetchOrderDetail"
                    @close="handleBackToList"
                />
                <OrderProgressBar :status="order?.status" />
                <FranchiseInfoCard :order="order" />
                <OrderInfoCard :order="order" />
                <ProductTable :products="order?.products" :totalAmount="order?.totalAmount" />
                <DeliveryInfoCard :order="order" />
              </div>
            </div>

            <OrderList 
                v-else 
                :franchiseId="franchiseId" 
                :selectedFranchiseId="selectedFranchiseId"
                @show-order-detail="handleShowOrderDetail"
                @show-register-view="showOrderRegister = true" />
          </div>
          
          <div v-if="activeTabSwitch === 3">
            <ReturnList />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Breadcrumb from "@/components/hq/common/Breadcrumb.vue"
import InfoHeader from './InfoHeader.vue'
import FranchiseInfo from '@/components/franchise/info/FranchiseInfo.vue'
import OrderList from '@/components/franchise/order/OrderList.vue'
import OrderRegister from '@/components/franchise/order/OrderRegister.vue'
import FrOrderActionButtons from '@/components/hq/orders/detail/OrderActionButtons.vue'
import OrderProgressBar from '@/components/hq/orders/detail/OrderProgressBar.vue'
import FranchiseInfoCard from '@/components/hq/orders/detail/FranchiseInfoCard.vue'
import DeliveryInfoCard from '@/components/hq/orders/detail/DeliveryInfoCard.vue'
import OrderInfoCard from '@/components/hq/orders/detail/OrderInfoCard.vue'
import ProductTable from '@/components/hq/orders/detail/ProductTable.vue'
import ReturnList from '@/components/hq/return/list/ReturnList.vue'
import api from '@/lib/api'

const props = defineProps({
  activeTab: String,
  franchiseId: [String, Number],
  selectedFranchiseId: [String, Number],
});

const emit = defineEmits(["tab-change"]);

const breadcrumbItems = ref(["HOME", "가맹점관리", "대시보드"]);

const updateBreadcrumb = (newItems) => {
  breadcrumbItems.value = newItems;
};

const tabs = [
  "대시보드",
  "가맹점 정보",
  "주문관리",
  "반품관리",
];

const tabInfo = ref([
  { title: "대시보드", desc: "대시보드입니다." },
  { title: "가맹점 정보", desc: "가맹점 정보를 관리할 수 있습니다." },
  { title: "주문 관리", desc: "주문을 관리할 수 있습니다." },
  { title: "반품 관리", desc: "반품을 관리할 수 있습니다." },
]);

const activeTabSwitch = ref(0);
const showOrderRegister = ref(false);
const orderDetailId = ref(null);
const order = ref(null);
const loading = ref(false);

const handleShowOrderDetail = (id) => {
  orderDetailId.value = id;
};

const handleBackToList = () => {
  orderDetailId.value = null;
  order.value = null;
};

const fetchOrderDetail = async () => {
  if (!orderDetailId.value) return;
  loading.value = true;
  try {
    const response = await api.get(`/api/franchise/orders/${orderDetailId.value}`);
    order.value = response.data;
  } catch (error) {
    console.error('Error fetching order details:', error);
    order.value = null;
  } finally {
    loading.value = false;
  }
};

watch(orderDetailId, (newId) => {
  if (newId) {
    fetchOrderDetail();
  }
});

// props.activeTab 값이 변경될 때 activeTabSwitch 업데이트
watch(
  () => props.activeTab,
  (newValue) => {
    const tabIndex = tabs.findIndex((tab) => tab === newValue);
    if (tabIndex !== -1) {
      activeTabSwitch.value = tabIndex;
    }
  },
  { immediate: true }
);

// activeTab이 '주문관리'가 아니게 되면, 뷰 리셋
watch(
  () => activeTabSwitch.value,
  (newTabIndex) => {
    if (newTabIndex !== 2) {
      showOrderRegister.value = false;
      orderDetailId.value = null;
    }
  }
);

const title = computed(() => {
  if (activeTabSwitch.value === 2 && showOrderRegister.value) {
    return "주문 등록";
  }
  
  return tabInfo.value[activeTabSwitch.value]?.title || "대시보드";
});
const desc = computed(() => {
  if (activeTabSwitch.value === 2 && showOrderRegister.value) {
    return "주문할 자재를 등록할 수 있습니다.";
  }
  if (activeTabSwitch.value === 2 && orderDetailId.value) {
    return "주문의 상세 내역을 확인합니다.";
  }
  return tabInfo.value[activeTabSwitch.value]?.desc || "대시보드입니다.";
});

const updateTab = (newTabIndex) => {
  activeTabSwitch.value = newTabIndex;
  const selectedTab = tabs[newTabIndex];
  emit("tab-change", selectedTab);
};
</script>

<style scoped>
.info-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8f9fa;
  overflow: hidden;
  /* 전체 컨테이너는 overflow 숨김 */
}

.breadcrumb-container {
  flex-shrink: 0;
  /* 브레드크럼은 고정 크기 */
  padding: 15px 30px;
  background: #f8f9fa;
}

.info-content-wrapper {
  flex: 1;
  overflow-y: auto;
  /* 여기서 스크롤 가능하게 */
  padding: 0 24px 24px 24px;
}

.info-wrapper {
  width: 100%;
  max-width: 1250px;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px 0 rgba(64, 102, 250, 0.06);
  min-height: fit-content;
  /* 내용에 맞게 높이 조정 */
}

.tab-content {
  padding: 32px;
}

.content-section {
  background: #f8f9fa;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.content-section h3 {
  margin: 0 0 16px 0;
  color: #212529;
  font-size: 1.25rem;
  font-weight: 600;
}

.content-section p {
  margin: 0;
  color: #6c757d;
  line-height: 1.5;
}
</style>
