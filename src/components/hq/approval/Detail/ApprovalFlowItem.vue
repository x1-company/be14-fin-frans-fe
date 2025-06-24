<template>
  <div class="flow-item">
    <div class="person-type-label">{{ typeLabel }}</div>
    <div class="status-icon" :class="statusClass">
      <img
        v-if="statusIconSrc"
        :src="statusIconSrc"
        alt="status icon"
        class="status-img"
      />
    </div>
    <div class="status-label">{{ statusLabel }}</div>
    <div class="person-info">
      <div class="person-name">{{ person.name }}</div>
      <div class="person-position">{{ person.position }}</div>
      <div class="person-department">{{ person.department }}</div>
      <div v-if="person.processedAt" class="process-time">
        {{ formatDateTime(person.processedAt) }}
      </div>
    </div>
    <div
      v-if="!isLast"
      class="connection-line"
      :style="{ background: lineColor || '#dee2e6' }"
    ></div>
  </div>
</template>
<script setup>
import { computed, inject } from "vue";
import reviewingImg from "@/assets/REVIEWING.png";
import reviewCompletedImg from "@/assets/REVIEW_COMPLETED.png";
import reviewCancelImg from "@/assets/REVIEW_CANCEL.png";
import rejectedImg from "@/assets/REJECTED.png";
import expectedImg from "@/assets/EXPECTED.png";

const props = defineProps({
  person: Object,
  isLast: Boolean,
  lineColor: String,
  index: Number, // index in the flow
  flow: Array, // the full flow array
});

const statusClass = computed(() => {
  return props.person.status;
});
const statusIconSrc = computed(() => {
  if (props.person.status === "WAITING") return reviewingImg;
  if (props.person.status === "EXPECTED") return expectedImg;
  if (props.person.status === "APPROVED") return reviewCompletedImg;
  if (props.person.status === "REJECTED") return reviewCancelImg;
  return rejectedImg;
});

// Find the first WAITING in the flow
const isCurrentTurn = computed(() => {
  if (!props.flow) return false;
  const firstWaitingIdx = props.flow.findIndex((p) => p.status === "WAITING");
  return props.index === firstWaitingIdx;
});

const statusLabel = computed(() => {
  if (isCurrentTurn.value && props.person.status === "WAITING")
    return "검토 중";
  if (props.person.status === "APPROVED") return "검토 완료";
  if (props.person.status === "REJECTED") return "반려";
  if (props.person.status === "WAITING") return "대기 중";
  if (props.person.status === "EXPECTED") return "예정";
  return "";
});
const typeLabel = computed(() => {
  if (props.person.type === "approver") return "결재자";
  if (props.person.type === "collaborator") return "협조자";
  return "";
});
const iconComponent = computed(() => {
  if (props.person.type === "approver") return "AppIcon";
  if (props.person.type === "collaborator") return "CollabIcon";
  return "UserIcon";
});
const formatDateTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}.${month}.${day} ${hours}:${minutes}`;
};
</script>
<script>
export default {
  components: {
    CollabIcon: {
      template:
        '<svg width="80" height="80" fill="none" stroke="#a78bfa"><circle cx="40" cy="40" r="36" stroke-width="6"/><path d="M40 26v28l16 12" stroke-width="6"/></svg>',
    },
    AppIcon: {
      template:
        '<svg width="80" height="80" fill="none" stroke="#34d399"><circle cx="40" cy="40" r="36" stroke-width="6"/><polyline points="20,40 40,60 60,28" stroke-width="6"/></svg>',
    },
    UserIcon: {
      template:
        '<svg width="80" height="80" fill="none" stroke="#bbb"><circle cx="40" cy="30" r="20" stroke-width="6"/><path d="M10 74c0-16 30-16 30-16s30 0 30 16" stroke-width="6"/></svg>',
    },
  },
};
</script>
<style scoped>
.flow-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1 1 0;
  min-width: 120px;
}
.person-type-label {
  font-size: 13px;
  font-weight: 600;
  color: #6f42c1;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
}
.type-icon {
  margin-bottom: 4px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.status-icon {
  position: relative;
  z-index: 1;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  background: #6c757d;
}
.status-icon.WAITING {
  background: #3888ec;
}
.status-icon.EXPECTED {
  background: #6c757d;
}
.status-icon.APPROVED {
  background: #28a745;
}
.status-icon.REJECTED {
  background: #dc3545;
}
.status-img {
  width: 30px;
  height: 30px;
  object-fit: contain;
  display: block;
}
.status-label {
  font-size: 15px;
  font-weight: 700;
  color: #212529;
  margin-bottom: 6px;
  margin-top: 2px;
}
.connection-line {
  position: absolute;
  top: 50%;
  left: 100%;
  width: 40px;
  height: 2px;
  background: #dee2e6;
  transform: translateY(-50%);
  z-index: 1;
}
.person-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 110px;
  justify-content: flex-start;
}
.person-name {
  font-size: 17px;
  font-weight: 700;
  color: #212529;
}
.person-position,
.person-department {
  font-size: 15px;
  color: #6c757d;
  margin-bottom: 2px;
}
.process-time {
  font-size: 13px;
  color: #6c757d;
  margin-top: 8px;
}
</style>
