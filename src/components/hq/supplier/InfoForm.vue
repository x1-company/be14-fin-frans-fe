<template>
  <div class="supplier-info">
    <div v-if="!supplierDetail" class="loading-container">
      <div class="loading-spinner"></div>
      <p>공급처 정보를 불러오는 중...</p>
    </div>
    <div v-else>
      <!-- 상단 헤더 -->
      <div class="supplier-header">
        <div class="supplier-title">
          <h2>{{ supplierDetail.name }}</h2>
          <span class="supplier-code">{{ supplierDetail.code }}</span>
          <span
            class="status-badge"
            :class="{
              active: supplierDetail.isActive,
              inactive: !supplierDetail.isActive,
            }"
          >
            {{ supplierDetail.isActive ? "거래중" : "거래중단" }}
          </span>
        </div>
        <button
          class="btn btn-primary edit-btn-top"
          @click="showEditModal = true"
          >정보 수정</button
        >
      </div>
      <div class="info-grid">
        <!-- 기본 정보 -->
        <div class="info-card">
          <h3 class="card-title">기본 정보</h3>
          <div class="info-rows">
            <div class="info-row">
              <span class="label">공급처명</span>
              <span class="value">{{ supplierDetail.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">공급처 코드</span>
              <span class="value">{{ supplierDetail.code }}</span>
            </div>
            <div class="info-row">
              <span class="label">사업자번호</span>
              <span class="value">{{
                formatBusinessNumber(supplierDetail.businessNumber)
              }}</span>
            </div>
            <div class="info-row">
              <span class="label">대표자명</span>
              <span class="value">{{ supplierDetail.ceoName }}</span>
            </div>
            <div class="info-row">
              <span class="label">계약일자</span>
              <span class="value">{{
                formatDate(supplierDetail.signedAt)
              }}</span>
            </div>
            <div class="info-row">
              <span class="label">거래 상태</span>
              <span class="value">
                <span
                  class="status-indicator"
                  :class="{
                    active: supplierDetail.isActive,
                    inactive: !supplierDetail.isActive,
                  }"
                >
                  {{ supplierDetail.isActive ? "거래중" : "거래중단" }}
                </span>
              </span>
            </div>
          </div>
        </div>
        <!-- 주소 정보 -->
        <div class="info-card">
          <h3 class="card-title">주소 정보</h3>
          <div class="info-rows">
            <div class="info-row">
              <span class="label">우편번호</span>
              <span class="value">{{ supplierDetail.zipcode }}</span>
            </div>
            <div class="info-row">
              <span class="label">주소</span>
              <span class="value">{{ supplierDetail.address }}</span>
            </div>
          </div>
        </div>
        <!-- 연락처 정보 -->
        <div class="info-card">
          <h3 class="card-title">연락처 정보</h3>
          <div class="info-rows">
            <div class="info-row">
              <span class="label">회사 연락처</span>
              <span class="value">{{
                formatPhoneNumber(supplierDetail.companyPhone)
              }}</span>
            </div>
            <div class="info-row">
              <span class="label">담당자 연락처</span>
              <span class="value">{{
                formatPhoneNumber(supplierDetail.supplierPhone)
              }}</span>
            </div>
            <div class="info-row">
              <span class="label">담당자 이메일</span>
              <span class="value">{{ supplierDetail.supplierEmail }}</span>
            </div>
            <div class="info-row">
              <span class="label">담당자 이름</span>
              <span class="value">{{ supplierDetail.supplierName }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 공급처 정보 수정 모달 -->
      <div
        v-if="showEditModal"
        class="modal-overlay"
        @click.self="showEditModal = false"
      >
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>공급처 정보 수정</h3>
            <button class="close-button" @click="showEditModal = false"
              >&times;</button
            >
          </div>
          <form class="modal-body modal-grid" @submit.prevent="saveEdit">
            <div class="form-fields">
              <div class="form-group">
                <label class="edit-label"
                  >공급처명 <span class="required">*</span></label
                >
                <input
                  v-model="editData.name"
                  class="edit-input"
                  placeholder="공급처명을 입력하세요"
                  required
                />
              </div>
              <div class="form-group">
                <label class="edit-label">우편번호</label>
                <input
                  v-model="editData.zipcode"
                  class="edit-input"
                  placeholder="우편번호"
                />
              </div>
              <div class="form-group">
                <label class="edit-label">주소</label>
                <input
                  v-model="editData.address"
                  class="edit-input"
                  placeholder="주소를 입력하세요"
                />
              </div>
              <div class="form-group">
                <label class="edit-label"
                  >사업자번호 <span class="required">*</span></label
                >
                <input
                  v-model="editData.businessNumber"
                  class="edit-input"
                  placeholder="123-45-67890"
                  required
                />
              </div>
              <div class="form-group">
                <label class="edit-label"
                  >대표자명 <span class="required">*</span></label
                >
                <input
                  v-model="editData.ceoName"
                  class="edit-input"
                  placeholder="대표자명을 입력하세요"
                  required
                />
              </div>
              <div class="form-group">
                <label class="edit-label">계약일자</label>
                <input
                  v-model="editData.signedAt"
                  class="edit-input"
                  type="date"
                />
              </div>
              <div class="form-group">
                <label class="edit-label">회사 연락처</label>
                <input
                  v-model="editData.companyPhone"
                  class="edit-input"
                  placeholder="010-1234-5678"
                />
              </div>
              <div class="form-group">
                <label class="edit-label">담당자 이름</label>
                <input
                  v-model="editData.supplierName"
                  class="edit-input"
                  placeholder="담당자 이름"
                />
              </div>
              <div class="form-group">
                <label class="edit-label">담당자 연락처</label>
                <input
                  v-model="editData.supplierPhone"
                  class="edit-input"
                  placeholder="01012345678"
                />
              </div>
              <div class="form-group">
                <label class="edit-label">담당자 이메일</label>
                <input
                  v-model="editData.supplierEmail"
                  class="edit-input"
                  placeholder="example@email.com"
                  type="email"
                />
              </div>
              <div class="form-group">
                <label class="edit-label">거래 상태</label>
                <select v-model="editData.isActive" class="edit-input">
                  <option :value="true">거래중</option>
                  <option :value="false">거래중단</option>
                </select>
              </div>
            </div>
            <div class="modal-footer modal-footer-grid">
              <button class="btn btn-primary" type="submit">저장</button>
              <button
                class="btn btn-secondary"
                type="button"
                @click="showEditModal = false"
                >취소</button
              >
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import api from "@/lib/api";
import { useToast } from "@/composables/useToast";

const props = defineProps({
  supplierId: {
    type: [Number, String],
    required: false,
  },
});

const supplierDetail = ref(null);
const showEditModal = ref(false);
const editData = ref({});
const toast = useToast();

async function fetchSupplierDetail(id) {
  if (!id) {
    supplierDetail.value = null;
    return;
  }
  try {
    const res = await api.get(`/api/hq/suppliers/detail/${id}`);
    supplierDetail.value = res.data;
    // 모달용 데이터도 동기화
    editData.value = { ...res.data };
  } catch (e) {
    supplierDetail.value = null;
    console.error(`공급처 상세 조회 실패 (ID: ${id})`, e);
  }
}

onMounted(() => {
  fetchSupplierDetail(props.supplierId);
});

watch(
  () => props.supplierId,
  (newId) => {
    fetchSupplierDetail(newId);
  },
  { immediate: true }
);

const saveEdit = async () => {
  try {
    // 필요한 필드만 추려서 보냄
    const payload = {
      name: editData.value.name,
      ceoName: editData.value.ceoName,
      companyPhone: editData.value.companyPhone,
      address: editData.value.address,
      zipcode: editData.value.zipcode,
      businessNumber: editData.value.businessNumber,
      signedAt: editData.value.signedAt,
      isActive: editData.value.isActive,
      supplierName: editData.value.supplierName,
      supplierEmail: editData.value.supplierEmail,
      supplierPhone: editData.value.supplierPhone,
    };
    await api.put(
      `/api/hq/suppliers/modification/${props.supplierId}`,
      payload
    );
    showEditModal.value = false;
    fetchSupplierDetail(props.supplierId); // 저장 후 다시 조회
  } catch (e) {
    // toast.error("저장에 실패했습니다.");
  }
};

// 사업자등록번호 포맷팅 (000-00-00000)
const formatBusinessNumber = (businessNumber) => {
  if (!businessNumber) return "-";
  return businessNumber.replace(/(\d{3})(\d{2})(\d{5})/, "$1-$2-$3");
};
// 전화번호 포맷팅 (000-0000-0000)
const formatPhoneNumber = (phone) => {
  if (!phone) return "-";
  return phone.replace(/(\d{2,3})(\d{3,4})(\d{4})/, "$1-$2-$3");
};
// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
</script>

<style scoped>
.supplier-info {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 30px;
}
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #6c757d;
}
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}
.info-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.card-title {
  margin: 0 0 16px 0;
  color: #495057;
  font-size: 1.1rem;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 2px solid #667eea;
}
.info-rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}
.info-row .label {
  color: #6c757d;
  font-size: 15px;
  font-weight: 500;
  min-width: 100px;
}
.info-row .value {
  color: #212529;
  font-size: 15px;
  font-weight: 400;
  text-align: right;
  flex: 1;
  word-break: break-all;
}
.status-indicator {
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
}
.status-indicator.active {
  background: #d4edda;
  color: #155724;
}
.status-indicator.inactive {
  background: #f8d7da;
  color: #721c24;
}
.supplier-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.supplier-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.supplier-title h2 {
  margin: 0;
  color: #212529;
  font-size: 1.5rem;
  font-weight: 600;
}
.supplier-code {
  background: #f8f9fa;
  color: #6c757d;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: monospace;
}
.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}
.status-badge.active {
  background: #d4edda;
  color: #155724;
}
.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
}
.btn.edit-btn-top {
  background: #4066fa;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.btn.edit-btn-top:hover {
  background: #3056e0;
}
/* 모달 스타일 */
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
.modal-content {
  background: white;
  border-radius: 12px;
  width: 900px;
  max-width: 98vw;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
.modal-header {
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #212529;
}
.close-button {
  background: none;
  border: none;
  color: #6c757d;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}
.close-button:hover {
  background: #f8f9fa;
  color: #495057;
}
.modal-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.edit-label {
  font-size: 14px;
  color: #495057;
  margin-bottom: 4px;
  font-weight: 500;
}
.edit-input {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 15px;
  margin-bottom: 8px;
}
.modal-footer {
  padding: 0 24px 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
.btn.btn-primary {
  background: #4066fa;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.btn.btn-primary:hover {
  background: #3056e0;
}
.btn.btn-secondary {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.btn.btn-secondary:hover {
  background: #e9ecef;
  color: #495057;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}
.required {
  color: #dc3545;
  font-size: 13px;
  margin-left: 2px;
}
@media (max-width: 768px) {
  .supplier-info {
    padding: 15px;
  }
  .info-grid {
    grid-template-columns: 1fr;
  }
}
.modal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  /* gap: 20px 24px; */
}
.modal-footer.modal-footer-grid {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}
@media (max-width: 900px) {
  .modal-grid {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 600px) {
  .modal-grid {
    grid-template-columns: 1fr;
  }
}
.form-fields {
  display: contents;
}
</style>
