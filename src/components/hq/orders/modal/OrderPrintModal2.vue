<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>주문서</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      
      <div class="modal-content" ref="printContent">
        <div class="document-header">
          <h1 class="document-title">주문 확인서</h1>
          <div class="document-info">
            <div class="info-left">
              <p>문서번호: {{ order?.code || 'RT74788' }}</p>
              <p>발행일자: {{ formatDate(new Date()) }}</p>
            </div>
            <div class="info-right">
              <p>담당자: {{ auth.userName }}</p>
              <p>연락처: {{ auth.userEmail }}</p>
            </div>
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">가맹점 정보</h3>
          <div class="info-grid">
            <div class="info-row">
              <span class="label">가맹점명:</span>
              <span class="value">{{ order?.franchiseName }}</span>
              <span class="label">가맹점 코드:</span>
              <span class="value">{{ order?.franchiseCode }}</span>
            </div>
            <div class="info-row">
              <span class="label">대표자:</span>
              <span class="value">{{ order?.ceoName }}</span>
              <span class="label">사업자 번호:</span>
              <span class="value">{{ order?.businessNumber }}</span>
            </div>
            <div class="info-row">
              <span class="label">주소:</span>
              <span class="value full-width">{{ order?.franchiseAddress }}</span>
              <span class="label">연락처:</span>
              <span class="value">{{ order?.franchisePhone }}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">주문 정보</h3>
          <div class="info-grid">
            <div class="info-row">
              <span class="label">주문 번호:</span>
              <span class="value">{{ order?.code }}</span>
              <span class="label">주문 요청일:</span>
              <span class="value">{{ formatDate(order?.orderDate) }}</span>
            </div>
            <div class="info-row">
              <span class="label">총 주문 수량:</span>
              <span class="value">{{ order?.totalQuantity }}개</span>
              <span class="label">총 주문 금액:</span>
              <span class="value">{{ formatCurrency(order?.totalAmount) }}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">자재 정보</h3>
          <table class="product-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>자재 번호</th>
                <th>자재명</th>
                <th>자재 분류</th>
                <th>자재 구분</th>
                <th>규격</th>
                <th>단가</th>
                <th>수량</th>
                <th>단위</th>
                <th>금액</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(product, index) in order?.products" :key="index">
                <td>{{ index + 1 }}</td>
                <td>{{ product.code }}</td>
                <td>{{ product.name }}</td>
                <td>{{ product.productTypeName }}</td>
                <td>{{ product.productGroupName }}</td>
                <td>{{ product.spec }}</td>
                <td>{{ formatCurrency(product.salePrice) }}</td>
                <td>{{ product.quantity }}</td>
                <td>{{ product.unit }}</td>
                <td>{{ formatCurrency(product.salePrice * product.quantity) }}</td>
              </tr>
              <tr class="total-row">
                <td colspan="8" class="total-label">합계</td>
                <td>{{ order?.totalQuantity }}</td>
                <td>{{ formatCurrency(order?.totalAmount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="signature-section">
          <div class="signature-info">
            <div class="signature-container">
              <span class="signature-text">담당자: {{ auth.userName }} <span class="seal-text">(인)</span></span>
              <img 
                v-if="auth.userSignUrl" 
                :src="auth.userSignUrl" 
                alt="서명" 
                class="signature-image"
              >
            </div>
          </div>
          <button class="print-btn" @click="handlePrint">인쇄하기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  order: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const auth = useAuthStore()
const printContent = ref(null)

const handleOverlayClick = () => {
  emit('close')
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`
}

const formatCurrency = (amount) => {
  if (!amount) return '0원'
  return new Intl.NumberFormat('ko-KR').format(amount) + '원'
}

const handlePrint = () => {
  const printWindow = window.open('', '_blank')
  const printContentElement = document.querySelector('.modal-content')
  const printContentHTML = printContentElement ? printContentElement.innerHTML : ''
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>주문서 출력</title>
      <meta charset="utf-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .print-btn {
          display: none !important;
        }
        @media print {
          .print-btn {
            display: none !important;
          }
        }
        body {
          font-family: 'Malgun Gothic', sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #333;
          padding: 20px;
        }
        
        .document-header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 15px;
        }
        
        .document-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        
        .document-info {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #666;
        }
        .info-left {
          text-align: left;
          flex: 1;
        }
        .info-right {
          text-align: right;
          flex: 1;
        }
        
        .section {
          margin-bottom: 25px;
        }
        
        .section-title {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 10px;
          padding: 8px 12px;
          background: #f5f5f5;
          border-left: 4px solid #333;
        }
        
        .info-grid {
          border: 1px solid #ddd;
        }
        
        .info-row {
          display: flex;
          border-bottom: 1px solid #eee;
        }
        
        .info-row:last-child {
          border-bottom: none;
        }
        
        .label {
          background: #f8f9fa;
          padding: 8px 12px;
          font-weight: bold;
          border-right: 1px solid #eee;
          min-width: 100px;
        }
        
        .value {
          padding: 8px 12px;
          flex: 1;
          border-right: 1px solid #eee;
        }
        
        .value:last-child {
          border-right: none;
        }
        
        .full-width {
          flex: 2;
        }
        
        .product-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #ddd;
        }
        
        .product-table th,
        .product-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: center;
        }
        
        .product-table th {
          background: #f8f9fa;
          font-weight: bold;
        }
        
        .total-row {
          background: #f8f9fa;
          font-weight: bold;
        }
        
        .total-label {
          text-align: center;
        }
        
        .signature-section {
          margin-top: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .signature-container {
          position: relative;
          display: inline-block;
        }
        
        .signature-text {
          font-size: 14px;
        }

        .seal-text {
          opacity: 0.3;
        }
        
        .signature-image {
          position: absolute;
          top: 50%;
          right: -40px;
          transform: translateY(-50%);
          height: 30px;
          opacity: 1;
          pointer-events: none;
          border: none;
        }
      </style>
    </head>
    <body>
      ${printContentHTML}
    </body>
    </html>
  `)
  
  printWindow.document.close()
  printWindow.focus()
  
  setTimeout(() => {
    printWindow.print()
  }, 250)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #e9ecef;
}

.modal-content {
  padding: 24px;
  overflow-y: auto;
  max-height: calc(90vh - 80px);
}

.document-header {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #333;
  padding-bottom: 15px;
}

.document-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 15px;
}

.document-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}
.info-left {
  text-align: left;
  flex: 1;
}
.info-right {
  text-align: right;
  flex: 1;
}

.section {
  margin-bottom: 25px;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-left: 4px solid #333;
}

.info-grid {
  border: 1px solid #ddd;
}

.info-row {
  display: flex;
  border-bottom: 1px solid #eee;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  background: #f8f9fa;
  padding: 8px 12px;
  font-weight: bold;
  border-right: 1px solid #eee;
  min-width: 100px;
  font-size: 12px;
}

.value {
  padding: 8px 12px;
  flex: 1;
  border-right: 1px solid #eee;
  font-size: 12px;
}

.value:last-child {
  border-right: none;
}

/* .full-width {
  flex: 2;
} */

.product-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ddd;
  font-size: 11px;
}

.product-table th,
.product-table td {
  border: 1px solid #ddd;
  padding: 6px 4px;
  text-align: center;
}

.product-table th {
  background: #f8f9fa;
  font-weight: bold;
  font-size: 11px;
}

.total-row {
  background: #f8f9fa;
  font-weight: bold;
}

.total-label {
  text-align: center;
}

.signature-section {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.signature-info {
  display: flex;
  align-items: center;
}

.signature-container {
  position: relative;
  display: inline-block;
}

.signature-text {
  font-size: 14px;
}

.signature-text .seal-text {
  opacity: 0.3;
}

.signature-image {
  position: absolute;
  top: 50%;
  right: -40px;
  transform: translateY(-50%);
  height: 40px;
  opacity: 1;
  border: none;
  border-radius: 4px;
  pointer-events: none;
}

.print-btn {
  background: #333;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.print-btn:hover {
  background: #555;
}

@media print {
  .print-btn {
    display: none !important;
  }
}
</style>
