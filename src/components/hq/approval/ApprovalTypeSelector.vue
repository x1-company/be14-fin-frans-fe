<template>
  <div class="form-section">
    <h3 class="section-title">결재 유형 선택</h3>
    <div class="approval-type-cards">
      <div
        v-for="type in approvalTypes"
        :key="type.value"
        :class="['approval-type-card', { active: selectedType === type.value }]"
        @click="selectType(type.value)"
      >
        <div class="card-icon" :style="{ color: type.color }">
          {{ type.icon }}
        </div>
        <span class="card-label">{{ type.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["type-selected"]);

const selectedType = ref("ORDER");

// 결재 유형 옵션
const approvalTypes = ref([
  { value: "ORDER", label: "주문 결재", color: "#3b82f6", icon: "📋" },
  {
    value: "PURCHASE",
    label: "발주 결재",
    color: "#10b981",
    icon: "🛒",
  },
  { value: "RETURN", label: "반품 결재", color: "#f59e0b", icon: "🔄" },
]);

const selectType = (type) => {
  selectedType.value = type;
  emit("type-selected", type);
};
</script>

<style scoped>
.form-section {
  margin-bottom: 40px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #1f2937;
}

/* 결재 유형 선택 */
.approval-type-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.approval-type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.approval-type-card:hover {
  border-color: #d1d5db;
}

.approval-type-card.active {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.card-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.card-label {
  font-weight: 500;
  color: #374151;
}
</style>
