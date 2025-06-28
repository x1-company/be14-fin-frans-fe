<template>
  <div class="progress-bar">
    <div
      v-for="(step, idx) in steps"
      :key="step.key"
      class="step"
      :class="{
        active: idx === currentStep && !isRejected,
        completed: idx < currentStep,
        inactive: idx > currentStep,
        rejected: isRejected && idx === currentStep
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
          :src="getIcon(step.key, (idx === currentStep && !isRejected) || (idx < currentStep && !isRejected))"
          :alt="step.label"
          class="icon"
        />
      </div>
      <div
        class="label"
        :class="{
          rejected: isRejected && idx === currentStep,
          active: idx === currentStep && !isRejected,
          completed: idx < currentStep
        }"
      >
        {{ step.label }}
      </div>
      <div
        v-if="idx < steps.length - 1"
        class="bar"
        :class="{
          completed: idx < currentStep && !isRejected,
          rejected: isRejected && idx === 0
        }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import waitingForReceiptImg from '@/assets/waiting_for_receipt.png';
import reviewCompletedImg from '@/assets/review_completed.png';
import approvedImg from '@/assets/approved.png';
import pickingUpImg from '@/assets/picking_up.png';
import pickedUpImg from '@/assets/picked_up.png';
import completedImg from '@/assets/completed.png';
import rejectedImg from '@/assets/rejected.png';

const props = defineProps({
  status: String
});

const isRejected = computed(() => props.status === 'REJECTED');

const statusLabels = {
  WAITING_FOR_RECEIPT: '접수 대기',
  REVIEW_COMPLETED: '검토 완료',
  APPROVED: '결재 완료',
  PICKING_UP: '반품 수거 중',
  PICKED_UP: '반품 수거 완료',
  REJECTED: '반려',
  COMPLETED: '반품 완료'
};

const steps = computed(() => [
  { key: 'WAITING_FOR_RECEIPT', label: statusLabels.WAITING_FOR_RECEIPT },
  { key: isRejected.value ? 'REJECTED' : 'REVIEW_COMPLETED', label: isRejected.value ? statusLabels.REJECTED : statusLabels.REVIEW_COMPLETED },
  { key: 'APPROVED', label: statusLabels.APPROVED },
  { key: 'PICKING_UP', label: statusLabels.PICKING_UP },
  { key: 'PICKED_UP', label: statusLabels.PICKED_UP },
  { key: 'COMPLETED', label: statusLabels.COMPLETED }
]);

const statusToStep = {
  WAITING_FOR_RECEIPT: 0,
  REVIEW_COMPLETED: 1,
  APPROVED: 2,
  PICKING_UP: 3,
  PICKED_UP: 4,
  COMPLETED: 5,
  REJECTED: 1
};

const currentStep = computed(() => statusToStep[props.status] ?? 0);

function getIcon(key, isActive) {
  switch (key) {
    case 'WAITING_FOR_RECEIPT':
      return waitingForReceiptImg;
    case 'REVIEW_COMPLETED':
      return reviewCompletedImg;
    case 'APPROVED':
      return approvedImg;
    case 'PICKING_UP':
      return pickingUpImg;
    case 'PICKED_UP':
      return pickedUpImg;
    case 'COMPLETED':
      return completedImg;
    case 'REJECTED':
      return rejectedImg;
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
</style>
