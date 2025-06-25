<!-- src/components/hq/approval/ApprovalPdfModal.vue -->
<template>
  <div v-if="isVisible" class="pdf-modal-backdrop">
    <div class="pdf-modal-content" ref="pdfContent">
      <h1 style="text-align: center">전자결재서</h1>
      <p>결재번호: {{ approval.code }}</p>
      <p>기안자: {{ approval.drafterName }}</p>
      <p>기안일: {{ approval.createdAt }}</p>
      <p>결재 상태: {{ approval.status }}</p>

      <!-- 이력 테이블 -->
      <table
        border="1"
        cellspacing="0"
        cellpadding="8"
        width="100%"
        style="margin-top: 20px"
      >
        <thead>
          <tr>
            <th>제품명</th>
            <th>수량</th>
            <th>단가</th>
            <th>금액</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in approval.history" :key="item.historyId">
            <td>{{ item.productName }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ formatCurrency(item.salePrice || item.purchasePrice) }}</td>
            <td>{{ formatCurrency(item.amount) }}</td>
          </tr>
        </tbody>
      </table>

      <p style="text-align: right; margin-top: 20px">
        총 금액: {{ formatCurrency(approval.totalAmount) }}
      </p>

      <!-- PDF 다운로드 버튼 -->
      <div style="text-align: center; margin-top: 20px">
        <button @click="generatePdf" style="margin-right: 10px"
          >PDF 다운로드</button
        >
        <button @click="$emit('close')">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import html2pdf from "html2pdf.js";
import api from "@/lib/api";

const props = defineProps({
  approvalId: {
    type: [Number, String],
    required: true,
  },
  isVisible: {
    type: Boolean,
    required: true,
  },
});

const pdfContent = ref(null);
const approval = ref({});

const formatCurrency = (value) => {
  if (!value) return "₩0";
  return `₩${value.toLocaleString()}`;
};

const loadApprovalData = async () => {
  try {
    const response = await api.get(
      `/api/hq/approvals/detail/${props.approvalId}/content`
    );
    console.log("response.data", response.data);
    if (response.data && response.data.length > 0) {
      approval.value = response.data[0];
    } else {
      approval.value = response.data;
    }
  } catch (error) {
    console.error("결재 데이터를 불러오는 데 실패했습니다.", error);
  }
};

const generatePdf = () => {
  if (!pdfContent.value) return;

  html2pdf()
    .set({
      margin: 10,
      filename: `approval_${approval.value.code || "document"}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(pdfContent.value)
    .save();
};

// 모달 열릴 때 데이터 로드
watch(
  () => props.isVisible,
  (newVal) => {
    if (newVal) {
      loadApprovalData();
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.pdf-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pdf-modal-content {
  background: white;
  padding: 20px;
  width: 80%;
  max-width: 800px;
  max-height: 80%;
  overflow: auto;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.pdf-modal-content h1 {
  margin-bottom: 20px;
  color: #333;
}

.pdf-modal-content p {
  margin: 8px 0;
  color: #555;
}

.pdf-modal-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 20px 0;
}

.pdf-modal-content th,
.pdf-modal-content td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.pdf-modal-content th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.pdf-modal-content button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.pdf-modal-content button:hover {
  background: #0056b3;
}

.pdf-modal-content button:last-child {
  background: #6c757d;
}

.pdf-modal-content button:last-child:hover {
  background: #545b62;
}
</style>
