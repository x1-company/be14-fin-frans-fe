<template>
  <nav class="breadcrumb">
    <span v-for="(item, idx) in items" :key="idx" class="breadcrumb__item">
      <span>{{ item }}</span>
      <span v-if="idx < items.length - 1" class="breadcrumb__divider"
        >&gt;</span
      >
    </span>
  </nav>
</template>

<script setup>
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
});
</script>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  color: #888;
  padding-left: 50px;
  background: #fafbff;
  font-family: "NanumSquareOTF", sans-serif;
}
.breadcrumb__item {
  display: flex;
  align-items: center;
  color: #888;
  font-weight: 500;
  font-size: 1rem;
}
.breadcrumb__divider {
  margin: 0 8px;
  color: #bdbdbd;
  font-size: 1.1rem;
}
</style>
