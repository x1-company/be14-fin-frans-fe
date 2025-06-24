<template>
    <div class="info-container">
        <div class="breadcrumb-container">
            <Breadcrumb :items="breadcrumbItems" />
        </div>

        <div class="info-content-wrapper">
            <div class="info-wrapper">
                <InfoHeader :title="title" :desc="desc" :tabs="tabs" :activeTab="activeTabSwitch"
                    @select-tab="updateTab" @update-breadcrumb="updateBreadcrumb" />

                <!-- 탭별 컨텐츠 영역 -->
                <div class="tab-content">
                    <div v-if="activeTabSwitch === 0" class="content-section">
                        <h3>대시보드 컨텐츠</h3>
                        <p>대시보드 내용이 여기에 표시됩니다.</p>
                        <p>컴포넌트 생성 후 여기에 넣으면 됩니다</p>
                    </div>

                    <div>
                    <FranchiseInfo v-if="activeTabSwitch === 1" :selectedFranchiseId="selectedFranchiseId"/>

                    <OrderList 
                        v-if="activeTabSwitch === 2 && !orderDetailId" 
                        :franchiseId="franchiseId" 
                        :selectedFranchiseId="selectedFranchiseId"
                        @show-order-detail="handleShowOrderDetail"/>
                        <div v-if="activeTabSwitch === 2 && orderDetailId">
딩 중...                     <div v-if="loading">로딩 중...</div>
                            <div v-else-if="!order">주문 상세 데이터를 불러올 수 없습니다.</div>
                            <div v-else>
                                <!-- 상세 컴포넌트들 -->
                        <OrderActionButtons
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
                        <PaymentInfoCard :order="order" />
                    </div>
                </div>
                
            
                    <ReturnList
                        v-if="activeTabSwitch === 3 && !returnDetailId"
                        :franchiseId="franchiseId" 
                        :selectedFranchiseId="selectedFranchiseId"
                        @selectReturn="handleShowReturnDetail"
                    />
                    <div v-if="activeTabSwitch === 3 && returnDetailId">
                        <div v-if="returnLoading">로딩 중...</div>
                        <div v-else-if="!returnDetail">반품 상세 데이터를 불러올 수 없습니다.</div>
                        <div v-else>
                            <!-- 반품 상세 컴포넌트들 -->
                            <ReturnActionButtons
                                :returnId="returnDetailId"
                                :rejectedReason="returnDetail?.rejectedReason"
                                :status="returnDetail?.status"
                                :delivery-info="{
                                    deliveryCompany: returnDetail?.deliveryCompany,
                                    name: returnDetail?.driverName,
                                    phone: returnDetail?.driverPhone,
                                    trackingNumber: returnDetail?.trackingNumber
                                }"
                                @refreshReturn="fetchReturnDetail"
                                @close="handleReturnBackToList"
                            />
                            <ReturnProgressBar :status="returnDetail?.status" />
                            <ReturnFranchiseInfoCard :returnData="returnDetail" />
                            <ReturnInfoCard :returnData="returnDetail" />
                            <ProductTable :products="returnDetail?.products" :totalAmount="returnDetail?.totalAmount" />
                            <DeliveryInfoCard :returnData="returnDetail" />
                            <ApprovalInfoCard :returnData="returnDetail" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Breadcrumb from "@/components/hq/common/Breadcrumb.vue"
import InfoHeader from '../orders/InfoHeader.vue'
import OrderList from '../orders/list/OrderList.vue'
import FranchiseInfo from '../franchise/FranchiseInfo.vue'
import OrderProgressBar from '../orders/detail/OrderProgressBar.vue'
import FranchiseInfoCard from '../orders/detail/FranchiseInfoCard.vue'
import DeliveryInfoCard from '../orders/detail/DeliveryInfoCard.vue'
import OrderInfoCard from '../orders/detail/OrderInfoCard.vue'
import PaymentInfoCard from '../orders/detail/PaymentInfoCard.vue'
import ProductTable from '../orders/detail/ProductTable.vue'
import OrderActionButtons from '../orders/detail/OrderActionButtons.vue'
import ReturnList from '../return/list/ReturnList.vue'
import ReturnActionButtons from '../return/detail/ReturnActionButtons.vue'
import ReturnProgressBar from '../return/detail/ReturnProgressBar.vue'
import ReturnInfoCard from '../return/detail/ReturnInfoCard.vue'
import ApprovalInfoCard from '../return/detail/ApprovalInfoCard.vue'
import ReturnFranchiseInfoCard from '../return/detail/FranchiseInfoCard.vue'


import api from '@/lib/api'

const props = defineProps({
    activeTab: String,
    franchiseId: [String, Number],
    selectedFranchiseId: [String, Number]
})

const emit = defineEmits(['tab-change', "select-tab"])

const breadcrumbItems = ref(["HOME", "가맹점관리", "대시보드"])

const updateBreadcrumb = (newItems) => {
    breadcrumbItems.value = newItems
}

const tabs = [
    '대시보드',
    '가맹점 정보',
    '주문관리',
    '반품관리'
]

const tabInfo = ref([
    { title: "대시보드", desc: "대시보드입니다." },
    { title: "가맹점 정보", desc: "가맹점 정보를 관리할 수 있습니다." },
    { title: "주문 관리", desc: "주문을 관리할 수 있습니다." },
    { title: "반품 관리", desc: "반품을 관리할 수 있습니다." }
])

const activeTabSwitch = ref(0)

// props.activeTab 값이 변경될 때 activeTabSwitch 업데이트
watch(
    () => props.activeTab,
    (newValue) => {
        const tabIndex = tabs.findIndex(tab => tab === newValue)
        if (tabIndex !== -1) {
            activeTabSwitch.value = tabIndex
        }
    },
    { immediate: true }
)

const showOrderRegister = ref(false)

// activeTab이 '주문관리'가 아니게 되면, 목록 뷰로 리셋
watch(
    () => activeTabSwitch.value,
    (newTabIndex) => {
        if (newTabIndex !== 2) {
            showOrderRegister.value = false
        }
    }
)

const title = computed(() => {
    if (activeTabSwitch.value === 2 && showOrderRegister.value) {
        return "주문 등록"
    }
    return tabInfo.value[activeTabSwitch.value]?.title || '대시보드'
})
const desc = computed(() => {
    if (activeTabSwitch.value === 2 && showOrderRegister.value) {
        return "주문할 자재를 등록할 수 있습니다."
    }
    return tabInfo.value[activeTabSwitch.value]?.desc || '대시보드입니다.'
})

const updateTab = (newTabIndex) => {
    activeTabSwitch.value = newTabIndex
    const selectedTab = tabs[newTabIndex]
    emit('tab-change', selectedTab)
}

const orderDetailId = ref(null)
const order = ref(null)
const loading = ref(false)

// 반품 상세 관련 상태
const returnDetailId = ref(null)
const returnDetail = ref(null)
const returnLoading = ref(false)

async function fetchOrderDetail() {
  if (!orderDetailId.value) {
    order.value = null;
    return;
  }
  loading.value = true;
  try {
    const res = await api.get(`/api/hq/orders/${orderDetailId.value}`);
    console.log('order detail api result:', res); // 이 로그로 실제 데이터 확인
    order.value = res.data ? res.data : res;
  } catch (e) {
    order.value = null;
    console.error('order detail fetch error', e);
  } finally {
    loading.value = false;
  }
}

watch(orderDetailId, fetchOrderDetail)

function handleShowOrderDetail(orderId) {
    orderDetailId.value = orderId;
}
function handleBackToList() {
    orderDetailId.value = null;
}

function handleShowReturnDetail(returnId) {
    returnDetailId.value = returnId;
    fetchReturnDetail();
}

async function fetchReturnDetail() {
    if (!returnDetailId.value) return;
    returnLoading.value = true;
    try {
        const { data } = await api.get(`/api/hq/franchise/return/${returnDetailId.value}`);
        returnDetail.value = data;
    } catch (error) {
        returnDetail.value = null;
    } finally {
        returnLoading.value = false;
    }
}

function handleReturnBackToList() {
    returnDetailId.value = null;
    returnDetail.value = null;
}
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
    padding: 20px 30px;
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
    /* padding: 24px; */
    border-radius: 8px;
    /* border: 1px solid #e9ecef; */
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