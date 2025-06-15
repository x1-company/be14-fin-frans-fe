<script setup>
import { ref, onMounted, computed } from "vue";
import api from "@/lib/api";

import Breadcrumb from "@/components/hq/common/Breadcrumb.vue";
import InfoHeader from "@/components/hq/supplier/InfoHeader.vue";
import InfoForm from "@/components/hq/supplier/InfoForm.vue";

const props = defineProps({
  company: Object,
});

const supplier = ref(null);
const breadcrumbItems = ref(["HOME", "공급처관리", "공급처정보"]);
const selectedSupplierId = computed(() => props.company?.id);
const updateBreadcrumb = (newItems) => {
  breadcrumbItems.value = newItems;
};

onMounted(async () => {
  if (!props.company?.id) return;
  const { data } = await api.get(
    `/api/hq/suppliers/detail/${props.company.id}`
  );
  supplier.value = data;
});
</script>

<template>
  <div class="info-container">
    <div class="breadcrumb-container">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <!-- Scrollable Content -->
    <div class="info-content">
      <div class="header-banner">
        <div class="info-group">
          <InfoHeader
            title="공급처 정보"
            desc="공급처의 기본 정보와 계약 현황을 확인하고 관리할 수 있습니다."
            :tabs="['공급처 정보', '납품관리', '발주관리']"
            :activeTab="0"
            @update-breadcrumb="updateBreadcrumb"
          />
          <!-- InfoForm에 supplierId만 넘겨주면 됨 -->
          <InfoForm :supplierId="selectedSupplierId" />
        </div>
      </div>
      <!-- 본문 시작 -->
      <div class="content-header">
        <button class="edit-btn">✏️ 수정</button>
      </div>

      <div v-if="supplier" class="info-sections">
        <!-- 기본 정보 -->
        <section class="info-section">
          <h3 class="section-title">📋 기본 정보</h3>
          <div class="info-grid">
            <div class="info-row">
              <div class="info-item">
                <label>공급처코드</label>
                <span>{{ supplier.code }}</span>
              </div>
              <div class="info-item">
                <label>사업자번호</label>
                <span>{{ supplier.businessNumber }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <label>거래처명</label>
                <span>{{ supplier.name }}</span>
              </div>
              <div class="info-item">
                <label>계약일자</label>
                <span>📅 {{ supplier.signedAt.split("T")[0] }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item full-width">
                <label>주소</label>
                <div>
                  <span>📍 {{ supplier.address }}</span>
                  <div class="postal-code"
                    >우편번호: {{ supplier.zipcode }}</div
                  >
                </div>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <label>대표자</label>
                <span>{{ supplier.ceoName }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 연락처 정보 -->
        <section class="info-section">
          <h3 class="section-title">📞 연락처 정보</h3>
          <div class="contact-grid">
            <div class="contact-item">
              <label>회사 연락처</label>
              <div class="contact-details">
                <span class="contact-label">전화번호</span>
                <span class="contact-value">{{ supplier.companyPhone }}</span>
              </div>
            </div>
            <div class="contact-item">
              <label>담당자 연락처</label>
              <div class="contact-details">
                <span class="contact-label">담당자 이름</span>
                <span class="contact-value">{{ supplier.supplierName }}</span>
              </div>
              <div class="contact-details">
                <span class="contact-label">담당자 이메일</span>
                <span class="contact-value">{{ supplier.supplierEmail }}</span>
              </div>
              <div class="contact-details">
                <span class="contact-label">담당자 연락처</span>
                <span class="contact-value">{{ supplier.supplierPhone }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8f9fa;
}

.info-header {
  /* background: transparent; */
  border-bottom: 1px solid #e9ecef;
}

.breadcrumb {
  padding: 16px 24px;
  font-size: 14px;
  color: #6c757d;
}

.separator {
  margin: 0 8px;
}

.header-banner {
  /* background: blue; */
  color: white;
  padding: 32px 24px;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 8px 0;
}

.page-description {
  margin: 0 0 24px 0;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-outline {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-primary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-primary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.info-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.content-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 24px;
}

.content-header h2 {
  margin: 0;
  color: #212529;
}

.edit-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.info-sections {
  background: white;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  margin: 0 0 20px 0;
  color: #212529;
  font-size: 18px;
  font-weight: 600;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  gap: 24px;
}

.info-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full-width {
  flex: 2;
}

.info-item label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.info-item span {
  font-size: 15px;
  color: #212529;
}

.postal-code {
  font-size: 13px;
  color: #6c757d;
  margin-top: 4px;
}

.contact-grid {
  display: flex;
  gap: 32px;
}

.contact-item {
  flex: 1;
}

.contact-item label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 12px;
}

.contact-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f3f4;
}

.contact-details:last-child {
  border-bottom: none;
}

.contact-label {
  font-size: 14px;
  color: #6c757d;
}

.contact-value {
  font-size: 14px;
  color: #212529;
  font-weight: 500;
}
</style>
