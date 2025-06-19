<template>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1 class="title">반품 문서 지정</h1>

        <div class="select-all-section">
          <div class="select-all-left">
            <input
              type="checkbox"
              id="select-all"
              v-model="selectAll"
              @change="handleSelectAll"
              class="checkbox"
            />
            <label for="select-all" class="select-all-label">
              전체 선택 ({{ selectedItems.length }}/{{ returnData.length }})
            </label>
          </div>
          <span class="selected-count"
            >{{ selectedItems.length }}개 선택됨</span
          >
        </div>
      </div>

      <div class="content">
        <div class="table-container">
          <!-- Table Header -->
          <div class="table-header">
            <div class="col-no">No.</div>
            <div class="col-date">반품일</div>
            <div class="col-store">매장명</div>
            <div class="col-amount">금액</div>
          </div>

          <!-- Table Rows -->
          <div v-if="loading" class="loading">데이터를 불러오는 중...</div>
          <div v-else-if="returnData.length === 0" class="no-data"
            >반품 데이터가 없습니다.</div
          >
          <div v-else>
            <div
              v-for="(item, index) in returnData"
              :key="item.id"
              class="table-row"
            >
              <div class="col-no">
                <div class="checkbox-container">
                  <input
                    type="checkbox"
                    :id="`item-${item.id}`"
                    :value="item.id"
                    v-model="selectedItems"
                    class="checkbox"
                  />
                  <span class="row-number">{{ index + 1 }}</span>
                </div>
              </div>
              <div class="col-date">{{ formatDate(item.createdAt) }}</div>
              <div class="col-store">{{ item.franchiseName }}</div>
              <div class="col-amount"
                >₩{{ formatAmount(item.totalAmount) }}</div
              >
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button class="btn-cancel" @click="handleCancel">취소</button>
          <button class="btn-register" @click="handleRegister"
            >등록 ({{ selectedItems.length }})</button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";

const emit = defineEmits(["close", "select-documents"]);

const returnData = ref([]);
const selectedItems = ref([]);
const selectAll = ref(false);
const loading = ref(false);
const error = ref(null);

// API 호출 함수
const fetchReturnData = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(
      "http://localhost:8080/api/hq/franchise/return?franchiseId=1&page=1&size=5"
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    returnData.value = data.list || [];
  } catch (err) {
    error.value = err.message;
    console.error("API 호출 실패:", err);
    // 개발용 더미 데이터
    returnData.value = [
      {
        id: 4,
        code: "JRO2025040001202506190004",
        productSummary: "순살 닭 외 0건",
        status: "WAITING_FOR_RECEIPT",
        createdAt: "2025-06-19T12:27:51",
        totalAmount: 17000.0,
        franchiseName: "KFC 광화문점",
      },
      {
        id: 3,
        code: "JRO2025040001202506190003",
        productSummary: "순살 닭 외 0건",
        status: "WAITING_FOR_RECEIPT",
        createdAt: "2025-06-19T12:20:45",
        totalAmount: 17000.0,
        franchiseName: "KFC 광화문점",
      },
      {
        id: 2,
        code: "JRO2025040001202506190002",
        productSummary: "순살 닭 외 0건",
        status: "WAITING_FOR_RECEIPT",
        createdAt: "2025-06-19T11:56:07",
        totalAmount: 17000.0,
        franchiseName: "KFC 광화문점",
      },
      {
        id: 1,
        code: "JRO2025040001202506190001",
        productSummary: "생닭 외 0건",
        status: "WAITING_FOR_RECEIPT",
        createdAt: "2025-06-19T11:55:08",
        totalAmount: 5000.0,
        franchiseName: "KFC 광화문점",
      },
    ];
  } finally {
    loading.value = false;
  }
};

// 전체 선택 처리
const handleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = returnData.value.map((item) => item.id);
  } else {
    selectedItems.value = [];
  }
};

// 개별 선택 감지하여 전체 선택 상태 업데이트
watch(
  selectedItems,
  (newVal) => {
    selectAll.value =
      newVal.length === returnData.value.length && returnData.value.length > 0;
  },
  { deep: true }
);

// 날짜 포맷팅
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

// 금액 포맷팅
const formatAmount = (amount) => {
  return new Intl.NumberFormat("ko-KR").format(amount);
};

// 취소 버튼 클릭 핸들러
const handleCancel = () => {
  emit("close");
};

// 등록 버튼 클릭 핸들러
const handleRegister = () => {
  const selectedDocuments = returnData.value.filter((item) =>
    selectedItems.value.includes(item.id)
  );
  emit("select-documents", selectedDocuments);
};

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  fetchReturnData();
});
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #ffffff;
  padding: 24px;
}

.card {
  max-width: 1200px;
  margin: 0 auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #ffffff;
}

.header {
  padding: 24px 24px 16px 24px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #000000;
  margin: 0 0 32px 0;
}

.select-all-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.select-all-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox {
  width: 16px;
  height: 16px;
  border: 1px solid #9ca3af;
  border-radius: 3px;
  cursor: pointer;
}

.select-all-label {
  color: #000000;
  font-weight: 500;
  cursor: pointer;
}

.selected-count {
  color: #414a73;
  font-size: 14px;
}

.content {
  padding: 0 24px 24px 24px;
}

.table-container {
  background-color: #e3effb;
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 3fr 4fr 4fr;
  gap: 16px;
  padding: 16px;
  background-color: #e3effb;
  border-bottom: 1px solid #d1d5db;
}

.table-header > div {
  font-weight: 600;
  color: #414a73;
}

.col-no {
  text-align: center;
}

.col-date {
  text-align: left;
}

.col-store {
  text-align: left;
}

.col-amount {
  text-align: right;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 3fr 4fr 4fr;
  gap: 16px;
  padding: 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background-color: #f9fafb;
}

.checkbox-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.row-number {
  color: #000000;
  font-weight: 500;
}

.table-row .col-date,
.table-row .col-store {
  display: flex;
  align-items: center;
  color: #000000;
}

.table-row .col-amount {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: #000000;
  font-weight: 500;
}

.loading,
.no-data {
  padding: 40px;
  text-align: center;
  color: #6b7280;
  background-color: #ffffff;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel {
  padding: 8px 24px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  color: #414a73;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.btn-cancel:hover {
  background-color: #f9fafb;
}

.btn-register {
  padding: 8px 24px;
  border: none;
  background-color: #4368fa;
  color: #ffffff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.btn-register:hover {
  background-color: #3557e8;
}
</style>
