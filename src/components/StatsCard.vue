<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  title: String,
  value: [String, Number],
  change: Number,
  changeType: {
    type: String,
    default: 'percentage',
    validator: (value) => ['percentage', 'absolute'].includes(value)
  },
  subtitle: String,
  icon: String,
  color: {
    type: String,
    default: 'blue',
    validator: (value) => ['blue', 'green', 'red', 'yellow', 'purple', 'indigo'].includes(value)
  },
  actionText: String,
  actionHref: String
})

const emit = defineEmits(['action-click'])

const isPositive = computed(() => props.change > 0)
const isNegative = computed(() => props.change < 0)

const changeText = computed(() => {
  if (!props.change) return ''

  const prefix = isPositive.value ? '+' : ''
  const suffix = props.changeType === 'percentage' ? '%' : ''

  return `${prefix}${props.change}${suffix}`
})

const colorClasses = computed(() => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600'
  }
  return colors[props.color] || colors.blue
})

function handleActionClick() {
  if (props.actionHref) {
    window.open(props.actionHref, '_blank')
  } else {
    emit('action-click')
  }
}
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-gray-600">{{ title }}</p>
          <div v-if="icon" :class="['w-10 h-10 rounded-lg flex items-center justify-center', colorClasses]">
            <Icon :icon="icon" class="w-5 h-5" />
          </div>
        </div>

        <div class="mt-2">
          <div class="flex items-baseline">
            <p class="text-2xl font-semibold text-gray-900">{{ value }}</p>
            <p
              v-if="change !== undefined"
              :class="[
                'ml-2 flex items-baseline text-sm font-medium',
                isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
              ]"
            >
              <Icon
                v-if="isPositive"
                icon="lucide:trending-up"
                class="self-center flex-shrink-0 h-4 w-4 mr-1"
              />
              <Icon
                v-else-if="isNegative"
                icon="lucide:trending-down"
                class="self-center flex-shrink-0 h-4 w-4 mr-1"
              />
              {{ changeText }}
            </p>
          </div>

          <p v-if="subtitle" class="mt-1 text-sm text-gray-600">{{ subtitle }}</p>
        </div>
      </div>
    </div>

    <div v-if="actionText" class="mt-4 pt-4 border-t border-gray-100">
      <button
        @click="handleActionClick"
        class="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center"
      >
        {{ actionText }}
        <Icon icon="lucide:arrow-right" class="ml-1 w-4 h-4" />
      </button>
    </div>
  </div>
</template>