<template>
  <div class="info-form">
    <!-- 대시보드 카드 섹션 -->
    <div class="info-section dashboard-section">
      <div class="dashboard-cards">
        <div v-for="(metric, idx) in metrics" :key="idx" class="dashboard-card">
          <div class="dashboard-card__label">{{ metric.label }}</div>
          <div :class="['dashboard-card__value', metric.color]">{{ metric.value }}</div>
        </div>
      </div>
    </div>

    <!-- 최근 입고된 자재 현황 -->
    <div class="info-section">
      <div class="info-section__header">
        <span>최근 입고된 자재 현황</span>
        <button class="info-section__view-all">전체보기</button>
      </div>
      <div class="inventory-list">
        <div v-for="(item, idx) in inventoryData" :key="idx" class="inventory-item">
          <div class="item-main">
            <span class="item-dot" :style="{ background: item.color }"></span>
            <span class="item-category">{{ item.category }}</span>
            <span class="item-subcategory">{{ item.subcategory }}</span>
            <span class="item-value">{{ item.value }}</span>
          </div>
          <div class="item-progress">
            <div class="progress-bar-bg">
              <div class="progress-bar" :style="{ width: item.progress + '%', background: item.color }"></div>
            </div>
            <span class="progress-label">{{ item.progress }}%</span>
          </div>
          <div class="item-date">5일전에 입고됨</div>
        </div>
      </div>
    </div>

    <!-- 최근 입출고 현황 & 재고 알림 -->
    <div class="info-section bottom-section">
      <div class="bottom-grid">
        <div class="bottom-col">
          <div class="bottom-title">최근 입출고 현황</div>
          <div class="inout-list">
            <div class="inout-item in">
              <span>양념소스 입고</span>
              <span class="date">2025-01-23 14:30</span>
              <span class="plus">+50</span>
            </div>
            <div class="inout-item out">
              <span>냉동닭 출고</span>
              <span class="date">2025-01-23 12:15</span>
              <span class="minus">-30</span>
            </div>
            <div class="inout-item in">
              <span>치즈 입고</span>
              <span class="date">2025-01-23 10:45</span>
              <span class="plus">+25</span>
            </div>
          </div>
        </div>
        <div class="bottom-col">
          <div class="bottom-title">재고 알림</div>
          <div class="alert-list">
            <div class="alert-item warn">
              <span>냉동닭 재고 부족</span>
              <span class="desc">현재 재고: 15개 (최소 재고: 50개)</span>
            </div>
            <div class="alert-item error">
              <span>조리닭 재고 부족</span>
              <span class="desc">현재 재고: 7개 (최소 재고: 30개)</span>
            </div>
            <div class="alert-item info">
              <span>양념소스 입고 예정</span>
              <span class="desc">예정일: 2025-01-25</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const metrics = ref([
  { label: "진행중인 발주 요청", value: "3", color: "blue" },
  { label: "진행중인 검수 요청", value: "1", color: "green" },
  { label: "재고부족 자재 건", value: "5", color: "orange" },
  { label: "한달간 발주/납품 이력", value: "200", color: "purple" },
]);
const inventoryData = ref([
  { category: "상온", subcategory: "양념소스", value: 723, progress: 30, color: "#22c55e" },
  { category: "냉장", subcategory: "치즈", value: 723, progress: 30, color: "#3b82f6" },
  { category: "상온", subcategory: "양념소스", value: 723, progress: 30, color: "#22c55e" },
  { category: "냉동", subcategory: "냉동닭", value: 723, progress: 30, color: "#2563eb" },
  { category: "기타", subcategory: "포장재", value: 723, progress: 30, color: "#64748b" },
  { category: "냉동", subcategory: "냉동닭", value: 723, progress: 30, color: "#2563eb" },
]);
</script>

<style scoped>
.info-form {
  background: #fff;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 8px 0 rgba(64, 102, 250, 0.03);
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.info-section {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  padding: 24px 32px;
  margin-bottom: 0;
}
.dashboard-section {
  margin-bottom: 0;
  box-shadow: none;
  background: transparent;
  padding: 0;
}
.dashboard-cards {
  display: flex;
  gap: 24px;
}
.dashboard-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  padding: 24px 32px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.dashboard-card__label {
  font-size: 1rem;
  color: #666;
  margin-bottom: 8px;
}
.dashboard-card__value {
  font-size: 2.2rem;
  font-weight: bold;
}
.dashboard-card__value.blue { color: #2563eb; }
.dashboard-card__value.green { color: #22c55e; }
.dashboard-card__value.orange { color: #f59e42; }
.dashboard-card__value.purple { color: #a78bfa; }
.info-section__header {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  font-weight: bold;
  color: #222;
  margin-bottom: 20px;
  gap: 10px;
}
.info-section__view-all {
  background: none;
  border: 1px solid #4066fa;
  color: #4066fa;
  padding: 6px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  margin-left: auto;
  transition: background-color 0.2s, border-color 0.2s;
}
.info-section__view-all:hover {
  background-color: #4066fa10;
  border-color: #4066fa;
}
.inventory-list {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
}
.inventory-item {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 18px 20px;
  flex: 1 1 260px;
  min-width: 220px;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.item-main {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.05rem;
}
.item-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.item-category {
  font-weight: 500;
}
.item-subcategory {
  color: #666;
  margin-left: 4px;
}
.item-value {
  margin-left: auto;
  font-size: 1.2rem;
  font-weight: bold;
}
.item-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}
.progress-bar-bg {
  background: #e5e7eb;
  border-radius: 6px;
  width: 80px;
  height: 8px;
  overflow: hidden;
}
.progress-bar {
  height: 8px;
  border-radius: 6px;
}
.progress-label {
  font-size: 0.9rem;
  color: #888;
}
.item-date {
  text-align: right;
  color: #aaa;
  font-size: 0.92rem;
}
.bottom-section {
  margin-top: 0;
  padding-top: 0;
  box-shadow: none;
  background: transparent;
}
.bottom-grid {
  display: flex;
  gap: 24px;
}
.bottom-col {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  padding: 24px 32px;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.bottom-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 18px;
}
.inout-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.inout-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1rem;
  padding: 8px 0;
}
.inout-item.in .plus {
  color: #22c55e;
  font-weight: bold;
}
.inout-item.out .minus {
  color: #ef4444;
  font-weight: bold;
}
.inout-item .date {
  color: #888;
  font-size: 0.95rem;
  margin-left: auto;
  margin-right: 8px;
}
.alert-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.alert-item {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 1rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.alert-item.warn {
  background: #fff7ed;
  color: #f59e42;
}
.alert-item.error {
  background: #fef2f2;
  color: #ef4444;
}
.alert-item.info {
  background: #f1f5ff;
  color: #2563eb;
}
.alert-item .desc {
  font-size: 0.95rem;
  color: #888;
}
</style> 