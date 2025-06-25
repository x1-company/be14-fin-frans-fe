<template>
  <div class="approval-line-section">
    <h3 class="section-title">결재선 및 서명</h3>
    <div class="approval-cards">
      <ApprovalLineCard
        v-for="(person, idx) in lines"
        :key="person.id || idx"
        :person="person"
      />
    </div>
  </div>
</template>
<script setup>
import ApprovalLineCard from "./ApprovalLineCard.vue";
defineProps({ lines: Array });
</script>
<style scoped>
.approval-cards {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
}
</style>
