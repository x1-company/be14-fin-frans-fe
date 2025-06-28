<template>
  <div class="card return-card">
    <div class="return-title">
      <span class="return-icon">↩️</span>
      반품 정보
    </div>

    <!-- 반품번호 & 총 반품금액 박스 -->
    <div class="info-box-row">
      <div class="info-box blue">
        <span class="label">반품 번호</span>
        <span class="value">{{ returnData.returnCode || '-' }}</span>
      </div>
      <div class="info-box green">
        <span class="label">총 반품 금액</span>
        <span class="value">{{ (returnData.totalAmount ?? 0).toLocaleString() }}원</span>
      </div>
    </div>

    <!-- 날짜, 수량, 상태 -->
    <div class="info-grid">
      <div class="label">반품 날짜</div>
      <div class="value">{{ returnData.createdAt?.split('T')[0] || '-' }}</div>
      <div class="label">반품 상태</div>
      <div class="value return-status">{{ statusText || '-' }}</div>
      <div class="label">반품 사유</div>
      <div class="value">{{ returnData.description || '-' }}</div>
    </div>

    <!-- 반려 사유 -->
    <div class="reject-box">
      <div class="reject-title">반려 사유</div>
      <div class="reject-reason">
          {{ props.returnData.rejectedReason || '-' }}
      </div>
    </div>

    <!-- 첨부파일 미리보기 -->
    <div v-if="returnData.files?.length" class="file-preview">
      <div class="preview-title">첨부 파일</div>
      <div class="preview-list">
        <div
          class="preview-item"
          v-for="file in returnData.files"
          :key="file.id"
        >
          <a :href="file.url" target="_blank" download>
            <img :src="file.url" :alt="file.name" class="preview-img" />
            <div class="file-name">{{ file.name }}</div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({
  returnData: Object,
  isEditing: Boolean,
  rejectReason: String
});

const emit = defineEmits(['update:rejectReason']);
function onInput(e) {
  emit('update:rejectReason', e.target.value);
}

const statusText = computed(() => {
  switch(props.returnData.status) {
    case 'WAITING_FOR_RECEIPT': return '접수 대기';
    case 'REJECTED': return '반려';
    case 'REVIEW_COMPLETED': return '검토 완료';
    case 'APPROVED': return '결재 완료';
    case 'PICKING_UP': return '반품 수거 중';
    case 'PICKED_UP': return '반품 수거 완료';
    case 'COMPLETED': return '반품 완료';
    default: return props.returnData.status;
  }
});


</script>

<style scoped>
.card.return-card {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.04);
  padding: 25px 24px;
  margin-top: 20px;
  background: #fff;
  max-width: 100%;
  width: 100%;
}

.return-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-box-row {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  max-width: 97%;
}

.info-box {
  flex: 1;
  border-radius: 8px;
  padding: 16px;
  color: #222;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.info-box .label {
  font-weight: 500;
  color: #3b3b3b;
}

.info-box .value {
  font-weight: 700;
  font-size: 13px;
}

.info-box.blue {
  background-color: #eef5ff;
  color: #1976d2;
}

.info-box.green {
  background-color: #e9f9ee;
  color: #388e3c;
}

.info-grid {
  display: grid;
  grid-template-columns: 150px 1fr 150px 1fr;
  row-gap: 12px;
  column-gap: 16px;
  align-items: center;
  margin-bottom: 24px;
}

.info-grid .label {
  color: #6b7280;
  margin-left: 5px;
  font-size: 13px;
  font-weight: 500;
}

.info-grid .value {
  font-size: 13px;
  font-weight: 500;
  margin: 0 30px;
  text-align: right;
}

.return-status {
  font-weight: 700;
  color: #1976d2;
}

.reject-box {
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-left: -10px;
  padding: 16px;
  color: #333;
}

.reject-title {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 8px;
  color: #666;
}

.reject-reason {
  font-size: 13px;
  color: #444;
}

.file-preview {
  margin-top: 24px;
}

.preview-title {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 12px;
  color: #333;
}

.preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.preview-item {
  width: 120px;
  text-align: center;
}

.preview-img {
  width: 100%;
  height: auto;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.preview-img:hover {
  transform: scale(1.05);
}

.file-name {
  margin-top: 6px;
  font-size: 12px;
  color: #555;
  word-break: break-all;
}

.reason-textarea {
  width: 100%;
  min-height: 90px;
  border: 2px solid #bdbdbd;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 15px;
  font-family: inherit;
  color: #222;
  background: #fff;
  box-sizing: border-box;
  transition: border 0.2s, box-shadow 0.2s;
  resize: vertical;
}
.reason-textarea:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px #e3eefd;
}
</style>
