<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-card">
      <div class="orderlist-header">
        <h2 class="orderlist-title">반품 문서 지정</h2>
        <div class="orderlist-select-all">
          <label class="orderlist-select-all-label" @click="selectAllRows">
            전체 선택 ({{ selectedItems.length }}/{{ returnData.length }})
          </label>
          <span class="orderlist-selected-count"
            >{{ selectedItems.length }}개 선택됨</span
          >
        </div>
      </div>
      <div class="orderlist-table-container">
        <div class="orderlist-table-header">
          <div class="col-no">No.</div>
          <div class="col-code">문서번호</div>
          <div class="col-franchise">가맹점명</div>
          <div class="col-date">반품일</div>
          <div class="col-desc">반품사유</div>
          <div class="col-amount">금액</div>
        </div>
        <div v-if="loading" class="orderlist-loading">로딩중...</div>
        <div v-else-if="error" class="orderlist-error">{{ error }}</div>
        <div v-else-if="returnData.length === 0" class="orderlist-empty"
          >데이터가 없습니다.</div
        >
        <div v-else>
          <div
            v-for="(item, index) in returnData"
            :key="item.code"
            class="orderlist-table-row"
            :class="{ selected: selectedItems.includes(item.code) }"
            @click="toggleRow(item.code)"
          >
            <div class="col-no">{{ index + 1 }}</div>
            <div class="col-code">{{ item.code }}</div>
            <div class="col-franchise">{{
              item.franchiseName || item.name
            }}</div>
            <div class="col-date">{{ formatDate(item.createdAt) }}</div>
            <div class="col-desc">{{ item.description }}</div>
            <div class="col-amount">₩{{ formatAmount(item.totalAmount) }}</div>
          </div>
        </div>
      </div>
      <div class="orderlist-actions">
        <button class="orderlist-cancel" @click="emit('close')">취소</button>
        <button class="orderlist-register" @click="handleRegister">
          등록 ({{ selectedItems.length }})
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import api from "@/lib/api";

const emit = defineEmits(["close", "select-documents"]);

const returnData = ref([]);
const selectedItems = ref([]);
const loading = ref(false);
const error = ref(null);

// API 호출 함수
const fetchReturnData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const { data } = await api.get("/api/hq/franchise/return/reviewCompleted");
    returnData.value = data;
  } catch (err) {
    error.value = err.message;
    returnData.value = [];
  } finally {
    loading.value = false;
  }
};

const toggleRow = (code) => {
  const idx = selectedItems.value.indexOf(code);
  if (idx === -1) {
    selectedItems.value.push(code);
  } else {
    selectedItems.value.splice(idx, 1);
  }
};

const selectAllRows = () => {
  if (selectedItems.value.length === returnData.value.length) {
    selectedItems.value = [];
  } else {
    selectedItems.value = returnData.value.map((item) => item.code);
  }
};

watch(
  selectedItems,
  (newVal) => {
    // 전체 선택 상태 동기화
  },
  { deep: true }
);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

const formatAmount = (amount) => {
  return new Intl.NumberFormat("ko-KR").format(amount);
};

const handleCancel = () => {
  emit("close");
};

const handleRegister = () => {
  const selectedDocuments = returnData.value.filter((item) =>
    selectedItems.value.includes(item.code)
  );
  emit("select-documents", selectedDocuments);
};

onMounted(() => {
  fetchReturnData();
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  max-width: 900px;
  width: 100%;
  min-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 0;
}

.orderlist-header {
  padding: 24px 24px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.orderlist-title {
  font-size: 24px;
  font-weight: bold;
  color: #000000;
  margin: 0 0 32px 0;
}

.orderlist-select-all {
  display: flex;
  align-items: center;
  gap: 16px;
}

.orderlist-select-all-label {
  color: #000000;
  font-weight: 500;
  cursor: pointer;
}

.orderlist-selected-count {
  color: #414a73;
  font-size: 14px;
}

.orderlist-table-container {
  background-color: #e3effb;
  border-radius: 8px;
  overflow: hidden;
}

.orderlist-table-header {
  display: grid;
  grid-template-columns: 0.7fr 2.2fr 2fr 1.5fr 2fr 0.7fr;
  gap: 12px;
  padding: 16px;
  background-color: #e3effb;
  border-bottom: 1px solid #d1d5db;
}

.orderlist-table-header > div {
  font-weight: 600;
  color: #414a73;
}

.orderlist-table-row {
  display: grid;
  grid-template-columns: 0.7fr 2.2fr 2fr 1.5fr 2fr 0.7fr;
  gap: 12px;
  padding: 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.orderlist-table-row:hover {
  background-color: #f9fafb;
}

.orderlist-table-row.selected {
  background-color: #e3effb;
}

.orderlist-loading,
.orderlist-error,
.orderlist-empty {
  padding: 40px;
  text-align: center;
  color: #000000;
  background-color: #ffffff;
}

.orderlist-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
}

.orderlist-cancel {
  padding: 8px 24px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  color: #414a73;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.orderlist-cancel:hover {
  background-color: #f9fafb;
}

.orderlist-register {
  padding: 8px 24px;
  border: none;
  background-color: #4368fa;
  color: #ffffff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.orderlist-register:hover {
  background-color: #3557e8;
}

.col-no {
  text-align: center;
  color: #000000;
  font-weight: 500;
}

.col-code {
  text-align: left;
  color: #000000;
}

.col-franchise {
  text-align: left;
  color: #000000;
}

.col-date {
  text-align: left;
  color: #000000;
}

.col-amount {
  text-align: left;
  color: #000000;
  font-weight: 500;
}

.col-desc {
  text-align: left;
  color: #000000;
}
</style>
