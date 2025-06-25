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
import { ref, watch, onMounted } from "vue";

const emit = defineEmits(["type-selected"]);

const props = defineProps({
  initialType: { type: String, default: "ORDER" },
  isEditMode: { type: Boolean, default: false },
});

const selectedType = ref(props.initialType);

// 초기 타입 설정
onMounted(() => {
  if (props.initialType && props.initialType !== selectedType.value) {
    selectedType.value = props.initialType;
    console.log("ApprovalTypeSelector - initial type set:", props.initialType);
  }
});

watch(
  () => props.initialType,
  (newType) => {
    if (newType && newType !== selectedType.value) {
      selectedType.value = newType;
      console.log("ApprovalTypeSelector - type changed to:", newType);
    }
  },
  { immediate: true }
);

// 결재 유형 옵션 (순서: 주문결재, 반품결재, 발주결재)
const approvalTypes = ref([
  { value: "ORDER", label: "주문 결재", color: "#3b82f6", icon: "📋" },
  { value: "RETURN", label: "반품 결재", color: "#f59e0b", icon: "🔄" },
  { value: "PURCHASE", label: "발주 결재", color: "#10b981", icon: "🛒" },
]);

const selectType = (type) => {
  // 수정 모드에서는 타입 변경을 제한할 수 있음
  if (props.isEditMode) {
    console.log("ApprovalTypeSelector - type change blocked in edit mode");
    return;
  }

  selectedType.value = type;
  console.log("ApprovalTypeSelector - type selected:", type);
  emit("type-selected", type);
};
</script>

<style scoped>
.form-section {
  margin-bottom: 40px;
  border: none;
  border-radius: 0;
  padding: 0 0 24px 0;
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 18px;
  color: #222;
}

.approval-type-cards {
  display: flex;
  gap: 12px;
}

.approval-type-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 20px;
  border: 1.5px solid #e5e7eb;
  border-radius: 7px;
  cursor: pointer;
  background: none;
  transition: border 0.18s, background 0.18s;
  min-width: 120px;
  gap: 10px;
}

.approval-type-card:hover {
  border-color: #b6b6b6;
  background: #f8fafc;
}

.approval-type-card.active {
  border-color: #3b82f6;
  background: #f3f7fd;
}

.card-icon {
  font-size: 18px;
  margin-bottom: 0;
  margin-right: 6px;
}

.card-label {
  font-weight: 500;
  color: #222;
  font-size: 15px;
}
</style>
