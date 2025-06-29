<template>
  <div style="display: flex; flex-direction: column; align-items: center;">
    <Doughnut
      v-if="filteredData.length"
      :key="selectedFranchiseId + '-' + props.month"
      :data="doughnutData"
      :options="doughnutOptions"
      style="width: 220px; height: 220px; display: block;"
    />
    <div v-else style="text-align:center; color:#888; padding:32px 0;">
      데이터가 없습니다.
    </div>
    <div v-if="filteredData.length" class="custom-legend" style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 12px 20px; justify-content: center;">
      <div v-for="(label, idx) in doughnutData.labels" :key="idx" style="display: flex; align-items: center; min-width: 84px;">
        <span :style="{display:'inline-block', width:'13px', height:'13px', background: doughnutData.datasets[0].backgroundColor[idx], marginRight:'6px', borderRadius:'3px'}"></span>
        <span style="min-width: 84px;">{{ label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'

const props = defineProps({
  chartData: {
    type: Array,
    default: () => []
  },
  month: Number,
  selectedFranchiseId: [String, Number]
})

// 월별 + 자재별 집계
const filteredData = computed(() => {
  const monthData = props.chartData.filter(item => item.month === props.month)
  // 자재별 합산
  const productMap = {}
  monthData.forEach(item => {
    const key = item.productName || item.productId
    if (!productMap[key]) {
      productMap[key] = 0
    }
    productMap[key] += item.orderQuantity
  })
  return Object.entries(productMap).map(([product, qty]) => ({ product, qty }))
})

const colorPalette = [
  '#3867F4', // 진한 파랑
  '#FF8855', // 연한 주황
  '#EAF0FA', // 아주 연한 회색/블루
  '#A259F7', // 보라
  '#FFC145', // 머스타드/노랑
  '#F7B2B7', // 연핑크 (보조)
  '#B5EAD7', // 민트 (보조)
  '#B2C7DA', // 연블루그레이 (보조)
  '#F6EAC2', // 연노랑 (보조)
  '#C3C8E6'  // 연보라 (보조)
]

const doughnutData = computed(() => {
  // 데이터를 수량 기준으로 정렬
  const sortedData = filteredData.value
    .map(item => ({
      label: item.product,
      value: item.qty
    }))
    .sort((a, b) => b.value - a.value)

  // 상위 10개와 나머지 분리
  const top10 = sortedData.slice(0, 10)
  const others = sortedData.slice(10)
  
  let labels = top10.map(item => item.label)
  let data = top10.map(item => item.value)
  
  // 나머지가 있으면 "기타"로 묶기
  if (others.length > 0) {
    const othersSum = others.reduce((sum, item) => sum + item.value, 0)
    labels.push('기타')
    data.push(othersSum)
  }

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colorPalette.slice(0, labels.length),
        borderWidth: 2
      }
    ]
  }
})

const doughnutOptions = {
  responsive: false,
  maintainAspectRatio: false,
  cutout: '70%',
  layout: { padding: 0 },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          const value = context.raw
          const total = context.dataset.data.reduce((a, b) => a + b, 0)
          const percent = total ? ((value / total) * 100).toFixed(1) : 0
          return `${context.label}: ${value}건 (${percent}%)`
        }
      }
    },
    title: {
      display: false
    }
  },
  animation: {
    animateRotate: true,
    duration: 1200
  },
  rotation: -90,
  circumference: 360
}
</script>

<style scoped>
.custom-legend {
  font-size: 12px;
}
</style> 