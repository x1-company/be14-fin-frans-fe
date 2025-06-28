<template>
  <div class="franchise-dashboard">
    <!-- 대시보드 카드 섹션 삭제 -->
    <!-- 월별 주문금액 통계 그래프 -->
    <div class="stats-graph-section">
      <div class="stats-tab-bar">
        <button class="stats-tab-btn" :class="{ active: statsTab === 0 }" @click="selectStatsTab(0)">주문 금액 분석</button>
        <button class="stats-tab-btn" :class="{ active: statsTab === 1 }" @click="selectStatsTab(1)">자재별 분석</button>
      </div>

      <div class="doughnut-top-row">
        <div class="doughnut-top-right" v-if="statsTab === 1">
          <label style="font-weight:500; margin-right:8px;">월 선택:</label>
          <select v-model="selectedMonth" @change="handleMonthChange" class="month-dropdown">
            <option v-for="m in 12" :key="m" :value="m">{{ m }}월</option>
          </select>
        </div>
      </div>

      <div class="stats-graph-card">
        <template v-if="statsTab === 0">
          <div style="display:flex;align-items:center;gap:12px;">
            <h3 style="margin:0;">연간 주문 금액 총액</h3>
            <button
              @click="toggleTrend"
              :class="['trend-btn', { active: trendVisible }]"
            >
              {{ trendVisible ? '동향 닫기' : '동향 보기' }}
            </button>
          </div>
          <FranchiseOrderAmountBar
            :chart-data="orderAmountChartData"
            :trend-visible="trendVisible"
            :selected-franchise-id="null"
          />
        </template>

        <template v-else-if="statsTab === 1">
          <div class="doughnut-charts-row">
            <div class="doughnut-chart-col">
              <h3 class="doughnut-title">자재별 주문량</h3>
              <span class="doughnut-desc">{{ selectedMonth }}월 기준 자재별 주문 비율</span>
              <FranchiseProductOrderDoughnut
                :chart-data="productOrderChartData"
                :month="selectedMonth"
                :selected-franchise-id="null"
                @month-change="handleMonthChange"
              />
            </div>
            
            <div class="doughnut-chart-col">
              <h3 class="doughnut-title">자재별 반품량</h3>
              <span class="doughnut-desc">{{ selectedMonth }}월 기준 자재별 반품 비율</span>
              <FranchiseReturnProductDoughnut
                :chart-data="returnProductChartData"
                :month="selectedMonth"
                :selected-franchise-id="null"
                @month-change="handleMonthChange"
              />
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '@/lib/api'
import FranchiseOrderAmountBar from '@/components/hq/franchise/dashboard/FranchiseOrderAmountBar.vue'
import FranchiseProductOrderDoughnut from '@/components/hq/franchise/dashboard/FranchiseProductOrderDoughnut.vue'
import FranchiseReturnProductDoughnut from '@/components/hq/franchise/dashboard/FranchiseReturnProductDoughnut.vue'

// 대시보드 카드 데이터
const dashboardCardData = ref({
  inProgressOrder: { count: 5, diff: 2 },
  completedOrder: { count: 45, diff: 8 },
  returnRequest: { count: 2, diff: -1 },
  monthSales: { amount: 12500000, diff: 1500000 }
})

// 통계 데이터
const selectedMonth = ref(new Date().getMonth() + 1)
const statsTab = ref(0)
const trendVisible = ref(false)
const orderAmountChartData = ref([])
const productOrderChartData = ref([])
const returnProductChartData = ref([])

// 통화 포맷팅
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ko-KR').format(amount)
}

// 월 변경 핸들러
const handleMonthChange = () => {
  fetchProductOrderStats()
  fetchReturnProductStats()
}

// 트렌드 토글
function toggleTrend() {
  trendVisible.value = !trendVisible.value
}

// 통계 탭 선택
function selectStatsTab(idx) {
  statsTab.value = idx
}

// 주문 금액 통계 가져오기
async function fetchOrderAmountStats() {
  const year = new Date().getFullYear();
  const promises = [];
  for (let m = 1; m <= 12; m++) {
    promises.push(
      api.get('/api/franchise/stats/order-amounts', { params: { year, month: m } })
        .then(res => ({ month: m, orderAmount: res.data[0]?.orderAmount || null }))
        .catch(() => ({ month: m, orderAmount: null }))
    );
  }
  const results = await Promise.all(promises);
  orderAmountChartData.value = results;
}

// 자재별 주문량 통계 가져오기
async function fetchProductOrderStats() {
  try {
    const { data } = await api.get('/api/franchise/stats/order-products', {
      params: { year: new Date().getFullYear(), month: selectedMonth.value }
    })
    productOrderChartData.value = data || []
  } catch (e) {
    productOrderChartData.value = []
    console.error('월별 자재별 주문량 통계 조회 실패', e)
  }
}

// 자재별 반품량 통계 가져오기
async function fetchReturnProductStats() {
  try {
    const { data } = await api.get('/api/franchise/stats/return-products', {
      params: { year: new Date().getFullYear(), month: selectedMonth.value }
    })
    returnProductChartData.value = data || []
  } catch (e) {
    returnProductChartData.value = []
    console.error('월별 자재별 반품량 통계 조회 실패', e)
  }
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  fetchOrderAmountStats()
  fetchProductOrderStats()
  fetchReturnProductStats()
})

// 월 변경 시 통계 데이터 다시 로드
watch(selectedMonth, () => {
  fetchProductOrderStats()
  fetchReturnProductStats()
})
</script>

<style scoped>
.franchise-dashboard {
  padding: 24px;
}

/* 대시보드 카드 스타일 */
.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.dashboard-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 16px 0 rgba(64, 102, 250, 0.06);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.dashboard-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 24px 0 rgba(64, 102, 250, 0.12);
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon img {
  width: 32px;
  height: 32px;
}

.order-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.completed-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.return-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.sales-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.card-content {
  flex: 1;
}

.card-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: #6c757d;
}

.card-value {
  margin: 0 0 4px 0;
  font-size: 28px;
  font-weight: 700;
  color: #212529;
}

.card-diff {
  font-size: 12px;
  font-weight: 500;
}

.card-diff.positive {
  color: #28a745;
}

.card-diff.negative {
  color: #dc3545;
}

/* 통계 섹션 스타일 */
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
  min-height: 500px;
}

.doughnut-top-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
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

/* 반응형 디자인 */
@media (max-width: 768px) {
  .dashboard-cards {
    grid-template-columns: 1fr;
  }
  
  .doughnut-charts-row {
    grid-template-columns: 1fr;
  }
  
  .doughnut-top-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style> 