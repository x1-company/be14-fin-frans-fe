<template>
  <div>
    <!-- 가맹점 미선택 시에만 월 선택 표시 -->
    <div v-if="!isFranchiseSelected" class="month-selector">
      <label>월 선택:</label>
      <select v-model="selectedMonth" @change="onMonthChange">
        <option v-for="m in 12" :key="m" :value="m">{{ m }}월</option>
      </select>
    </div>
    
    <Bar
      v-if="chartData && chartData.length"
      :data="barData"
      :options="barOptions"
      style="max-width: 600px; height: 300px; margin: 0 auto"
    />
    
    <div v-else style="text-align:center; color:#888; padding:32px 0;">
      데이터가 없습니다.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
} from 'chart.js'

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title)

const props = defineProps({
  chartData: {
    type: Array,
    default: () => []
  },
  month: {
    type: Number,
    default: new Date().getMonth() + 1
  },
  isFranchiseSelected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['month-change'])

const selectedMonth = ref(props.month)
watch(() => props.month, (val) => { selectedMonth.value = val })

function onMonthChange() {
  emit('month-change', selectedMonth.value)
}

const barData = computed(() => ({
  labels: props.chartData.map(item => item.franchiseName),
  datasets: [
    {
      label: '주문 금액',
      data: props.chartData.map(item => item.orderAmount),
      backgroundColor: props.chartData.map((_, index) => colorPalette[index % colorPalette.length]),
      borderRadius: 6
    }
  ]
}))

const colorPalette = [
  '#A8DADC', // 파스텔 민트
  '#89CFF0', // 파스텔 블루
  '#B0E0E6', // 파스텔 하늘색
  '#CAE4DB', // 연한 민트
  '#D3E4CD', // 연한 연두
  '#F0E2E6', // 연한 핑크
  '#F7D6BF', // 연한 살구색
  '#E8D9F0'  // 연한 라벤더
]

const barOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false },
    tooltip: {
      callbacks: {
        label: function (context) {
          const value = context.raw
          return '주문 금액: ' + value.toLocaleString() + '원'
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: value => {
          if (value >= 1_000_000) return (value / 1_000_000) + 'M'
          if (value >= 1_000) return (value / 1_000) + 'K'
          return value
        }
      }
    },
    x: {
      ticks: {
        align: 'center',
        crossAlign: 'center',
        autoSkip: false,
        maxRotation: 0,
        minRotation: 0
      }
    }
  }
}
</script>

<style scoped>
.month-selector {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
