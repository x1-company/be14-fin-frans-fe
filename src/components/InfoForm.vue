<template>
  <div class="info-form">
    <div class="info-form__header">
      <span>{{ title }}</span>
      <button v-if="onEdit" class="info-form__edit" @click="onEdit"
        >수정</button
      >
    </div>
    <div class="info-form__body">
      <div v-for="(row, idx) in rows" :key="idx" class="info-form__row">
        <div v-for="(item, jdx) in row" :key="jdx" class="info-form__item">
          <label>{{ item.label }}</label>
          <input
            v-if="item.type !== 'select'"
            :type="item.type || 'text'"
            :value="item.value"
            readonly
          />
          <select v-else :value="item.value" disabled>
            <option v-for="opt in item.options" :key="opt" :value="opt">{{
              opt
            }}</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  rows: Array,
  onEdit: Function,
});
</script>

<style scoped>
.info-form {
  background: #fff;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 8px 0 rgba(64, 102, 250, 0.03);
  padding: 50px 60px 40px 60px;
  margin: 0px 30px;
  padding-bottom: 100px;
}
.info-form__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 30px;
}
.info-form__edit {
  background: #4066fa;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 18px;
  font-size: 1rem;
  cursor: pointer;
}
.info-form__body {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.info-form__row {
  display: flex;
  gap: 32px;
}
.info-form__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.info-form__item label {
  font-size: 1rem;
  color: #222;
  margin-bottom: 4px;
}
.info-form__item input,
.info-form__item select {
  padding: 8px 12px;
  border: 1px solid #e6eaff;
  border-radius: 8px;
  font-size: 1rem;
  background: #fafbff;
}
.info-group {
  width: 1100px; /* 원하는 고정 크기 */
  max-width: 100%;
  margin: 32px auto 0 auto; /* 위쪽 여백, 가운데 정렬 */
  display: flex;
  flex-direction: column;
  gap: 0; /* InfoHeader, InfoForm이 딱 붙게 */
}
</style>
