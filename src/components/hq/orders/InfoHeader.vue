<template>
    <div class="info-header">
      <div class="info-header__title">{{ title }}</div>
      <div class="info-header__desc">{{ desc }}</div>
      <div class="info-header__tabs">
        <span
          v-for="(tab, idx) in tabs"
          :key="tab"
          :class="['info-header__tab', { active: idx === activeTab }]"
          @click="selectTab(idx, tab)"
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
  
  const emit = defineEmits(["update-breadcrumb"]);
  
  const selectTab = (index, tabText) => {
    console.log(tabText);
    // 실제 탭 전환 로직이 추가되면 activeTab을 변경해야 합니다.
    // 현재는 props로 activeTab을 받으므로 직접 변경하지 않습니다.
    emit("update-breadcrumb", ["HOME", "가맹점관리", tabText]);
  };
  </script>
  
  <style scoped>
  .info-header {
    /* margin: 10px 30px 0px 30px; */
    background: #4066fa;
    border-radius: 12px 12px 0 0;
    padding: 28px 0px 0 0px;
    color: #fff;
    position: relative;
  }
  .info-header__title {
    font-size: 1.8rem;
    padding-left: 32px; /* info-form과 같은 패딩으로 정렬 */
    font-weight: bold;
    margin-bottom: 24px;
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
    padding: 12px 0 12px 30px;
    border-radius: 0 0 0 0;
    margin-bottom: 0;
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
    font-size: 1.1rem;
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
  