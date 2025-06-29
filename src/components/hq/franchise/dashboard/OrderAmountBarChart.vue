<template>
  <div>
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
import { computed } from 'vue'
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
  month: Number,
  isFranchiseSelected: {
    type: Boolean,
    default: false
  },
  selectedFranchiseId: [String, Number],
  trendVisible: {
    type: Boolean,
    default: false
  }
})

const barData = computed(() => {
  const labels = props.chartData.map(item => item.franchiseName)
  const bar = {
    label: '주문 금액',
    data: props.chartData.map(item => item.orderAmount),
    backgroundColor: props.chartData.map((_, index) => colorPalette[index % colorPalette.length]),
    borderRadius: 6,
    type: 'bar',
    order: 1
  }
  if (props.trendVisible) {
    return {
      labels,
      datasets: [
        bar,
        {
          label: '동향',
          data: props.chartData.map(item => item.orderAmount),
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
    labels,
    datasets: [bar]
  }
})

const colorPalette = [
  '#3366FF', '#FFB800', '#FF5C5C', '#00C49A', '#888888', '#FF7F50', '#8A2BE2', '#FF69B4', '#00BFFF', '#FFD700', '#32CD32', '#FF6347'
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
