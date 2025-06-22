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
      <div v-if="idx < steps.length - 1" class="bar" :class="{ completed: idx < currentStep && !isRejected && !isCanceled, rejected: isRejected && idx === 0, canceled: isCanceled && idx === 0 }"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: String
});

const isRejected = computed(() => props.status === 'REJECTED');
const isCanceled = computed(() => props.status === 'RECEIPT_CANCELED');

const steps = computed(() => [
  { key: 'REVIEWING', label: '검토 중' },
  { key: isRejected.value ? 'REJECTED' : isCanceled.value ? 'RECEIPT_CANCELED' : 'REVIEW_COMPLETED', label: isRejected.value ? '반려' : isCanceled.value ? '접수 취소' : '검토 완료' },
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
  if (key === 'REJECTED') {
    return new URL('@/assets/rejected.png', import.meta.url).href;
  }
  if (key === 'RECEIPT_CANCELED') {
    return new URL('@/assets/REVIEW_CANCEL.png', import.meta.url).href;
  }
  // 파랑/흰색 아이콘 분기 필요시 파일명 규칙에 맞게 수정
  const suffix = isActive ? '-active' : '-inactive';
  switch (key) {
    case 'REVIEWING':
      return new URL(`@/assets/reviewing.png`, import.meta.url).href;
    case 'REVIEW_COMPLETED':
      return new URL(`@/assets/review_completed.png`, import.meta.url).href;
    case 'APPROVED':
      return new URL(`@/assets/approved.png`, import.meta.url).href;
    case 'DELIVERING':
      return new URL(`@/assets/delivering.png`, import.meta.url).href;
    case 'DELIVERED':
      return new URL(`@/assets/delivered.png`, import.meta.url).href;
    default:
      return '';
  }
}
</script>

<style scoped>
.progress-bar {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.04);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  margin: 100px 0 10px 60px;
  background: #fff;
  padding: 32px 0 16px 0;
  max-width: 100%;
  width: 100%;
  margin-left: 30px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
}
.circle {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  transition: background 0.2s;
  position: relative;
  z-index: 1;
}
.icon {
  width: 32px;
  height: 32px;
}
.label {
  font-size: 14px;
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
  width: calc(100% - 28px);
  height: 3px;
  background: #e9ecef;
  z-index: 0;
  border-radius: 2px;
  transform: translateY(-50%);
}
.bar.completed {
  background: #4285F4;
}
.completed .circle {
  background: #4285F4;
}
.completed .label {
  color: #4285F4;
  font-weight: 700;
}
.active .circle {
  background: #4285F4;
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