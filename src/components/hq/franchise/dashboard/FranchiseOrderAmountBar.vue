<template>
  <div>
    <Bar v-if="chartData && chartData.length" :data="barData" :options="barOptions" />
    <div v-else style="text-align:center; color:#888; padding:32px 0;">데이터가 없습니다.</div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  PointElement,
  LineElement
} from 'chart.js'

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title, PointElement, LineElement)

const props = defineProps({
  chartData: {
    type: Array,
    default: () => []
  },
  trendVisible: {
    type: Boolean,
    default: false
  }
})

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

const PASTEL_COLORS = [
  '#A3CEF1', '#B6E2D3', '#F9F6C9', '#F7D6E0', '#D7C0F7', '#FFD6A5',
  '#B5EAD7', '#FFDAC1', '#E2F0CB', '#C7CEEA', '#FFB7B2', '#B5B9F7'
];

const formatYAxis = value => {
  if (value === 0) return '0원';
  if (value >= 1000) return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return value.toLocaleString() + '원';
};

const animatedPoints = ref(0)
watch(() => props.trendVisible, (val) => {
  if (val) {
    animatedPoints.value = 0
    animatePoints()
  } else {
    animatedPoints.value = 0
  }
})
function animatePoints() {
  let i = 0
  const total = 12
  function step() {
    if (i <= total) {
      animatedPoints.value = i
      i++
      setTimeout(step, 120)
    }
  }
  step()
}

function pastelToAlpha(color, alpha = 0.15) {
  // HEX -> rgba 변환
  if (color.startsWith('#')) {
    const hex = color.replace('#', '')
    const bigint = parseInt(hex, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return `rgba(${r},${g},${b},${alpha})`
  }
  // 이미 rgba면 그대로
  return color
}

const barData = computed(() => {
  const monthMap = {}
  props.chartData.forEach(item => {
    monthMap[item.month] = item.orderAmount
  })
  const isMonthly = props.chartData.length && props.chartData[0].month !== undefined
  const bar = {
    label: '주문 금액',
    data: isMonthly ? MONTHS.map(m => monthMap[m] ?? null) : props.chartData.map(item => item.orderAmount),
    backgroundColor: props.trendVisible
      ? (isMonthly
        ? PASTEL_COLORS.map(c => pastelToAlpha(c, 0.15))
        : PASTEL_COLORS.slice(0, props.chartData.length).map(c => pastelToAlpha(c, 0.15)))
      : (isMonthly ? PASTEL_COLORS : PASTEL_COLORS.slice(0, props.chartData.length)),
    borderRadius: 6,
    type: 'bar',
    order: 1
  }
  if (props.trendVisible && isMonthly) {
    const lineData = MONTHS.map((m, idx) => idx < animatedPoints.value ? (monthMap[m] ?? null) : null)
    return {
      labels: MONTHS.map(m => `${m}월`),
      datasets: [
        bar,
        {
          label: '동향',
          data: lineData,
          type: 'line',
          order: 2,
          borderColor: '#1a6ed8',
          backgroundColor: '#fff',
          pointBackgroundColor: '#1a6ed8',
          pointBorderColor: '#1a6ed8',
          pointRadius: 7,
          pointHoverRadius: 10,
          borderWidth: 3,
          fill: false,
          tension: 0.35,
          spanGaps: true,
          showLine: true
        }
      ]
    }
  }
  return {
    labels: isMonthly ? MONTHS.map(m => `${m}월`) : (props.chartData.map(item => item.franchiseName || item.name || item.franchise || item.franchise_id || '가맹점')),
    datasets: [bar]
  }
})

const barOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: formatYAxis
      },
      grid: { display: false }
    },
    x: {
      ticks: {
        autoSkip: false,
        maxRotation: 45,
        minRotation: 20
      },
      grid: { display: false }
    }
  }
}
</script> 