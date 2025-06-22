<template>
  <div class="info-form">
    <div class="action-buttons">
      <button class="btn-secondary">임시 저장 불러오기</button>
      <button class="btn-primary">임시저장</button>
      <button class="btn-primary">등록</button>
      <button class="btn-primary" @click="cancelRegister">취소</button>
    </div>

    <div class="info-section">
      <div class="section-header">
        <h2 class="section-title">구매 요청 정보</h2>
      </div>
      <div class="form-grid">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">납기희망일</label>
            <div class="input-wrapper">
              <input type="date" class="form-input" value="2025-02-01" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">요청일</label>
            <div class="input-wrapper">
              <input type="date" class="form-input" value="2025-01-26" />
            </div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">담당자</label>
            <input type="text" class="form-input" value="황수민" readonly />
          </div>
          <div class="form-group">
            <label class="form-label">담당자 이메일</label>
            <input type="email" class="form-input" value="sumin@hanwha.co.kr" readonly />
          </div>
        </div>
        <div class="form-row full-width">
          <div class="form-group">
            <label class="form-label">제목</label>
            <input type="text" class="form-input" value="닭 구매요청 합니다" />
          </div>
        </div>
        <div class="form-row full-width">
          <div class="form-group">
            <label class="form-label">사유</label>
            <textarea class="form-textarea" rows="3">창고에 없음</textarea>
          </div>
        </div>
      </div>
    </div>

    <div class="info-section">
      <div class="section-header">
        <h2 class="section-title">구매 요청 자재</h2>
        <button class="btn-add">추가</button>
      </div>
      <div class="table-wrapper">
        <table class="materials-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>자재 번호</th>
              <th>자재명</th>
              <th>구매 단가</th>
              <th>수량</th>
              <th>단위</th>
              <th>규격</th>
              <th>자재 구분</th>
              <th>자재 분류</th>
              <th>자재 속성</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in materialsList" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ item.code }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.price.toLocaleString() }}</td>
              <td>{{ item.quantity.toLocaleString() }}</td>
              <td>{{ item.unit }}</td>
              <td>{{ item.spec }}</td>
              <td>{{ item.category }}</td>
              <td>{{ item.classification }}</td>
              <td>{{ item.attribute }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="total-section">
        <span class="total-text">총 금액: {{ totalAmount.toLocaleString() }}원</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Calendar as CalendarIcon } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const router = useRouter();

const materialsList = ref([
  {
    code: 'ABC12345',
    name: '생닭',
    price: 6000,
    quantity: 600,
    unit: 'g',
    spec: '1호',
    category: '냉동',
    classification: '원재료',
    attribute: '비상시식품'
  },
  {
    code: 'ABC12345',
    name: '생닭',
    price: 6000,
    quantity: 600,
    unit: 'g',
    spec: '2호',
    category: '냉동',
    classification: '원재료',
    attribute: '비상시식품'
  },
  {
    code: 'ABC12345',
    name: '생닭',
    price: 6000,
    quantity: 600,
    unit: 'g',
    spec: '3호',
    category: '냉동',
    classification: '원재료',
    attribute: '비상시식품'
  }
]);

const totalAmount = computed(() => {
  return materialsList.value.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
});

function cancelRegister() {
  if (confirm('등록을 취소하시겠습니까?')) {
    router.push('/purchase');
  }
}
</script>

<style scoped>
.info-form {
  background: #fff;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 8px 0 rgba(64, 102, 250, 0.03);
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
}
.action-buttons {
  position: absolute;
  top: 24px;
  right: 32px;
  display: flex;
  gap: 8px;
}
.btn-primary {
  background: #5468ff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-primary:hover {
  background: #3a5eff;
}
.btn-secondary {
  background: #f8f9fa;
  color: #5468ff;
  border: 1px solid #5468ff;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-secondary:hover {
  background: #5468ff;
  color: white;
}
.btn-add {
  background: #5468ff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
}
.info-section {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  padding: 24px 32px;
  margin-top: 40px;
}
.info-section:first-child {
  margin-top: 0;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.form-row.full-width {
  grid-template-columns: 1fr;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #555;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 4px;
  margin: 0;
}
.input-wrapper {
  position: relative;
}
.form-input, .form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e7ef;
  border-radius: 6px;
  font-size: 0.9rem;
  background: #fff;
  box-sizing: border-box;
}
.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #5468ff;
  box-shadow: 0 0 0 2px rgba(84, 104, 255, 0.1);
}
.form-input[readonly] {
  background: #f8f9fa;
  color: #666;
}
.input-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #999;
  pointer-events: none;
}
.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e0e7ef;
}
.materials-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  background: #fff;
}
.materials-table th,
.materials-table td {
  padding: 12px 8px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  white-space: nowrap;
}
.materials-table th {
  background: #f8f9fa;
  color: #555;
  font-weight: 600;
  border-bottom: 1px solid #e0e7ef;
}
.materials-table tbody tr:hover {
  background: #f8f9fa;
}
.total-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e7ef;
}
.total-text {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}
</style> 