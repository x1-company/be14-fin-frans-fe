<template>
  <div v-if="isVisible" class="pdf-modal-backdrop" @click.self="closeModal">
    <div class="pdf-modal-content">
      <button class="close-btn" @click="closeModal">×</button>
      <div style="text-align: left; margin: 16px 0 0 24px">
        <!-- 기존 PDF 다운로드 버튼 div 삭제 -->
      </div>
      <div class="approval-document" ref="pdfContent">
        <!-- 문서 헤더 -->
        <div class="document-header">
          <div class="approval-category">{{
            getCategoryText(approval.categoryType)
          }}</div>
          <h1 class="document-title">{{ approval.title }}</h1>

          <div class="document-info">
            <span class="document-number">문서번호: {{ approval.code }}</span>
          </div>

          <div class="date-info">
            <div class="date-item">
              <span class="date-label">발행일자:</span>
              <span class="date-value">{{
                formatDate(approval.createdAt)
              }}</span>
            </div>
            <div class="date-item">
              <span class="date-label">승인일자:</span>
              <span class="date-value">{{
                formatDate(approval.processedAt)
              }}</span>
            </div>
          </div>
        </div>

        <!-- 결재 정보 -->
        <div class="approval-info-section">
          <h3 class="section-title">결재 정보</h3>
          <div class="info-grid">
            <div class="info-row">
              <div class="info-item">
                <span class="info-label">결재 번호:</span>
                <span class="info-value">{{ approval.code }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">결재 상태:</span>
                <span class="info-value status-approved">{{
                  getApprovalStatusText(approval.status)
                }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <span class="info-label">기안자:</span>
                <span class="info-value">{{ approval.drafterName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">기안일자:</span>
                <span class="info-value">{{
                  formatDate(approval.createdAt)
                }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <span class="info-label">소속부서:</span>
                <span class="info-value">{{ approval.deptName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">총 금액:</span>
                <span class="info-value amount">{{
                  formatCurrency(approval.totalAmount)
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 자재 정보 -->
        <div class="material-section">
          <h3 class="section-title">자재 정보</h3>
          <div class="table-container">
            <table class="material-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>자재코드</th>
                  <th>자재명</th>
                  <th>규격</th>
                  <th>단가</th>
                  <th>구매단위</th>
                  <th>수량</th>
                  <th>금액</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in approval.history || []"
                  :key="item.historyId || index"
                >
                  <td>{{ index + 1 }}</td>
                  <td>{{ item.code }}</td>
                  <td>{{ item.productName }}</td>
                  <td>{{ item.spec }}</td>
                  <td>
                    {{
                      approval.categoryType === "PURCHASE_ORDER"
                        ? formatNumber(item.purchasePrice)
                        : formatNumber(item.salePrice)
                    }}
                  </td>
                  <td>{{ item.purchaseUnit }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ formatNumber(item.amount) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="6">합계</td>
                  <td>{{ totalQuantity }}</td>
                  <td class="total-amount">{{
                    formatNumber(approval.totalAmount)
                  }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- 결재선 및 서명 -->
        <ApprovalLineSection :lines="approvalLinesFiltered" />

        <!-- 문서 하단 정보 -->
        <div class="document-footer">
          <!-- <p class="footer-text">
            본 결재확인서는 전자결재시스템에서 생성된 공식 문서입니다.
          </p> -->
          <p class="generation-info">
            생성일시: {{ formatDateTime(new Date()) }}
          </p>
          <div style="text-align: center; margin-top: 20px;">
            <button class="pdf-download-btn" @click="generatePdf">PDF 다운로드</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import html2pdf from "html2pdf.js";
import api from "@/lib/api";
import ApprovalLineSection from "./ApprovalLineSection.vue";

const props = defineProps({
  approvalId: { type: [String, Number], required: true },
  isVisible: { type: Boolean, default: true },
});
const emit = defineEmits(["close"]);
const pdfContent = ref(null);
const approval = ref({});
const approvalLines = ref([]);

const fetchData = async () => {
  if (!props.approvalId) return;
  const [contentRes, linesRes] = await Promise.all([
    api.get(`/api/hq/approvals/detail/${props.approvalId}/content`),
    api.get(`/api/hq/approvals/detail/${props.approvalId}/lines`),
  ]);
  approval.value = Array.isArray(contentRes.data)
    ? contentRes.data[0]
    : contentRes.data;
  approvalLines.value = Array.isArray(linesRes.data)
    ? linesRes.data
    : linesRes.data.line || [];
};

watch(() => props.approvalId, fetchData, { immediate: true });

const approvalLinesFiltered = computed(() => {
  // 기안자 객체 생성
  const drafter = {
    type: "DRAFTER",
    userName: approval.value.drafterName,
    departmentName: approval.value.deptName,
    positionName: approval.value.positionName,
    processedAt: approval.value.createdAt,
    signUrl: approval.value.url,
    status: "DRAFTED",
  };

  // 결재자/협조자(기존)
  const lines = (approvalLines.value || [])
    .filter((line) => line.type === "APPROVER" || line.type === "COOPERATOR")
    .map((line) => ({
      ...line,
      signUrl: line.url,
    }));
  return [drafter, ...lines];
});

const totalQuantity = computed(() => {
  return (approval.value.history || []).reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );
});

const finalApprovedAt = computed(() => {
  const approved = approvalLinesFiltered.value.filter(
    (l) => l.status === "APPROVED" && l.processedAt
  );
  return approved.length ? approved[approved.length - 1].processedAt : null;
});

function closeModal() {
  emit("close");
}
function generatePdf() {
  if (!pdfContent.value) return;
  html2pdf()
    .set({
      margin: 0,
      filename: `approval_${approval.value.code || "document"}.pdf`,
      html2canvas: { scale: 3, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(pdfContent.value)
    .save();
}
function formatCurrency(amount) {
  if (!amount) return "₩0";
  return `₩${amount.toLocaleString()}`;
}
function formatNumber(number) {
  return number ? number.toLocaleString() : "";
}
function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}.${String(date.getDate()).padStart(2, "0")}`;
}
function formatDateTime(date) {
  if (!date) return "-";
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}.${String(date.getDate()).padStart(2, "0")}. ${String(
    date.getHours()
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(
    date.getSeconds()
  ).padStart(2, "0")}`;
}
function getApprovalStatusText(status) {
  const statusMap = {
    PENDING: "대기중",
    APPROVED: "승인",
    REJECTED: "반려",
    CANCELED: "취소",
    IN_PROGRESS: "결재중",
    DRAFT: "임시저장",
    COMPLETED: "완료",
    WAITING: "대기중",
    EXPECTED: "예정",
    "승인 완료": "승인 완료",
    승인: "승인",
  };
  return statusMap[status] || status || "-";
}
function getCategoryText(type) {
  if (type === "ORDER") return "주문 결재";
  if (type === "RETURN") return "반품 결재";
  if (type === "PURCHASE") return "발주 결재";
  return "기타 결재";
}
</script>

<style scoped>
.pdf-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pdf-modal-content {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  max-width: 900px;
  width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
}
.close-btn {
  position: absolute;
  top: 18px;
  right: 24px;
  font-size: 2rem;
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  z-index: 10;
}
/* 전체 문서 스타일 */
.approval-document {
  width: 100%;
  height: auto;
  margin: 0;
  padding: 0 24px 24px 24px;
  box-sizing: border-box;
}

/* 문서 헤더 */
.document-header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
}

.document-title {
  font-size: 34px;
  font-weight: 800;
  margin: 0 0 10px 0;
  color: #111;
  letter-spacing: -1px;
}

.document-subtitle {
  font-size: 18px;
  font-weight: 500;
  margin: 0 0 20px 0;
  color: #555;
}

.approval-status {
  margin: 20px 0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
}

.status-badge.approved {
  /* background: #dcfce7; */
  color: #166534;
  border: 1px solid #bbf7d0;
}

.status-icon {
  font-size: 16px;
  font-weight: bold;
}

.document-number {
  font-size: 14px;
  color: #666;
  margin: 10px 0;
}

.date-info {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  font-size: 14px;
}

.date-label {
  font-weight: 500;
  color: #555;
}

.date-value {
  color: #333;
}

/* 섹션 공통 스타일 */
.section-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 20px 0;
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
  color: #111;
}

/* 결재 정보 섹션 */
.approval-info-section {
  margin-bottom: 40px;
  padding: 20px;
  /* background: #f8fffe; */
  border: 1px solid #eaeaea;
  border-radius: 8px;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  gap: 40px;
}

.info-item {
  flex: 1;
  display: flex;
  gap: 12px;
}

.info-label {
  font-weight: 500;
  color: #555;
  min-width: 80px;
}

.info-value {
  color: #333;
}

.info-value.status-approved {
  color: #059669;
  font-weight: 500;
}

.info-value.amount {
  color: #059669;
  font-weight: bold;
  font-size: 16px;
}

/* 자재 정보 테이블 */
.material-section {
  margin-bottom: 40px;
}

.table-container {
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.material-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.material-table th,
.material-table td {
  color: #111 !important;
}

.material-table th {
  /* background: #f9fafb; */
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}

.material-table td {
  padding: 12px 8px;
  text-align: center;
  border-bottom: 1px solid #f3f4f6;
}

.material-table tbody tr:hover {
  background: none;
}

.total-row {
  background: none;
  font-weight: 600;
}

.total-row td {
  border-top: 2px solid #e5e7eb;
}

.total-amount {
  color: #059669;
  font-weight: bold;
}

/* 결재선 및 서명 */
.approval-line-section {
  margin-bottom: 40px;
}

.approval-cards {
  display: flex;
  gap: 20px;
  justify-content: space-between;
}

.approval-card {
  flex: 1;
  padding: 20px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  background: none;
  text-align: center;
}

.approver-role {
  font-size: 14px;
  font-weight: 500;
  color: #059669;
  margin-bottom: 8px;
}

.approver-name {
  font-size: 18px;
  font-weight: bold;
  color: #111;
  margin-bottom: 4px;
}

.approver-position {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.approval-status-text {
  font-size: 12px;
  color: #059669;
  font-weight: 500;
  margin-bottom: 16px;
}

.signature-area {
  height: 80px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.signature-placeholder {
  width: 60px;
  height: 40px;
  background: #f3f4f6;
  border-radius: 4px;
}

.approval-date {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.approval-comment {
  font-size: 12px;
  color: #555;
  font-style: italic;
}

/* 문서 하단 */
.document-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  color: #666;
}

.footer-text {
  font-size: 14px;
  margin: 0 0 8px 0;
}

.generation-info {
  font-size: 12px;
  margin: 0;
}

/* 반응형 */
@media (max-width: 768px) {
  .approval-document {
    padding: 20px;
  }

  .date-info {
    flex-direction: column;
    gap: 8px;
  }

  .info-row {
    flex-direction: column;
    gap: 12px;
  }

  .approval-cards {
    flex-direction: column;
  }

  .table-container {
    font-size: 12px;
  }
}

/* 인쇄 스타일 */
@media print {
  .pdf-modal-content,
  .approval-document {
    width: 500px !important;
    min-width: 500px !important;
    max-width: 500px !important;
    margin: 0 auto !important;
    padding: 0 !important;
    box-shadow: none !important;
    background: #fff !important;
    display: block !important;
    overflow: visible !important;
    max-height: none !important;
  }
  body {
    background: #fff !important;
  }
}

.pdf-download-btn {
  padding: 8px 20px;
  background: #059669;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 12px;
}
.pdf-download-btn:hover {
  background: #047857;
}

.approval-category {
  font-size: 18px;
  font-weight: 600;
  color: #059669;
  margin-bottom: 8px;
  letter-spacing: 1px;
}
</style>
