<template>
  <div class="flow-item">
    <div class="person-type-label">{{ typeLabel }}</div>
    <div class="status-icon" :class="statusClass">
      <!-- 상태별 SVG 아이콘 (예시: 체크, 대기 등) -->
      <svg
        v-if="person.status === 'completed'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <polyline points="20,6 9,17 4,12" />
      </svg>
      <svg
        v-else-if="person.status === 'pending'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10" />
      </svg>
    </div>
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
import { computed } from "vue";
const props = defineProps({
  person: Object,
  isLast: Boolean,
  lineColor: String,
});
const statusClass = computed(() => {
  return props.person.status;
});
const typeLabel = computed(() => {
  if (props.person.type === "approver") return "결재자";
  if (props.person.type === "collaborator") return "협조자";
  return "";
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
.status-icon {
  position: relative;
  z-index: 1;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
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
  margin-bottom: 2px;
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
