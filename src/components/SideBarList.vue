<template>
  <div class="sidebar__list">
    <div
      v-for="(item, idx) in list"
      :key="item.id || idx"
      class="sidebar__card"
      :class="{ selected: idx === selectedIndex }"
    >
      <div class="sidebar__card-header">
        <img :src="item.icon" class="sidebar__card-icon" />
        <span class="sidebar__card-title">{{ item.name }}</span>
        <span class="sidebar__card-badge">공급처</span>
      </div>
      <div class="sidebar__card-info">
        <span>📞 {{ item.phone }}</span>
      </div>
      <div class="sidebar__card-info">
        <span>{{ item.manager }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  list: {
    type: Array,
    required: true,
  },
  selectedIndex: {
    type: Number,
    default: 0,
  },
});
</script>

<style scoped>
.sidebar__list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sidebar__card {
  background: #f8faff;
  border: 1.5px solid #e6eaff;
  border-radius: 10px;
  padding: 12px 10px;
  box-shadow: 0 2px 8px 0 rgba(64, 102, 250, 0.03);
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  transition: border 0.2s, background 0.2s;
}
.sidebar__card.selected {
  background: #e6f0ff;
  border: 1.5px solid #4066fa;
}
.sidebar__card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.sidebar__card-icon {
  width: 24px;
  height: 24px;
}
.sidebar__card-title {
  font-weight: bold;
  color: #222;
}
.sidebar__card-badge {
  background: #e3f8ea;
  color: #3bb77e;
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 6px;
  padding: 2px 8px;
  margin-left: 8px;
}
.sidebar__card-info {
  font-size: 0.95rem;
  color: #888;
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
