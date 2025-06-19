<script setup>
// 대시보드 관련 로직 추가 예정
</script>

<template>
  <div class="info-form">
    <div class="dashboard-content">
      <h2>결재 대시보드</h2>
      <p>결재 현황을 한눈에 확인할 수 있습니다.</p>

      <!-- 대시보드 내용 추가 예정 -->
      <div class="dashboard-placeholder">
        <p>대시보드 내용이 여기에 표시됩니다.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-form {
  background: #fff;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 8px 0 rgba(64, 102, 250, 0.03);
  padding: 24px 32px;
  width: 100%;
  box-sizing: border-box;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dashboard-content h2 {
  margin: 0;
  color: #212529;
  font-size: 24px;
  font-weight: 600;
}

.dashboard-content p {
  margin: 0;
  color: #6c757d;
  font-size: 16px;
}

.dashboard-placeholder {
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  color: #6c757d;
}

.dashboard-placeholder p {
  margin: 0;
  font-size: 16px;
}
</style>
