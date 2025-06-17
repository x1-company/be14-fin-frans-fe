<!-- PageLayout.vue -->
<template>
    <div class="page-layout">
      <div class="page-header">
        <slot name="header" />
      </div>
      <div class="page-content">
        <slot />
      </div>
    </div>
  </template>
  
  <style scoped>
  .page-layout {
    padding: 24px;
  }
  .page-header {
    background-color: #1e40af;
    color: white;
    border-radius: 12px 12px 0 0;
    padding: 20px;
  }
  .page-content {
    background-color: white;
    border-radius: 0 0 12px 12px;
    padding: 24px;
    margin-top: -10px;
  }
  </style>
  