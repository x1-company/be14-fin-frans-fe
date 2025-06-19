<template>
  <div class="card order-card">
    <div class="order-title">
      <span class="order-icon">🛒</span>
      주문 정보
    </div>

    <!-- 주문번호 & 총 주문금액 박스 -->
    <div class="info-box-row">
      <div class="info-box blue">
        <span class="label"># 주문 번호</span>
        <span class="value">{{ order.code || '-' }}</span>
      </div>
      <div class="info-box green">
        <span class="label">💲 총 주문 금액</span>
        <span class="value">{{ (order.totalAmount ?? 0).toLocaleString() }}원</span>
      </div>
    </div>

    <!-- 날짜, 수량, 상태 -->
    <div class="info-row">
      <div><span class="sub-label">주문일</span> <span>{{ order.orderDate || '-' }}</span></div>
      <div><span class="sub-label">총 자재 수량</span> <span>{{ order.totalQuantity ?? '-' }}</span></div>
      <div><span class="sub-label">주문 상태</span> <span class="order-status">{{ order.status || '-' }}</span></div>
    </div>

    <!-- 반려 사유 -->
    <div class="reject-box" v-if="order.rejectedReason">
      <div class="reject-title">반려 사유</div>
      <div class="reject-reason">{{ order.rejectedReason }}</div>
    </div>
  </div>
</template>


<script setup>
const props = defineProps({
  order: Object
});
</script>

<style scoped>
.card.order-card {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.04);
  padding: 32px 24px;
  margin: 20px 0 10px 60px;
  margin-bottom: 24px;
  background: #fff;
}

.order-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-box-row {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.info-box {
  flex: 1;
  border-radius: 8px;
  padding: 16px;
  color: #222;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 15px;
}

.info-box .label {
  font-weight: 500;
  color: #3b3b3b;
}

.info-box .value {
  font-weight: 700;
  font-size: 16px;
}

.info-box.blue {
  background-color: #eef5ff;
  color: #1976d2;
}

.info-box.green {
  background-color: #e9f9ee;
  color: #388e3c;
}

.info-row {
  display: flex;
  gap: 48px;
  font-size: 15px;
  margin-bottom: 24px;
}

.sub-label {
  color: #888;
  font-weight: 500;
  margin-right: 8px;
}

.order-status {
  font-weight: 700;
  color: #1976d2;
}

.reject-box {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  color: #333;
}

.reject-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: #666;
}

.reject-reason {
  color: #444;
}

</style>