<template>
  <div>
    <div class="dashboard-card-list">
      <div class="dashboard-card in-progress-order" @click="goToApproval">
        <div class="card-header">
          <span>진행중인 주문 결재 요청</span>
          <span class="card-icon">🛒</span>
        </div>
        <div class="card-main">
          <span class="card-value">{{ inProgressOrder.count }}</span>
        </div>
      </div>
      <div class="dashboard-card in-progress-approval" @click="goToApproval">
        <div class="card-header">
          <span>진행중인 반품 결재 요청</span>
          <span class="card-icon">📦</span>
        </div>
        <div class="card-main">
          <span class="card-value">{{ inProgressApproval.count }}</span>
        </div>
      </div>
      <div class="dashboard-card completed-order" @click="goToApprovalCompleted">
        <div class="card-header">
          <span>완료된 주문 결재 요청</span>
          <span class="card-icon">📈</span>
        </div>
        <div class="card-main">
          <span class="card-value">{{ completedOrder.count }}</span>
          <span v-if="typeof completedOrder.diff === 'number'" class="card-diff"
            :class="{
              up: completedOrder.diff > 0,
              down: completedOrder.diff < 0,
              zero: completedOrder.diff === 0
            }"
          >
            {{ completedOrder.diff > 0 ? '+' : '' }}{{ completedOrder.diff }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const props = defineProps({
  inProgressOrder: {
    type: Object,
    default: () => ({ count: 0, diff: 0 })
  },
  inProgressApproval: {
    type: Object,
    default: () => ({ count: 0, diff: 0 })
  },
  completedOrder: {
    type: Object,
    default: () => ({ count: 0, diff: 0 })
  },
  sidebarTab: { type: String, default: 'mine' },
  orderAmountChartData: { type: Array, default: () => [] },
  productOrderChartData: { type: Array, default: () => [] },
  returnProductChartData: { type: Array, default: () => [] }
})
const router = useRouter()
function goToApproval() {
  router.push({ path: '/approval', query: { tab: '결재중' } })
}
function goToApprovalCompleted() {
  router.push({ path: '/approval', query: { tab: '결재완료' } })
}
const now = new Date()
const selectedMonth = ref(now.getMonth() + 1)
</script>

<style scoped>
.dashboard-card-list {
  display: flex;
  gap: 7px;
  margin: 7px 0;
  padding: 0 18px;
}
.dashboard-card {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 16px 0 rgba(64, 102, 250, 0.06);
  padding: 14px;
  display: flex;
  flex-direction: column;
  min-width: 100px;
  min-height: 48px;
  justify-content: space-between;
  cursor: pointer;
  transition: transform 0.18s, box-shadow 0.18s;
}
.dashboard-card:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 4px 18px 0 rgba(64, 102, 250, 0.10);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: #444;
}
.card-icon {
  font-size: 0.95rem;
}
.card-main {
  display: flex;
  align-items: baseline;
  gap: 7px;
  margin: 4px 0 2px 0;
}
.card-value {
  font-size: 1rem;
  font-weight: bold;
  color: #3cb371;
}
.in-progress-approval .card-value {
  color: #1e6be3;
}
.completed-order .card-value {
  color: #a259e6;
}
.card-diff {
  font-size: 0.7rem;
  font-weight: 500;
  margin-left: 8px;
}
.card-diff.up {
  color: #3cb371;
}
.card-diff.down {
  color: #e74c3c;
}
.card-diff.zero {
  color: #888;
  display: none;
}
.card-footer {
  font-size: 0.6rem;
  color: #888;
}
.month-selector-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0 8px 0;
}
.month-select {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid #d0d7e2;
  font-size: 0.9rem;
  background: #f8fafd;
  color: #222;
  outline: none;
  transition: border 0.18s;
}
.month-select:focus {
  border: 1.5px solid #3366FF;
}
</style>
  