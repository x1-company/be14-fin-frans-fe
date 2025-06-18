<template>
  <div class="user-type-header">
    <div class="user-type-tabs">
      <button
        v-for="(tab, index) in tabs"
        :key="tab"
        :class="['user-type-tab', { active: index === activeTab }]"
        @click="selectTab(index, tab)"
      >
        {{ tab }}
      </button>
    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  activeTab: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['select-user-type'])

const tabs = ['본사', '가맹점', '공급처']

const selectTab = (index, tabText) => {
  emit('select-user-type', index, tabText)
}
</script>

<style scoped>
.user-type-header {
  background: white;
  border-bottom: 1px solid #e9ecef;
}

.user-type-tabs {
  display: flex;
  gap: 0;
  padding: 0 32px;
}

.user-type-tab {
  background: none;
  border: none;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 500;
  color: #6c757d;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;
  border-bottom: 2px solid transparent;
}

.user-type-tab:hover {
  color: #4066fa;
}

.user-type-tab.active {
  color: #4066fa;
  font-weight: 600;
  border-bottom-color: #4066fa;
}

.user-type-tab:focus {
  outline: none;
}
</style>