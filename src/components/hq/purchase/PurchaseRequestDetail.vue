<template>
  <div class="app">
    <NavBar />
    <div class="main-container">
      <div class="info-container">
        <div class="breadcrumb-container">
          <Breadcrumb :items="['HOME', '구매관리', '구매 상세']" />
        </div>
        <div class="info-content">
          <div class="header-banner">
            <div class="info-group">
              <InfoHeader
                title="구매관리"
                desc="구매 요청 현황을 확인하고 관리할 수 있습니다."
              />
              <!-- 상세 테이블 시작 -->
              <div class="purchase-detail-container">
                <div class="action-buttons">
                  <button class="btn-outline" @click="printRequest">구매 요청서 출력</button>
                  <button class="btn-primary" @click="closeDetail">닫기</button>
                </div>
                <!-- 구매 요청 정보 -->
                <div class="section">
                  <div class="section-title">구매 요청 정보</div>
                  <table class="info-table">
                    <tr>
                      <th>요청일</th>
                      <td>{{ requestInfo.requestDate }}</td>
                      <th>구매 요청 상태</th>
                      <td>{{ requestInfo.status }}</td>
                    </tr>
                    <tr>
                      <th>납기희망일</th>
                      <td>{{ requestInfo.deliveryDate }}</td>
                      <th>구매번호</th>
                      <td>{{ requestInfo.purchaseNumber }}</td>
                    </tr>
                    <tr>
                      <th>담당자</th>
                      <td>{{ requestInfo.manager }}</td>
                      <th>담당자 이메일</th>
                      <td>{{ requestInfo.managerEmail }}</td>
                    </tr>
                  </table>
                </div>
                <!-- 구매 요청 사유 -->
                <div class="section">
                  <div class="section-title">구매 요청 사유</div>
                  <table class="info-table">
                    <tr>
                      <th>제목</th>
                      <td>{{ requestInfo.title }}</td>
                    </tr>
                    <tr>
                      <th>사유</th>
                      <td>{{ requestInfo.description }}</td>
                    </tr>
                  </table>
                </div>
                <!-- 구매 요청 자재 -->
                <div class="section">
                  <div class="section-title">구매 요청 자재</div>
                  <table class="product-table">
                    <thead>
                      <tr>
                        <th style="width: 40px">No.</th>
                        <th style="width: 120px">자재 번호</th>
                        <th style="width: 120px">자재명</th>
                        <th style="width: 100px">구매 단가</th>
                        <th style="width: 80px">수량</th>
                        <th style="width: 60px">단위</th>
                        <th style="width: 100px">자재 구분</th>
                        <th style="width: 100px">자재 분류</th>
                        <th style="width: 100px">자재 속성</th>
                        <th style="width: 150px">비고</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="materials.length === 0">
                        <td colspan="10" class="no-data">등록된 자재가 없습니다.</td>
                      </tr>
                      <tr v-for="(material, index) in materials" :key="material.productId || material.id || index">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td class="text-center">{{ material.code }}</td>
                        <td>{{ material.name }}</td>
                        <td class="text-right">{{ formatCurrency(material.purchasePrice) }}</td>
                        <td class="text-center">{{ material.quantity }}</td>
                        <td class="text-center">{{ material.purchaseUnit }}</td>
                        <td class="text-center">{{ material.productTypeName }}</td>
                        <td class="text-center">{{ material.productGroupName }}</td>
                        <td class="text-center">{{ material.productAttributeName }}</td>
                        <td>{{ material.remarks }}</td>
                      </tr>
                      <tr v-if="materials.length > 0">
                        <td colspan="3" class="text-right"><strong>총 금액</strong></td>
                        <td class="text-right"><strong>{{ formatCurrency(totalAmount) }}</strong></td>
                        <td colspan="6"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!-- 결재 정보 -->
                <div class="section">
                  <div class="section-title">결재 정보</div>
                  <table class="info-table">
                    <tr>
                      <th>결재 코드</th>
                      <td>{{ approvalInfo.code }}</td>
                      <th>결재 상태</th>
                      <td>{{ approvalInfo.status }}</td>
                    </tr>
                    <tr>
                      <th>결재 요청자</th>
                      <td>{{ approvalInfo.requester }}</td>
                      <th>결재 담당자</th>
                      <td>{{ approvalInfo.approver }}</td>
                    </tr>
                    <tr>
                      <th>기안 일시</th>
                      <td>{{ approvalInfo.requestDate }}</td>
                      <th>결재 완료 일시</th>
                      <td>{{ approvalInfo.approvalDate }}</td>
                    </tr>
                  </table>
                </div>
              </div>
              <!-- 상세 테이블 끝 -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import NavBar from '@/components/hq/common/NavBar.vue';
import Breadcrumb from '@/components/hq/common/Breadcrumb.vue';
import InfoHeader from './InfoHeader.vue';
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/lib/api';

const route = useRoute();
const router = useRouter();

const requestInfo = ref({
  requestDate: '',
  deliveryDate: '',
  manager: '',
  status: '',
  purchaseNumber: '',
  managerEmail: '',
  title: '',
  description: ''
});
const materials = ref([]);
const approvalInfo = ref({
  code: '',
  status: '',
  requester: '',
  approver: '',
  requestDate: '',
  approvalDate: ''
});

function formatCurrency(value) {
  if (!value) return '';
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function printRequest() {
  window.print();
}
function closeDetail() {
  router.push('/purchase');
}

async function fetchDetail() {
  const id = route.params.id;
  const { data } = await api.get(`/api/hq/purchase/requests/${id}`);
  requestInfo.value = {
    requestDate: data.createdAt?.split('T')[0] || '',
    deliveryDate: data.requestedDeliveryDate || '',
    manager: data.userName || '',
    status: data.status || '',
    purchaseNumber: data.code || '',
    managerEmail: data.userEmail || '',
    title: data.title || '',
    description: data.description || ''
  };
  materials.value = (data.products || []).map(p => ({
    productId: p.productId || p.id,
    code: p.code || p.productCode || '',
    name: p.name || p.productName || '',
    purchasePrice: p.purchasePrice || 0,
    quantity: p.quantity || 0,
    purchaseUnit: p.purchaseUnit || '',
    productTypeName: p.productTypeName || '',
    productGroupName: p.productGroupName || '',
    productAttributeName: p.productAttributeName || '',
    remarks: p.remarks || ''
  }));
  if (data.status === '승인' || data.status === 'APPROVED') {
    try {
      const approvalRes = await api.get(`/api/hq/approvals/purchase/${id}`);
      approvalInfo.value = {
        code: approvalRes.data.code,
        status: approvalRes.data.status,
        requester: approvalRes.data.requester,
        approver: approvalRes.data.approver,
        requestDate: approvalRes.data.requestDate,
        approvalDate: approvalRes.data.approvalDate
      };
    } catch (e) {
      approvalInfo.value = {
        code: '', status: '', requester: '', approver: '', requestDate: '', approvalDate: ''
      };
    }
  } else {
    approvalInfo.value = {
      code: '', status: '', requester: '', approver: '', requestDate: '', approvalDate: ''
    };
  }
}

const totalAmount = computed(() => {
  return materials.value.reduce((sum, m) => {
    const price = Number(m.purchasePrice) || 0;
    const quantity = Number(m.quantity) || 0;
    return sum + price * quantity;
  }, 0);
});

onMounted(fetchDetail);
</script>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  min-width: 1200px;
}
.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}
.info-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8f9fa;
}
.breadcrumb-container {
  padding: 16px 24px 0 24px;
}
.info-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 0 24px 0;
}
.header-banner {
  color: white;
  padding: 32px 24px 0 24px;
}
.info-group {
  background: transparent;
}
.purchase-detail-container {
  background: #f8f9fa;
  min-height: 100vh;
  padding: 32px 0;
}
.section {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  margin-bottom: 32px;
  padding: 24px 32px;
}
.section-title {
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #222;
}
.info-table, .product-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  margin-bottom: 0;
}
.info-table th, .info-table td,
.product-table th, .product-table td {
  border: 1px solid #e5e7eb;
  padding: 10px 12px;
  font-size: 0.97rem;
}
.info-table th {
  background: #f8f9fa;
  color: #444;
  font-weight: 500;
  width: 140px;
}
.info-table td {
  background: #fff;
  color: #333;
}
.product-table th {
  background: #f8f9fa;
  color: #444;
  font-weight: 500;
  text-align: center;
}
.product-table td {
  background: #fff;
  color: #333;
  text-align: center;
}
.no-data {
  text-align: center;
  color: #aaa;
  padding: 32px 0;
}
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 24px;
}
.btn-primary, .btn-outline {
  background: #4066fa;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  min-width: 100px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn-outline {
  background: #4066fa;
  color: #fff;
  border: none;
}
.btn-primary:hover, .btn-outline:hover {
  background: #3453c7;
}
</style> 