<template>
  <div class="progress-bar">
    <div
      v-for="(step, idx) in steps"
      :key="step.key"
      class="step"
      :class="{
        active: idx === currentStep && !isRejected && !isCanceled,
        completed: idx < currentStep,
        inactive: idx > currentStep,
        rejected: isRejected && idx === currentStep,
        canceled: isCanceled && idx === currentStep
      }"
    >
      <div class="circle">
        <img
          v-if="isRejected && idx === 1"
          :src="getIcon('REJECTED', true)"
          alt="rejected"
          class="icon"
        />
        <img
          v-else-if="isCanceled && idx === 1"
          :src="getIcon('RECEIPT_CANCELED', true)"
          alt="canceled"
          class="icon"
        />
        <img
          v-else
          :src="getIcon(step.key, (idx === currentStep && !isRejected && !isCanceled) || (idx < currentStep && !isRejected && !isCanceled))"
          :alt="step.label"
          class="icon"
        />
      </div>
      <div
        class="label"
        :class="{
          rejected: isRejected && idx === currentStep,
          canceled: isCanceled && idx === currentStep,
          active: idx === currentStep && !isRejected && !isCanceled,
          completed: idx < currentStep
        }"
      >
        {{ step.label }}
      </div>
      <div
        v-if="idx < steps.length - 1"
        class="bar"
        :class="{
          completed: idx < currentStep && !isRejected && !isCanceled,
          rejected: isRejected && idx === 0,
          canceled: isCanceled && idx === 0
        }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// 이미지 import (Vite에서 경로 깨짐 방지용)
import ReviewingIcon from '@/assets/REVIEWING.png'
import ReviewCompletedIcon from '@/assets/REVIEW_COMPLETED.png';
import ApprovedIcon from '@/assets/APPROVED.png';
import DeliveringIcon from '@/assets/DELIVERING.png';
import DeliveredIcon from '@/assets/DELIVERED.png';
import RejectedIcon from '@/assets/REJECTED.png';
import ReceiptCanceledIcon from '@/assets/REVIEW_CANCEL.png';

const props = defineProps({
  status: String
});

const isRejected = computed(() => props.status === 'REJECTED');
const isCanceled = computed(() => props.status === 'RECEIPT_CANCELED');

const steps = computed(() => [
  { key: 'REVIEWING', label: '검토 중' },
  {
    key: isRejected.value
      ? 'REJECTED'
      : isCanceled.value
      ? 'RECEIPT_CANCELED'
      : 'REVIEW_COMPLETED',
    label: isRejected.value
      ? '반려'
      : isCanceled.value
      ? '접수 취소'
      : '검토 완료'
  },
  { key: 'APPROVED', label: '결재 완료' },
  { key: 'DELIVERING', label: '배송 중' },
  { key: 'DELIVERED', label: '배송 완료' }
]);

const statusToStep = {
  REVIEWING: 0,
  REVIEW_COMPLETED: 1,
  APPROVED: 2,
  DELIVERING: 3,
  DELIVERED: 4,
  REJECTED: 1,
  RECEIPT_CANCELED: 1
};

const currentStep = computed(() => statusToStep[props.status] ?? 0);

function getIcon(key, isActive) {
  switch (key) {
    case 'REVIEWING':
      return ReviewingIcon;
    case 'REVIEW_COMPLETED':
      return ReviewCompletedIcon;
    case 'APPROVED':
      return ApprovedIcon;
    case 'DELIVERING':
      return DeliveringIcon;
    case 'DELIVERED':
      return DeliveredIcon;
    case 'REJECTED':
      return RejectedIcon;
    case 'RECEIPT_CANCELED':
      return ReceiptCanceledIcon;
    default:
      return '';
  }
}
</script>

<style scoped>
.progress-bar {
  border: 1px solid #e9ecef;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.04);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  margin: 20px 0 10px 0;
  background: #fff;
  padding: 16px 0 8px 0;
  max-width: 100%;
  width: 100%;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
}
.circle {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  transition: background 0.2s;
  position: relative;
  z-index: 1;
}
.icon {
  width: 24px;
  height: 24px;
}
.label {
  font-size: 11px;
  color: #b0b8c1;
  font-weight: 500;
  margin-bottom: 0;
  margin-top: 0;
  text-align: center;
}
.bar {
  position: absolute;
  top: 40%;
  left: 50%;
  width: calc(100% - 16px);
  height: 2px;
  background: #e9ecef;
  z-index: 0;
  border-radius: 2px;
  transform: translateY(-50%);
}
.bar.completed {
  background: #4285f4;
}
.completed .circle {
  background: #4285f4;
}
.completed .label {
  color: #4285f4;
  font-weight: 700;
}
.active .circle {
  background: #4285f4;
}
.active .label {
  color: #1976d2;
  font-weight: 700;
}
.inactive .circle {
  background: #c9c9c9;
}
.inactive .label {
  color: #a1a1a1;
}
.rejected .circle {
  background: #ff5252;
}
.rejected .label {
  color: #ff5252;
  font-weight: 700;
}
.bar.rejected {
  background: #ff5252;
}
.canceled .circle {
  background: #ff5252;
}
.canceled .label {
  color: #ff5252;
  font-weight: 700;
}
.bar.canceled {
  background: #ff5252;
}
</style>
