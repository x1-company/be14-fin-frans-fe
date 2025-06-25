<template>
  <div>
    <Doughnut
      v-if="filteredData.length"
      :key="chartKey"
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
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js'

Chart.register(ArcElement, Tooltip, Legend, Title)

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
  },
  selectedFranchiseId: {
    type: [String, Number],
    default: null
  }
})

const filteredData = computed(() =>
  props.chartData.filter(item => item.month === props.month)
)

const colorPalette = [
  '#A8DADC', '#89CFF0', '#B0E0E6', '#CAE4DB', '#D3E4CD', '#F0E2E6', '#F7D6BF', '#E8D9F0', '#FFD6A5', '#B5EAD7', '#FFDAC1', '#E2F0CB'
]

const doughnutData = computed(() => {
  const labels = filteredData.value.map(item => item.productName || item.productId)
  const data = filteredData.value.map(item => item.orderQuantity)
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
          return `${context.label}: ${value}건`
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
  }
}

const chartKey = computed(() =>
  `${props.selectedFranchiseId}-${props.month}`
)
</script> 