<template>
  <div class="progress-bar">
    <div
      v-for="(step, idx) in steps"
      :key="step.key"
      class="step"
      :class="{
        active: idx === currentStep && !isRejected,
        inactive: idx !== currentStep && !isRejected,
        rejected: isRejected && idx === 1
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
          v-else
          :src="getIcon(step.key, idx === currentStep && !isRejected)"
          :alt="step.label"
          class="icon"
        />
      </div>
      <div
        class="label"
        :class="{ rejected: isRejected && idx === 1, active: idx === currentStep && !isRejected }"
      >
        {{ step.label }}
      </div>
      <div v-if="idx < steps.length - 1" class="bar"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: String
});

const steps = [
  { key: 'REVIEWING', label: '검토 중' },
  { key: 'REVIEW_COMPLETED', label: '검토 완료' },
  { key: 'APPROVED', label: '결재 완료' },
  { key: 'DELIVERING', label: '배송 준비 중' },
  { key: 'DELIVERED', label: '배송 완료' }
];

const statusToStep = {
  REVIEWING: 0,
  REVIEW_COMPLETED: 1,
  APPROVED: 2,
  DELIVERING: 3,
  DELIVERED: 4,
  REJECTED: 1
};

const currentStep = computed(() => statusToStep[props.status] ?? 0);
const isRejected = computed(() => props.status === 'REJECTED');

function getIcon(key, isActive) {
  if (key === 'REJECTED') {
    return new URL('@/assets/rejected.png', import.meta.url).href;
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
  display: flex;
  align-items: flex-start;
  justify-content: center;
  margin: 100px 0 0 70px;
  background: #fff;
  border-radius: 12px;
  padding: 32px 0 16px 0;
}
.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
}
.circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f1f3f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  transition: background 0.2s;
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
  top: 28px;
  left: 100%;
  width: 120px;
  height: 4px;
  background: #e9ecef;
  z-index: 0;
  /* margin-left: 0; */
  /* margin-right: 0; */
  border-radius: 2px;
}
.active .circle {
  background: #1976d2;
}
.active .label {
  color: #1976d2;
  font-weight: 700;
}
.inactive .circle {
  background: #a1a1a1;
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
</style>