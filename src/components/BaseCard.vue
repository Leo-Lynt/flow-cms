<script setup>
defineProps({
  title: String,
  subtitle: String,
  padding: {
    type: String,
    default: 'p-6'
  },
  shadow: {
    type: String,
    default: 'shadow-sm'
  }
})
</script>

<template>
  <div :class="['bg-white rounded-lg border border-gray-200', shadow, padding]">
    <div v-if="title || subtitle" class="mb-4">
      <h3 v-if="title" class="text-lg font-semibold text-gray-900">{{ title }}</h3>
      <p v-if="subtitle" class="text-sm text-gray-600 mt-1">{{ subtitle }}</p>
    </div>
    <slot />
  </div>
</template>