<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-card">
      <div class="orderlist-header">
        <h2 class="orderlist-title">발주 문서 지정</h2>
        <div class="orderlist-select-all">
          <label class="orderlist-select-all-label" @click="selectAllRows">
            전체 선택 ({{ selectedItems.length }}/{{ purchaseData.length }})
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
          <div class="col-date">발주일</div>
          <div class="col-store">공급처명</div>
          <div class="col-amount">금액</div>
        </div>
        <div v-if="loading" class="orderlist-loading"
          >데이터를 불러오는 중...</div
        >
        <div v-else-if="purchaseData.length === 0" class="orderlist-no-data"
          >발주 데이터가 없습니다.</div
        >
        <div v-else>
          <div
            v-for="(item, index) in purchaseData"
            :key="item.code"
            class="orderlist-table-row"
            :class="{ selected: selectedItems.includes(item.code) }"
            @click="toggleRow(item.code)"
            style="cursor: pointer"
          >
            <div class="col-no">
              <span class="orderlist-row-number">{{ index + 1 }}</span>
            </div>
            <div class="col-code">{{ item.code }}</div>
            <div class="col-date">{{ formatDate(item.createdAt) }}</div>
            <div class="col-store">{{ item.supplierName }}</div>
            <div class="col-amount">₩{{ formatAmount(item.totalAmount) }}</div>
          </div>
        </div>
      </div>
      <div class="orderlist-action-buttons">
        <button class="orderlist-btn-cancel" @click="handleCancel">취소</button>
        <button class="orderlist-btn-register" @click="handleRegister"
          >등록 ({{ selectedItems.length }})</button
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import api from "@/lib/api";
const emit = defineEmits(["close", "select-documents"]);

const purchaseData = ref([]);
const selectedItems = ref([]);
const loading = ref(false);
const error = ref(null);

const fetchPurchaseData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const { data } = await api.get("/api/hq/purchaseOrder/requestPending");
    purchaseData.value = data;
  } catch (err) {
    error.value = err.message;
    purchaseData.value = [];
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
  if (selectedItems.value.length === purchaseData.value.length) {
    selectedItems.value = [];
  } else {
    selectedItems.value = purchaseData.value.map((item) => item.code);
  }
};

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
  const selectedDocuments = purchaseData.value.filter((item) =>
    selectedItems.value.includes(item.code)
  );
  emit("select-documents", selectedDocuments);
};

onMounted(() => {
  fetchPurchaseData();
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
  grid-template-columns: 1.2fr 2.5fr 2fr 2.5fr 2fr;
  gap: 0px;
  padding: 16px;
  background-color: #e3effb;
  border-bottom: 1px solid #d1d5db;
}
.orderlist-table-header > div {
  font-weight: 600;
  color: #414a73;
}
.col-no {
  text-align: center;
}
.col-code {
  text-align: left;
  word-break: break-all;
  color: #000;
}
.col-date {
  text-align: left;
}
.col-store {
  text-align: left;
}
.col-amount {
  text-align: left !important;
  display: flex;
  align-items: center;
  justify-content: flex-start !important;
}
.orderlist-table-row {
  display: grid;
  grid-template-columns: 1.2fr 2.5fr 2fr 2.5fr 2fr;
  gap: 0px;
  padding: 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
}
.orderlist-table-row.selected {
  background-color: #f0f4ff;
}
.orderlist-table-row:hover {
  background-color: #e3effb;
}
.orderlist-row-number {
  color: #000000;
  font-weight: 500;
}
.orderlist-table-row .col-date,
.orderlist-table-row .col-store {
  display: flex;
  align-items: center;
  color: #000000;
}
.orderlist-table-row .col-amount {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: #000000;
  font-weight: 500;
}
.orderlist-loading,
.orderlist-no-data {
  padding: 40px;
  text-align: center;
  color: #6b7280;
  background-color: #ffffff;
}
.orderlist-action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin: 24px 24px 24px 0;
}
.orderlist-btn-cancel {
  padding: 8px 24px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  color: #414a73;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}
.orderlist-btn-cancel:hover {
  background-color: #f9fafb;
}
.orderlist-btn-register {
  padding: 8px 24px;
  border: none;
  background-color: #4368fa;
  color: #ffffff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}
.orderlist-btn-register:hover {
  background-color: #3557e8;
}
</style>
