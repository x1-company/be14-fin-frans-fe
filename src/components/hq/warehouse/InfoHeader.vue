<template>
  <div class="info-header">
    <div class="info-header__title">{{ title }}</div>
    <div class="info-header__desc">{{ desc }}</div>
    <div class="info-header__tabs">
      <span
        v-for="(tab, idx) in tabs"
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
  background: #4066fa;
  border-radius: 12px 12px 0 0;
  padding: 28px 0px 0 0px;
  color: #fff;
  position: relative;
}
.info-header__title {
  font-size: 1.8rem;
  padding-left: 32px;
  font-weight: bold;
  margin-bottom: 24px;
}

.info-header__desc {
  background: #3453c7;
  padding: 12px 0 12px 30px;
  border-radius: 0 0 0 0;
  margin-bottom: 0;
  min-height: 1.5rem;
  display: flex;
  align-items: center;
  font-size: 1rem;
  line-height: 1.5;
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