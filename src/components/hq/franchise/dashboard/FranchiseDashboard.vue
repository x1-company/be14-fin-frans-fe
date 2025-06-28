<template>
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
    <div class="dashboard-card completed-order">
      <div class="card-header">
        <span>완료된 주문/반품 이력</span>
        <span class="card-icon">📈</span>
      </div>
      <div class="card-main">
        <span class="card-value">{{ completedOrder.count }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
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
  }
})
const router = useRouter()
function goToApproval() {
  router.push('/approval')
}
</script>

<style scoped>
.dashboard-card-list {
  display: flex;
  gap: 24px;
  margin: 32px 0;
}
.dashboard-card {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 16px 0 rgba(64, 102, 250, 0.06);
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  min-width: 220px;
  min-height: 120px;
  justify-content: space-between;
  cursor: pointer;
  transition: transform 0.18s, box-shadow 0.18s;
}
.dashboard-card:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: 0 4px 18px 0 rgba(64, 102, 250, 0.10);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: #444;
}
.card-icon {
  font-size: 1.5rem;
}
.card-main {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin: 16px 0 8px 0;
}
.card-value {
  font-size: 2.2rem;
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
  font-size: 1.1rem;
  font-weight: 500;
  color: #888;
}
.card-diff.up {
  color: #3cb371;
}
.card-diff.down {
  color: #e74c3c;
}
.card-footer {
  font-size: 0.95rem;
  color: #888;
}
</style>
  