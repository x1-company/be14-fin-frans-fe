<script setup>
const props = defineProps({
  company: Object
})
</script>

<template>
  <div class="info-container">
    <!-- Header Section -->
    <div class="info-header">
      <div class="breadcrumb">
        <span>HOME</span>
        <span class="separator">></span>
        <span>공급처관리</span>
        <span class="separator">></span>
        <span>공급처정보</span>
      </div>
      
      <div class="header-banner">
        <h1 class="page-title">공급처 정보</h1>
        <p class="page-description">공급처의 기본 정보와 계약 현황을 확인하고 관리할 수 있습니다.</p>
        <div class="header-actions">
          <button class="btn btn-outline">공급처 정보</button>
          <button class="btn btn-outline">납품관리</button>
          <button class="btn btn-primary">발주관리</button>
        </div>
      </div>
    </div>
    
    <!-- Scrollable Content -->
    <div class="info-content">
      <div class="content-header">
        <h2>공급처 정보</h2>
        <button class="edit-btn">✏️ 수정</button>
      </div>
      
      <div class="info-sections">
        <!-- Basic Information -->
        <section class="info-section">
          <h3 class="section-title">📋 기본 정보</h3>
          <div class="info-grid">
            <div class="info-row">
              <div class="info-item">
                <label>공급처코드</label>
                <span>{{ company.id }}</span>
              </div>
              <div class="info-item">
                <label>사업자번호</label>
                <span>{{ company.businessNumber }}</span>
              </div>
            </div>
            
            <div class="info-row">
              <div class="info-item">
                <label>거래처명</label>
                <span>{{ company.name }}</span>
              </div>
              <div class="info-item">
                <label>계약일자</label>
                <span>📅 {{ company.registrationDate }}</span>
              </div>
            </div>
            
            <div class="info-row">
              <div class="info-item full-width">
                <label>주소</label>
                <div>
                  <span>📍 {{ company.address }}</span>
                  <div class="postal-code">우편번호: {{ company.postalCode }}</div>
                </div>
              </div>
            </div>
            
            <div class="info-row">
              <div class="info-item">
                <label>대표자</label>
                <span>{{ company.representative }}</span>
              </div>
            </div>
          </div>
        </section>
        
        <!-- Contact Information -->
        <section class="info-section">
          <h3 class="section-title">📞 연락처 정보</h3>
          <div class="contact-grid">
            <div class="contact-item">
              <label>회사 연락처</label>
              <div class="contact-details">
                <span class="contact-label">전화번호</span>
                <span class="contact-value">{{ company.phone }}</span>
              </div>
            </div>
            
            <div class="contact-item">
              <label>담당자 연락처</label>
              <div class="contact-details">
                <span class="contact-label">담당자 이름</span>
                <span class="contact-value">홍길동</span>
              </div>
              <div class="contact-details">
                <span class="contact-label">담당자 이메일</span>
                <span class="contact-value">📧 {{ company.email }}</span>
              </div>
              <div class="contact-details">
                <span class="contact-label">담당자 연락처</span>
                <span class="contact-value">📞 010-1234-5678</span>
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
  background: white;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  justify-content: space-between;
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