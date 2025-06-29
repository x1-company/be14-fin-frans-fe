<template>
  <div>
    <div class="action-buttons">
      <button class="btn print" @click="printRequest">
        <span class="icon">&#128424;</span> 구매 요청서 출력
      </button>
      <button class="btn edit" @click="editRequest">
        <span class="icon"></span> 수정
      </button>
      <button class="btn delete" @click="deleteRequest">
        <span class="icon"></span> 삭제
      </button>
      <button class="btn close" @click="$emit('close')">
        <span class="icon">&#10005;</span> 닫기
      </button>
    </div>
    <div class="card order-card">
      <div class="order-title">
        <span class="order-icon">📝</span>
        구매 요청 정보
      </div>
      <div class="info-box-row">
        <div class="info-box blue">
          <span class="label">구매 요청 번호</span>
          <span class="value">{{ requestInfo.purchaseNumber || '-' }}</span>
        </div>
        <div class="info-box green">
          <span class="label">총 요청 금액</span>
          <span class="value">{{ formatCurrency(totalAmount) }}원</span>
        </div>
      </div>
      <div class="info-grid-2col">
        <div class="label">제목</div>
        <div class="value">{{ requestInfo.title || '-' }}</div>
        <div class="label">사유</div>
        <div class="value">{{ requestInfo.description || '-' }}</div>
        <div class="label">요청일</div>
        <div class="value">{{ requestInfo.requestDate || '-' }}</div>
        <div class="label">납기희망일</div>
        <div class="value">{{ requestInfo.deliveryDate || '-' }}</div>
        <div class="label">담당자</div>
        <div class="value">{{ requestInfo.manager || '-' }}</div>
        <div class="label">담당자 이메일</div>
        <div class="value">{{ requestInfo.managerEmail || '-' }}</div>
      </div>
    </div>
    <div class="card product-card">
      <div class="card-title"><span class="icon">📦</span> 자재 정보</div>
      <table class="product-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>자재 번호</th>
            <th>자재명</th>
            <th>구매 단가</th>
            <th>수량</th>
            <th>단위</th>
            <th>자재 구분</th>
            <th>자재 분류</th>
            <th>자재 속성</th>
            <th>공급처 명</th>
            <th>비고</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="materials.length === 0">
            <td colspan="10" class="no-data">등록된 자재가 없습니다.</td>
          </tr>
          <tr v-for="(material, index) in materials" :key="material.productId || material.id || index">
            <td>{{ index + 1 }}</td>
            <td class="link">{{ material.productCode }}</td>
            <td>{{ material.productName }}</td>
            <td>{{ formatCurrency(material.purchasePrice) }}</td>
            <td>{{ material.quantity }}</td>
            <td>{{ material.purchaseUnit }}</td>
            <td><span class="badge blue">{{ material.productTypeName }}</span></td>
            <td><span class="badge purple">{{ material.productGroupName }}</span></td>
            <td><span class="badge green">{{ material.productAttributeName }}</span></td>
            <td>{{ material.supplierName || '-' }}</td>
            <td>{{ material.remarks }}</td>
          </tr>
        </tbody>
      </table>
      <div class="summary-box">
        <div>총 수량: <strong>{{ totalQuantity }}개</strong></div>
        <div class="total-amount">{{ formatCurrency(totalAmount) }}원</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/lib/api';

const props = defineProps({
  id: {
    type: [String, Number],
    required: true
  }
});

const emit = defineEmits(['close', 'data-loaded']);

const route = useRoute();
const router = useRouter();

const requestInfo = ref({
  requestDate: '',
  deliveryDate: '',
  manager: '',
  purchaseNumber: '',
  managerEmail: '',
  title: '',
  description: '',
  totalAmount: 0
});
const materials = ref([]);

function formatCurrency(value) {
  if (!value) return '0';
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function printRequest() {
  window.print();
}

async function fetchDetail() {
  try {
    const id = props.id;
    const { data } = await api.get(`/api/hq/purchase/requests/${id}`);
    
    // 요청 정보 매핑 - API 응답 키 이름에 맞게 수정
    requestInfo.value = {
      requestDate: data.createdAt ? data.createdAt.split('T')[0].replace(/-/g, '.') : '',
      deliveryDate: data.requestedDeliveryDate ? data.requestedDeliveryDate.replace(/-/g, '.') : '',
      manager: data.userName || '',
      purchaseNumber: data.code || '',
      managerEmail: data.userEmail || '',
      title: data.title || '',
      description: data.description || '',
      totalAmount: data.totalAmount || 0
    };
    
    materials.value = (data.products || []).map(p => ({
      productId: p.productId || p.id,
      productCode: p.productCode || p.code || '',
      productName: p.productName || p.name || '',
      purchasePrice: p.purchasePrice || 0,
      quantity: p.quantity || 0,
      purchaseUnit: p.purchaseUnit || '',
      productTypeName: p.productTypeName || '',
      productGroupName: p.productGroupName || '',
      productAttributeName: p.productAttributeName || '',
      supplierName: p.supplierName || '',
      remarks: p.remarks || ''
    }));

    // 상위 컴포넌트로 데이터 전달
    emit('data-loaded', {
      requestInfo: requestInfo.value,
      materials: materials.value,
      totalAmount: totalAmount.value,
      totalQuantity: totalQuantity.value
    });
    
  } catch (error) {
    console.error('Error fetching purchase request detail:', error);
  }
}

// totalAmount 계산 - API의 totalAmount 우선 사용, 없으면 계산
const totalAmount = computed(() => {
  if (requestInfo.value.totalAmount) {
    return requestInfo.value.totalAmount;
  }
  
  return materials.value.reduce((sum, m) => {
    const price = Number(m.purchasePrice) || 0;
    const quantity = Number(m.quantity) || 0;
    return sum + price * quantity;
  }, 0);
});

const totalQuantity = computed(() => {
  return materials.value.reduce((sum, m) => sum + (Number(m.quantity) || 0), 0);
});

function editRequest() {
  // TODO: 수정 기능 구현
  console.log('수정 기능 구현 예정');
}

function deleteRequest() {
  // TODO: 삭제 기능 구현
  if (confirm('정말로 이 구매 요청을 삭제하시겠습니까?')) {
    console.log('삭제 기능 구현 예정');
  }
}

onMounted(fetchDetail);
watch(() => props.id, fetchDetail);
</script>

<style scoped>
.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
  background: transparent;
}

.btn.print {
  border-color: #e0e0e0;
  color: #1976d2;
}

.btn.edit {
  border-color: #c8e6c9;
  color: #388e3c;
}

.btn.delete {
  border-color: #ffd6d6;
  color: #d32f2f;
}

.btn.close {
  border-color: #e0e0e0;
  color: #1976d2;
}

.btn:hover {
  opacity: 0.8;
}

.card {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.order-title, .card-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-box-row {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.info-box {
  flex: 1;
  padding: 15px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-box.blue {
  background: #e3f2fd;
  border: 1px solid #bbdefb;
}

.info-box.green {
  background: #e8f5e8;
  border: 1px solid #c8e6c9;
}

.info-box .label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.info-box .value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.info-grid-2col {
  display: grid;
  grid-template-columns: 150px 1fr 150px 1fr;
  row-gap: 12px;
  column-gap: 16px;
  align-items: center;
  margin-bottom: 10px;
}

.info-grid-2col .label {
  font-weight: 500;
  color: #666;
}

.info-grid-2col .value {
  color: #333;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.product-table th,
.product-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.product-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.product-table .link {
  color: #007bff;
  cursor: pointer;
}

.product-table .link:hover {
  text-decoration: underline;
}

.badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.badge.blue {
  background: #e3f2fd;
  color: #1976d2;
}

.badge.purple {
  background: #f3e5f5;
  color: #7b1fa2;
}

.badge.green {
  background: #e8f5e8;
  color: #388e3c;
}

.summary-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  font-weight: 500;
}

.total-amount {
  font-size: 18px;
  font-weight: 600;
  color: #28a745;
}

.no-data {
  text-align: center;
  color: #6c757d;
  font-style: italic;
}
</style>