<template>
  <div class="info-header">
    <div class="info-header__title">{{ title }}</div>
    <div class="info-header__desc">{{ desc }}</div>
    <div class="info-header__tabs">
      <span
        v-for="(tab, idx) in ['구매관리']"
        :key="tab"
        :class="['info-header__tab', { active: idx === activeTab }]"
        @click="$emit('change-tab', idx)"
      >
        {{ tab }}
      </span>
    </div>
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
.info-header__tabs {
  position: absolute;
  right: 32px;
  bottom: 0;
  display: flex;
  gap: 32px;
  padding: 0 24px;
  border-radius: 0 0 12px 12px;
  height: 48px;
  align-items: center;
}
.info-header__tab {
  color: #bfcfff;
  font-size: 0.95rem;
  margin-top: 10px;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s, font-weight 0.2s;
}
.info-header__tab.active {
  color: #fff;
  font-weight: bold;
}
.info-header__tab:hover {
  color: #fff;
  font-weight: bold;
}
</style>