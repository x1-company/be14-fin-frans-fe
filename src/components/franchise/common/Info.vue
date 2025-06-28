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
          <FranchiseDashboard v-if="activeTabSwitch === 0" />

          <FranchiseInfo v-if="activeTabSwitch === 1" />

          <div v-if="activeTabSwitch === 2">
            <OrderRegister v-if="showOrderRegister" @back-to-list="showOrderRegister = false" />
            
            <div v-else-if="orderDetailId">
              <div v-if="loading"></div>
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
                <OrderProductTable :products="order?.products" :totalAmount="order?.totalAmount" />
                <OrderDeliveryInfoCard :order="order" />
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
            <!-- 반품 상세 보기 -->
            <div v-if="returnDetailId">
              <div v-if="returnLoading">로딩 중...</div>
              <div v-else-if="!returnData">반품 상세 데이터를 불러올 수 없습니다.</div>
              <div v-else>
                <!-- 뒤로가기 버튼 -->
                <div class="detail-header">
                  <button @click="handleBackToReturnList" class="back-button">
                    ← 반품 목록으로 돌아가기
                  </button>
                </div>
                
                <!-- 반품 상세 컴포넌트들을 세로로 배치 -->
                <ReturnProgressBar :status="returnData?.status" />
                <ReturnInfoCard :returnData="returnData" />
                <ProductTable 
                  :products="returnData?.returnProducts" 
                  :totalAmount="returnData?.totalAmount" 
                />
                <DeliveryInfoCard :returnData="returnData" />
              </div>
            </div>

            <!-- 반품 목록 -->
            <ReturnList 
              v-else
              :franchiseId="franchiseId" 
              :selectedFranchiseId="selectedFranchiseId"
              @show-return-detail="handleShowReturnDetail"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Breadcrumb from "@/components/hq/common/Breadcrumb.vue"
import InfoHeader from './InfoHeader.vue'
import FranchiseInfo from '@/components/franchise/info/FranchiseInfo.vue'
import FranchiseDashboard from '@/components/franchise/dashboard/FranchiseDashboard.vue'
import OrderList from '@/components/franchise/order/OrderList.vue'
import OrderRegister from '@/components/franchise/order/OrderRegister.vue'
import FrOrderActionButtons from '../order/button/FrOrderActionButtons.vue'
import OrderDeliveryInfoCard from '@/components/hq/orders/detail/DeliveryInfoCard.vue'
import OrderProgressBar from '@/components/hq/orders/detail/OrderProgressBar.vue'
import FranchiseInfoCard from '@/components/hq/orders/detail/FranchiseInfoCard.vue'
import DeliveryInfoCard from '@/components/franchise/return/detail/DeliveryInfoCard.vue'
import OrderInfoCard from '@/components/hq/orders/detail/OrderInfoCard.vue'
import OrderProductTable from '@/components/hq/orders/detail/ProductTable.vue'
import ProductTable from '@/components/franchise/return/detail/ProductTable.vue'
import ReturnList from '@/components/franchise/return/list/ReturnList.vue'
import ReturnProgressBar from '@/components/franchise/return/detail/ReturnProgressBar.vue'
import ReturnInfoCard from '@/components/franchise/return/detail/ReturnInfoCard.vue'
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

// 반품 관련 상태
const returnDetailId = ref(null);
const returnData = ref(null);
const returnLoading = ref(false);

const route = useRoute();

const handleShowOrderDetail = (id) => {
  orderDetailId.value = id;
};

function handleBackToList() {
  orderDetailId.value = null;
  order.value = null;
};

// 반품 상세 보기 핸들러
const handleShowReturnDetail = (id) => {
  returnDetailId.value = id;
};

// 반품 목록으로 돌아가기
const handleBackToReturnList = () => {
  returnDetailId.value = null;
  returnData.value = null;
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

// 반품 상세 데이터 가져오기
const fetchReturnDetail = async () => {
  if (!returnDetailId.value) return;
  returnLoading.value = true;
  try {
    const response = await api.get(`/api/franchise/return/${returnDetailId.value}`);
    returnData.value = response.data;
  } catch (error) {
    console.error('Error fetching return details:', error);
    returnData.value = null;
  } finally {
    returnLoading.value = false;
  }
};

watch(orderDetailId, (newId) => {
  if (newId) {
    fetchOrderDetail();
  }
});

// 반품 상세 ID 변경 감지
watch(returnDetailId, (newId) => {
  if (newId) {
    fetchReturnDetail();
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
    // 반품관리 탭이 아니게 되면 반품 상세 뷰 리셋
    if (newTabIndex !== 3) {
      returnDetailId.value = null;
      returnData.value = null;
    }
  }
);

const title = computed(() => {
  if (activeTabSwitch.value === 2 && showOrderRegister.value) {
    return "주문 등록";
  }
  if (activeTabSwitch.value === 2 && orderDetailId.value) {
    return "주문 상세";
  }
  if (activeTabSwitch.value === 3 && returnDetailId.value) {
    return "반품 상세";
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
  if (activeTabSwitch.value === 3 && returnDetailId.value) {
    return "반품의 상세 내역을 확인합니다.";
  }
  return tabInfo.value[activeTabSwitch.value]?.desc || "대시보드입니다.";
});

const updateTab = (newTabIndex) => {
  activeTabSwitch.value = newTabIndex;
  const selectedTab = tabs[newTabIndex];
  emit("tab-change", selectedTab);
};

onMounted(() => {
  // 주문관리 탭 + orderId 쿼리 있을 때 자동 상세 오픈
  if (route.query.tab === '주문관리' && route.query.orderId) {
    activeTabSwitch.value = 2;
    orderDetailId.value = route.query.orderId;
    fetchOrderDetail();
  }
});

watch(
  () => [route.query.tab, route.query.orderId],
  ([tab, orderId]) => {
    if (tab === '주문관리' && orderId) {
      activeTabSwitch.value = 2;
      orderDetailId.value = orderId;
      fetchOrderDetail();
    }
  }
);
</script>

<style scoped>
.info-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8f9fa;
  overflow: hidden;
}

.breadcrumb-container {
  flex-shrink: 0;
  padding: 15px 30px;
  background: #f8f9fa;
}

.info-content-wrapper {
  flex: 1;
  overflow-y: auto;
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

.detail-header {
  margin-bottom: 20px;
}

.back-button {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s;
}

.back-button:hover {
  background: #e9ecef;
  color: #212529;
}
</style>