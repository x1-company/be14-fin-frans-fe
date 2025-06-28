<template>
  <div class="info-header">
    <div class="info-header__title">{{ title }}</div>
    <div class="info-header__desc">{{ desc }}</div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  desc: String,
  tabs: Array,
  activeTab: Number,
});
</script>

<style scoped>
.info-header {
  /* margin: 10px 30px 0px 30px; */
  background: #4066fa;
  border-radius: 12px 12px 0 0;
  padding: 5px 0 0 0;
  font-size: 0.9rem;
  color: #fff;
  position: relative;
}
.info-header__title {
  font-size: 1.4rem;
  padding-left: 32px; /* info-form과 같은 패딩으로 정렬 */
  font-weight: bold;
  margin-top: 17px;
  margin-bottom: 20px;
}
.info-header__edit-button {
  background: none;
  border: 1px solid #ffffffa0; /* 흰색 테두리 */
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  margin-right: 30px; /* 오른쪽 여백 추가 */
  transition: background-color 0.2s, border-color 0.2s;
}
.info-header__edit-button:hover {
  background-color: #ffffff20; /* 호버 시 약간 밝아지게 */
  border-color: #fff;
}
.info-header__desc {
  background: #3453c7;
  padding: 8px 0 8px 30px;
  margin-top: -5px;
}
</style>