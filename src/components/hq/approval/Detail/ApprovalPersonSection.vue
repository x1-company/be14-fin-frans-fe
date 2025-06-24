<template>
  <div class="section-container">
    <div class="section-header">
      <span class="section-icon">
        <slot name="icon"></slot>
      </span>
      <h3 class="section-title">{{ title }}</h3>
    </div>
    <div class="person-list">
      <ApprovalPersonCard
        v-for="person in people"
        :key="person.id"
        :person="person"
        :type="type"
      />
    </div>
  </div>
</template>
<script setup>
import ApprovalPersonCard from "./ApprovalPersonCard.vue";

const props = defineProps({
  title: String,
  people: Array,
  type: String,
});
</script>
<style scoped>
.section-container {
  background: white;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.section-icon {
  font-size: 20px;
  color: #6c757d;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  margin: 0;
}
.person-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
