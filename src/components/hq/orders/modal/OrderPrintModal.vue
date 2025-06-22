<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal-content">
      <button class="close-btn" @click="close">×</button>
      <div ref="pdfArea" id="pdf-area" class="print-area">
        <div class="order-header">
          <h2 class="order-title">
            {{ isApproved ? '주문서' : '임시 주문서' }}
          </h2>
          <div class="order-meta">
            <div>문서번호: 1213</div>
            <div>발행일자: {{ order?.approvalCompletedAt || order?.orderDate || '' }}</div>
            <!-- <div>담당자: {{ order.ceoName }}</div>
            <div>연락처: {{ order.franchisePhone }}</div> -->
          </div>
        </div>
        <hr />
        <div class="section">
          <h3>가맹점 정보</h3>
          <div class="info-grid">
            <div>가맹점명: {{ order.franchiseName }}</div>
            <div>가맹점 코드: {{ order.franchiseCode }}</div>
            <div>사업자 번호: {{ order.businessNumber }}</div>
            <div>대표자: {{ order.ceoName }}</div>
            <div>계약 날짜: {{ order.franchiseSignedAt }}</div>
            <div>주소: {{ order.franchiseAddress }}</div>
            <div>우편번호: {{ order.zipCode }}</div>
            <div>연락처: {{ order.franchisePhone }}</div>
          </div>
        </div>
        <div class="section">
          <h3>주문 정보</h3>
          <div class="info-grid">
            <div>주문 번호: {{ order.code }}</div>
            <div>주문 요청일: {{ order.orderDate }}</div>
            <div>총 주문 수량: {{ order.totalQuantity ? `${order.totalQuantity.toLocaleString()}개` : '-' }}개</div>
            <div>총 주문 금액: {{ (order.totalAmount ?? 0).toLocaleString() }}원</div>
          </div>
        </div>
        <div class="section">
          <h3>자재 정보</h3>
          <table class="material-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>자재 번호</th>
                <th>자재명</th>
                <th>구매 단가</th>
                <th>수량</th>
                <th>단위</th>
                <th>규격</th>
                <th>자재 분류</th>
                <th>자재 구분</th>
                <th>자재 속성</th>
              </tr>
            </thead>
            <tbody>
                <tr v-for="(p, idx) in products" :key="p.id">
                    <td>{{ idx + 1 }}</td>
                    <td class="link">{{ p.code }}</td>
                    <td>{{ p.name }}</td>
                    <td>{{ p.purchasePrice.toLocaleString() }}원</td>
                    <td>{{ p.quantity }}</td>
                    <td>{{ p.purchaseUnit }}</td>
                    <td>{{ p.spec }}</td>
                    <td><span class="badge blue">{{ p.productTypeName }}</span></td>
                    <td><span class="badge purple">{{ p.productGroupName }}</span></td>
                    <td><span class="badge green">{{ p.productAttributeName }}</span></td>
                </tr>
            </tbody>
          </table>

          <div class="summary-box">
            <div>총 수량: <strong>{{ totalQuantity }}개</strong></div>
            <div class="total-amount">{{ totalAmount.toLocaleString() }}원</div>
        </div>
        </div>
        <div class="sign-row">
          <div>담당자: {{ order.ceoName }}</div>
          <div>(인)</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="print-btn" @click="downloadPdf">인쇄하기</button>
        <button class="close-btn" @click="close">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import html2pdf from 'html2pdf.js';

const props = defineProps({ visible: Boolean });
const emit = defineEmits(['close']);
const pdfArea = ref(null);
const products = computed(() => props.order?.products ?? []);
const totalAmount = computed(() =>
  products.value.reduce((sum, p) => sum + (p.purchasePrice || 0) * (p.quantity || 0), 0)
);
const totalQuantity = computed(() =>
  products.value.reduce((sum, p) => sum + (p.quantity || 0), 0)
);


const isApproved = computed(() =>
  ['APPROVED', 'DELIVERED', 'DELIVERING'].includes(props.order?.status)
);
function close() { emits('close'); }

function downloadPdf() {
  const element = pdfArea.value;
  const opt = {
    margin:       0.5,
    filename:     isApproved.value ? '주문서.pdf' : '임시주문서.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.18);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: #fff;
  border-radius: 10px;
  max-width: 900px;
  width: 100%;
  max-height: 95vh;
  overflow-y: auto;
  box-shadow: 0 4px 32px rgba(0,0,0,0.12);
  padding: 32px 36px 24px 36px;
  position: relative;
}
.close-btn {
  position: absolute;
  top: 18px;
  right: 24px;
  background: none;
  border: none;
  font-size: 2rem;
  color: #888;
  cursor: pointer;
}
.print-area {
  background: #fff;
  color: #222;
  font-family: 'Noto Sans KR', sans-serif;
}
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
}
.order-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0;
}
.order-meta {
  text-align: right;
  font-size: 1rem;
  color: #444;
}
.section {
  margin: 24px 0 12px 0;
}
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 24px;
  font-size: 1rem;
}
.material-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
  font-size: 1rem;
}
.material-table th, .material-table td {
  border: 1px solid #d1d5db;
  padding: 8px 6px;
  text-align: center;
}
.material-table th {
  background: #f4f6fa;
  font-weight: 600;
}
.material-table tfoot td {
  font-weight: 700;
  background: #f4f6fa;
}
.sign-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
  font-size: 1.1rem;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 18px;
}
.print-btn {
  background: #222;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 24px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
}

.summary-box {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
}

.total-amount {
  color: #15803d;
  font-size: 18px;
  font-weight: 700;
}
</style> 