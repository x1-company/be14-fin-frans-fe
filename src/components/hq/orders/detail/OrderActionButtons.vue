<template>
    <div class="order-actions">
      <button
        v-if="!isRejected"
        class="btn reject"
        @click="showRejectModal = true"
      >반려</button>
      <button
        v-if="!isRejected && !isReviewed"
        class="btn approve"
        @click="showModal = true"
      >검토 완료</button>
      <button
        v-if="!isRejected && isReviewed"
        class="btn cancel-review"
        @click="handleCancelReview"
      >
        <span class="icon">&#8634;</span> 검토 취소
      </button>
      <button class="btn print"><span class="icon">&#128424;</span> 주문서 출력</button>
      <button class="btn close"><span class="icon">&#10005;</span> 닫기</button>
      <ConfirmModal
        :visible="showModal"
        @confirm="handleConfirm"
        @cancel="showModal = false"
      />
      <RejectModal
        :visible="showRejectModal"
        @reject="handleReject"
        @cancel="showRejectModal = false"
      />
    </div>
  </template>

<script setup>
import { ref } from 'vue';
import ConfirmModal from '@/components/hq/orders/modal/ConfirmModal.vue';
import RejectModal from '@/components/hq/orders/modal/RejectModal.vue';
import api from '@/lib/api';

const props = defineProps({
  orderId: {
    type: [String, Number],
    required: true
  },
  rejectedReason: String // 부모에서 내려받음
});

const showModal = ref(false);
const showRejectModal = ref(false);
const isReviewed = ref(false);  // 검토 완료
const isRejected = ref(!!props.rejectedReason);

// 최초 상태를 부모에서 받아오고 싶으면 watch/props로 동기화
// 예: const isReviewed = computed(() => props.status === 'REVIEW_COMPLETED');

async function handleConfirm() {
  showModal.value = false;
  try {
    const response = await api.patch(`/api/hq/orders/${props.orderId}/review-complete`);
    console.log(response);
    isReviewed.value = true;

  } catch (e) {
    console.log(e.data);
    alert('검토 완료 처리에 실패했습니다.');
  }
}

async function handleCancelReview() {
  try {
    await api.patch(`/api/hq/orders/${props.orderId}/review-cancel`);
    isReviewed.value = false;

  } catch (e) {
    alert('검토 취소 처리에 실패했습니다.');
  }
}

async function handleReject(reason) {
  showRejectModal.value = false;
  try {
    await api.patch(`/api/hq/orders/${props.orderId}/reject`, { reason });
    isRejected.value = true;

  } catch (e) {
    alert('반려 처리에 실패했습니다.');
  }
}
</script>

<style scoped>
.order-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin: 30px 0 0 0;
}
.btn {
  padding: 8px 18px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border 0.15s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.btn.reject {
  color: #d32f2f;
  border-color: #ffd6d6;
}
.btn.approve {
  color: #388e3c;
  border-color: #c8e6c9;
}
.btn.cancel-review {
  color: #d32f2f;
  border-color: #ffd6d6;
}
.btn.edit,
.btn.print,
.btn.close {
  color: #1976d2;
  border-color: #bbdefb;
}
.btn:hover {
  background: #f5faff;
}
.icon {
  font-size: 18px;
  vertical-align: middle;
}
</style>