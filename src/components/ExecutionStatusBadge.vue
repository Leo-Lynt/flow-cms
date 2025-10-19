<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => ['success', 'failed', 'running'].includes(value)
  }
})

const statusConfig = computed(() => {
  const configs = {
    success: {
      class: 'bg-green-100 text-green-800 border-green-200',
      icon: 'lucide:check-circle',
      label: 'Success'
    },
    failed: {
      class: 'bg-red-100 text-red-800 border-red-200',
      icon: 'lucide:x-circle',
      label: 'Failed'
    },
    running: {
      class: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: 'lucide:loader-2',
      label: 'Running'
    }
  }
  return configs[props.status] || configs.failed
})
</script>

<template>
  <span
    :class="statusConfig.class"
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
  >
    <Icon
      :icon="statusConfig.icon"
      :class="['w-3 h-3 mr-1', { 'animate-spin': status === 'running' }]"
    />
    {{ statusConfig.label }}
  </span>
</template>
