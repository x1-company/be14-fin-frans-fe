<template>
  <div class="donut-chart-container">
    <div class="month-selector">
      <label>월 선택:</label>
      <select v-model="selectedMonth" @change="onMonthChange">
        <option v-for="m in 12" :key="m" :value="m">{{ m }}월</option>
      </select>
    </div>
    <Doughnut
      v-if="filteredData.length"
      :key="selectedFranchiseId + '-' + selectedMonth"
      :data="doughnutData"
      :options="doughnutOptions"
      style="max-width: 400px; height: 300px; margin: 0 auto"
    />
    <div v-else style="text-align:center; color:#888; padding:32px 0;">
      데이터가 없습니다.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js'

Chart.register(ArcElement, Tooltip, Legend, Title)

function getPrevMonth() {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth(); // 0~11, 저번 달
  if (month === 0) {
    year -= 1;
    month = 12;
  }
  return { year, month };
}

const props = defineProps({
  chartData: {
    type: Array,
    default: () => []
  },
  month: Number,
  selectedFranchiseId: [String, Number]
})

const emit = defineEmits(['month-change'])

const { month: prevMonth } = getPrevMonth();
const selectedMonth = ref(props.month ?? prevMonth)

function onMonthChange() {
  emit('month-change', selectedMonth.value)
}

// 가맹점 id가 바뀔 때만 selectedMonth를 저번 달로 리셋
watch(
  () => props.selectedFranchiseId,
  () => {
    const { month } = getPrevMonth();
    selectedMonth.value = month;
    emit('month-change', month);
  }
)

// 월별 + 자재별 집계
const filteredData = computed(() => {
  const monthData = props.chartData.filter(item => item.month === selectedMonth.value)
  // 자재별 합산
  const productMap = {}
  monthData.forEach(item => {
    const key = item.productName || item.productId
    if (!productMap[key]) {
      productMap[key] = 0
    }
    productMap[key] += item.returnQuantity
  })
  return Object.entries(productMap).map(([product, qty]) => ({ product, qty }))
})

const colorPalette = [
  '#4F5DFF', '#FFB800', '#FF5A5A', '#1BC47D', '#888', '#A8DADC', '#89CFF0', '#B0E0E6', '#CAE4DB', '#D3E4CD', '#F0E2E6', '#F7D6BF', '#E8D9F0'
]

const doughnutData = computed(() => {
  const labels = filteredData.value.map(item => item.product)
  const data = filteredData.value.map(item => item.qty)
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
  responsive: true,
  cutout: '70%',
  plugins: {
    legend: {
      display: true,
      position: 'bottom'
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
.month-selector {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.donut-chart-container {
  min-height: 340px; /* 차트+셀렉트 높이만큼 고정, 흔들림 방지 */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
</style> 