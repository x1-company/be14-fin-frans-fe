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
                <FranchiseDashboard
                    v-if="activeTabSwitch === 0"
                    :in-progress-order="dashboardCardData.inProgressOrder"
                    :in-progress-approval="dashboardCardData.inProgressApproval"
                    :completed-order="dashboardCardData.completedOrder"
                />

                <!-- 월별 주문금액 통계 그래프 (가맹점별/월별) -->
                <div v-if="activeTabSwitch === 0" class="stats-graph-section">
                    <div class="stats-tab-bar">
                        <button
                            class="stats-tab-btn"
                            :class="{active: statsTab === 0}"
                            @click="selectStatsTab(0)"
                        >주문 금액 분석</button>
                        <button
                            class="stats-tab-btn"
                            :class="{active: statsTab === 1}"
                            @click="selectStatsTab(1)"
                        >자재별 분석</button>
                    </div>
                    <!-- 월 선택 드롭다운을 탭 아래에 공통 배치 -->
                    <div class="doughnut-top-row">
                        <div class="doughnut-top-right">
                            <label style="font-weight:500; margin-right:8px;">월 선택:</label>
                            <select v-model="selectedMonth" @change="handleMonthChange" class="month-dropdown">
                                <option v-for="m in 12" :key="m" :value="m">{{ m }}월</option>
                            </select>
                        </div>
                    </div>
                    <div class="stats-graph-card">
                        <template v-if="statsTab === 0">
                            <div style="display:flex;align-items:center;gap:12px;">
                                <h3 style="margin:0;">월별 주문 금액 총액</h3>
                                <button v-if="props.selectedFranchiseId" @click="toggleTrend" :class="['trend-btn', {active: trendVisible}]">
                                    {{ trendVisible ? '동향 닫기' : '동향 보기' }}
                                </button>
                            </div>
                            <FranchiseOrderAmountBar 
                                v-if="props.selectedFranchiseId"
                                :chart-data="orderAmountChartData"
                                :trend-visible="trendVisible"
                                :selected-franchise-id="props.selectedFranchiseId"
                            />
                            <OrderAmountBarChart 
                                v-else
                                :chart-data="orderAmountChartData" 
                                :month="selectedMonth"
                                :is-franchise-selected="false"
                                :trend-visible="trendVisible"
                                @month-change="handleMonthChange"
                            />
                        </template>
                        <template v-else-if="statsTab === 1">
                            <div class="doughnut-charts-row">
                                <div class="doughnut-chart-col">
                                    <h3 class="doughnut-title">자재별 주문량</h3>
                                    <span class="doughnut-desc">{{ selectedMonth }}월 기준 자재별 주문 비율</span>
                                    <FranchiseProductOrderDoughnut
                                        v-if="props.selectedFranchiseId"
                                        :chart-data="productOrderChartData"
                                        :month="selectedMonth"
                                        :selected-franchise-id="props.selectedFranchiseId"
                                        @month-change="handleMonthChange"
                                    />
                                    <ProductOrderDoughnutChart
                                        v-else
                                        :chart-data="productOrderChartData"
                                        :month="selectedMonth"
                                        :is-franchise-selected="false"
                                        :selected-franchise-id="props.selectedFranchiseId"
                                        @month-change="handleMonthChange"
                                    />
                                </div>
                                <div class="doughnut-chart-col">
                                    <h3 class="doughnut-title">자재별 반품량</h3>
                                    <span class="doughnut-desc">{{ selectedMonth }}월 기준 자재별 반품 비율</span>
                                    <FranchiseReturnProductDoughnut
                                        v-if="props.selectedFranchiseId"
                                        :chart-data="returnProductChartData"
                                        :month="selectedMonth"
                                        :selected-franchise-id="props.selectedFranchiseId"
                                        @month-change="handleMonthChange"
                                    />
                                    <ReturnProductDoughnutChart
                                        v-else
                                        :chart-data="returnProductChartData"
                                        :month="selectedMonth"
                                        :is-franchise-selected="false"
                                        :selected-franchise-id="props.selectedFranchiseId"
                                        @month-change="handleMonthChange"
                                    />
                                </div>
                            </div>
                        </template>
                    </div>
                </div>

                    <div>
                    <FranchiseInfo v-if="activeTabSwitch === 1" :selectedFranchiseId="selectedFranchiseId"/>

                    <OrderList 
                        v-if="activeTabSwitch === 2 && !orderDetailId" 
                        :franchiseId="franchiseId" 
                        :selectedFranchiseId="selectedFranchiseId"
                        @show-order-detail="handleShowOrderDetail"/>

                        <div v-if="activeTabSwitch === 2 && orderDetailId">                  
                        <div v-if="loading"></div>
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
                        @select-return="handleShowReturnDetail"
                    />
                    <div v-if="activeTabSwitch === 3 && returnDetailId">
                        <div v-if="returnLoading"></div>
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
                            <!-- <DeliveryInfoCard :returnData="returnDetail" />
                            <ApprovalInfoCard :returnData="returnDetail" /> -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
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
import FranchiseDashboard from '@/components/hq/franchise/dashboard/FranchiseDashboard.vue'
import OrderAmountBarChart from '@/components/hq/franchise/dashboard/OrderAmountBarChart.vue'
import FranchiseOrderAmountBar from '@/components/hq/franchise/dashboard/FranchiseOrderAmountBar.vue'
import ReturnProductDoughnutChart from '@/components/hq/franchise/dashboard/ReturnProductDoughnutChart.vue'
import FranchiseReturnProductDoughnut from '@/components/hq/franchise/dashboard/FranchiseReturnProductDoughnut.vue'
import ProductOrderDoughnutChart from '@/components/hq/franchise/dashboard/ProductOrderDoughnutChart.vue'
import FranchiseProductOrderDoughnut from '@/components/hq/franchise/dashboard/FranchiseProductOrderDoughnut.vue'

import api from '@/lib/api'

const props = defineProps({
    activeTab: String,
    franchiseId: [String, Number],
    selectedFranchiseId: [String, Number],
    sidebarTab: { type: String, default: 'mine' } // 'mine' or 'team', 필요시 부모에서 내려줌
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
    if (activeTabSwitch.value === 2 && orderDetailId.value) {
    return "주문의 상세 내역을 확인합니다.";
  }
    return tabInfo.value[activeTabSwitch.value]?.desc || '대시보드입니다.'
})

const dashboardCardData = ref({
  inProgressOrder: { count: 3, diff: 2 },
  inProgressApproval: { count: 1, diff: -1 },
  completedOrder: { count: 200, diff: 15 }
})

const dashboardStats = ref({
  todayOrder: 0,
  monthSales: 0,
  lowStock: 0,
  returnRequest: 0,
});

const orderAmountChartData = ref([])
const returnProductChartData = ref([])
const productOrderChartData = ref([])

function getPrevMonth() {
  const now = new Date();
  let month = now.getMonth();
  if (month === 0) month = 12;
  return { month };
}

const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(getPrevMonth().month)

const trendVisible = ref(false)
function toggleTrend() {
  trendVisible.value = !trendVisible.value
}

// 가맹점 선택 해제(전체) 시 trendVisible false, selectedMonth 저번 달로 리셋
watch(
  () => props.selectedFranchiseId,
  (newVal, oldVal) => {
    if (!newVal && trendVisible.value) {
      trendVisible.value = false;
    }
    selectedMonth.value = getPrevMonth().month;
  }
)

function handleMonthChange(event) {
  selectedMonth.value = Number(event.target.value)
  fetchOrderAmountStats()
  fetchReturnProductStats()
  fetchProductOrderStats()
}
function handleYearChange(year) {
  selectedYear.value = year
  fetchOrderAmountStats()
}

async function fetchOrderAmountStats() {
  try {
    let url = ''
    let params = { year: selectedYear.value, month: selectedMonth.value }
    if (props.sidebarTab === 'team') {
      url = '/api/hq/statistics/franchise/order-amount/department'
    } else if (props.selectedFranchiseId) {
      url = `/api/hq/statistics/franchise/order-amount/manager/${props.selectedFranchiseId}`
      params = { year: selectedYear.value, month: selectedMonth.value }
    } else {
      url = '/api/hq/statistics/franchise/order-amount/manager'
    }
    const { data } = await api.get(url, { params })
    if (props.selectedFranchiseId) {
      orderAmountChartData.value = data || []
    } else {
      orderAmountChartData.value = (data || []).map(item => ({
        franchiseName: item.franchiseName || item.name || item.franchise || item.franchise_id || '가맹점',
        orderAmount: item.orderAmount || item.amount || 0
      }))
    }
  } catch (e) {
    orderAmountChartData.value = []
    console.error('월별 주문금액 통계 조회 실패', e)
  }
}

async function fetchReturnProductStats() {
  try {
    let url = ''
    let params = { year: selectedYear.value, month: selectedMonth.value }
    if (props.sidebarTab === 'team') {
      url = '/api/hq/statistics/franchise/return-product/department'
    } else if (props.selectedFranchiseId) {
      url = `/api/hq/statistics/franchise/return-product/manager/${props.selectedFranchiseId}`
      params = { year: selectedYear.value, month: selectedMonth.value }
    } else {
      url = '/api/hq/statistics/franchise/return-product/manager'
    }
    const { data } = await api.get(url, { params })
    returnProductChartData.value = data || []
  } catch (e) {
    returnProductChartData.value = []
    console.error('월별 자재별 반품량 통계 조회 실패', e)
  }
}

async function fetchProductOrderStats() {
  try {
    let url = ''
    let params = { year: selectedYear.value, month: selectedMonth.value }
    if (props.sidebarTab === 'team') {
      url = '/api/hq/statistics/franchise/product-order/department'
    } else if (props.selectedFranchiseId) {
      url = `/api/hq/statistics/franchise/product-order/manager/${props.selectedFranchiseId}`
      params = { year: selectedYear.value, month: selectedMonth.value }
    } else {
      url = '/api/hq/statistics/franchise/product-order/manager'
    }
    const { data } = await api.get(url, { params })
    productOrderChartData.value = data || []
  } catch (e) {
    productOrderChartData.value = []
    console.error('월별 자재별 주문량 통계 조회 실패', e)
  }
}

watch([
  () => props.sidebarTab,
  () => props.selectedFranchiseId,
  selectedMonth,
  selectedYear
], fetchOrderAmountStats, { immediate: true })

watch([
  () => props.sidebarTab,
  () => props.selectedFranchiseId,
  selectedMonth,
  selectedYear
], fetchReturnProductStats, { immediate: true })

watch([
  () => props.sidebarTab,
  () => props.selectedFranchiseId,
  selectedMonth,
  selectedYear
], fetchProductOrderStats, { immediate: true })

// 수정: 컴포넌트 마운트 시와 activeTabSwitch가 0일 때 fetch 호출
onMounted(() => {
  if (activeTabSwitch.value === 0) {
    fetchDashboardStats()
    fetchOrderAmountStats()
    fetchReturnProductStats()
    fetchProductOrderStats()
  }
})

watch(activeTabSwitch, (newTab) => {
  if (newTab === 0) {
    fetchDashboardStats()
    fetchOrderAmountStats()
    fetchReturnProductStats()
    fetchProductOrderStats()
  }
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

async function fetchDashboardStats() {
  try {
    // 담당 가맹점 월 주문 금액 통계 조회 API 호출
    const orderAmountRes = await api.get('/api/hq/statistics/franchise/order-amount/manager')
    const orderAmountData = orderAmountRes.data || []

    // 담당 가맹점 월 자재별 반품량 통계 조회 API 호출
    const returnProductRes = await api.get('/api/hq/statistics/franchise/return-product/manager')
    const returnProductData = returnProductRes.data || []

    // TODO: 재고 부족 수치는 별도 API 있을 가능성 있음. 임시로 0 처리
    const lowStockCount = 0

    // API 반환 데이터 구조에 맞게 값 계산 (아래는 예시)
    const todayOrderCount = orderAmountData.reduce((sum, item) => sum + (item.todayOrderCount || 0), 0)
    const totalMonthSales = orderAmountData.reduce((sum, item) => sum + (item.orderAmount || 0), 0)
    const totalReturnRequest = returnProductData.reduce((sum, item) => sum + (item.returnQuantity || 0), 0)

    dashboardStats.value.todayOrder = todayOrderCount
    dashboardStats.value.monthSales = totalMonthSales
    dashboardStats.value.lowStock = lowStockCount
    dashboardStats.value.returnRequest = totalReturnRequest

  } catch (error) {
    console.error('대시보드 통계 데이터 조회 실패', error)
  }
}

const statsTab = ref(0) // 0: 주문 금액 분석, 1: 자재별 분석
function selectStatsTab(idx) {
  statsTab.value = idx
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

.stats-graph-section {
    padding: 24px;
    background: #fff;
    border-radius: 8px;
    margin-bottom: 24px;
}

.stats-graph-card {
    background: #fff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 16px 0 rgba(64, 102, 250, 0.06);
}

.trend-btn {
  background: #e6f0fa;
  color: #1a6ed8;
  border: none;
  border-radius: 16px;
  padding: 6px 18px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s;
}
.trend-btn.active {
  background: #1a6ed8;
  color: #fff;
}

.stats-tab-bar {
  display: flex;
  gap: 0;
  margin-bottom: 18px;
  background: #f6f7fa;
  border-radius: 8px;
  overflow: hidden;
  border: 1.5px solid #f0f1f4;
}
.stats-tab-btn {
  flex: 1;
  padding: 18px 0;
  font-size: 1.15rem;
  font-weight: 500;
  color: #888;
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
}
.stats-tab-btn.active {
  background: #fff;
  color: #222;
  font-weight: 700;
  box-shadow: 0 2px 8px 0 rgba(64, 102, 250, 0.04);
}
.doughnut-charts-row {
  display: flex;
  flex-direction: row;
  gap: 32px;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 24px;
}
.doughnut-chart-col {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-height: 500px; /* 자재 목록이 더 아래까지 표시되도록 높이 증가 */
}
.doughnut-top-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}
.doughnut-top-left {
  flex: 1;
  min-width: 0;
  text-align: left;
}
.doughnut-top-right {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 120px;
}
.doughnut-title {
  margin: 0 0 2px 0;
  font-size: 1.15rem;
  font-weight: 700;
  text-align: left;
}
.doughnut-desc {
  color: #888;
  font-size: 15px;
  margin-bottom: 8px;
  display: block;
  text-align: left;
}
.month-dropdown {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid #d0d0d0;
  font-size: 15px;
}
</style>