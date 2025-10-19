<script setup>
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  flowName: {
    type: String,
    required: true
  },
  inputs: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'execute'])

const formData = ref({})

// Inicializar form data com valores default
watch(() => props.inputs, (newInputs) => {
  if (newInputs && newInputs.length > 0) {
    const initialData = {}
    newInputs.forEach(input => {
      initialData[input.name] = input.defaultValue !== undefined ? input.defaultValue : ''
    })
    formData.value = initialData
  }
}, { immediate: true })

function handleClose() {
  if (!props.loading) {
    emit('close')
  }
}

function handleExecute() {
  // Validar campos required
  const missingFields = props.inputs
    .filter(input => input.required && !formData.value[input.name])
    .map(input => input.name)

  if (missingFields.length > 0) {
    alert(`Please fill in required fields: ${missingFields.join(', ')}`)
    return
  }

  emit('execute', formData.value)
}

function getInputType(type) {
  const typeMap = {
    string: 'text',
    number: 'number',
    boolean: 'checkbox',
    email: 'email',
    url: 'url'
  }
  return typeMap[type] || 'text'
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4"
    @click="handleClose"
  >
    <div
      class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <Icon icon="lucide:play-circle" class="w-6 h-6 text-blue-600" />
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Execute Flow</h3>
            <p class="text-sm text-gray-600">{{ flowName }}</p>
          </div>
        </div>
        <button
          @click="handleClose"
          :disabled="loading"
          class="text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          <Icon icon="lucide:x" class="w-5 h-5" />
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto p-6">
        <div v-if="inputs.length === 0" class="text-center py-8">
          <Icon icon="lucide:info" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p class="text-gray-600">This flow doesn't require any inputs</p>
        </div>

        <div v-else class="space-y-4">
          <div v-for="input in inputs" :key="input.name" class="space-y-2">
            <label class="block">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium text-gray-700">
                  {{ input.name }}
                  <span v-if="input.required" class="text-red-500">*</span>
                </span>
                <span class="text-xs text-gray-500">{{ input.type }}</span>
              </div>

              <input
                v-if="input.type !== 'boolean'"
                v-model="formData[input.name]"
                :type="getInputType(input.type)"
                :required="input.required"
                :placeholder="input.defaultValue !== undefined ? String(input.defaultValue) : ''"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <div v-else class="flex items-center">
                <input
                  v-model="formData[input.name]"
                  type="checkbox"
                  :id="`input-${input.name}`"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label :for="`input-${input.name}`" class="ml-2 text-sm text-gray-700">
                  {{ input.description || 'Enable' }}
                </label>
              </div>

              <p v-if="input.description && input.type !== 'boolean'" class="text-xs text-gray-500 mt-1">
                {{ input.description }}
              </p>

              <p v-if="input.nodeName" class="text-xs text-gray-400 mt-1">
                <Icon icon="lucide:box" class="w-3 h-3 inline mr-1" />
                From: {{ input.nodeName }}
              </p>
            </label>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
        <button
          @click="handleClose"
          :disabled="loading"
          class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          @click="handleExecute"
          :disabled="loading"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          <Icon
            :icon="loading ? 'lucide:loader-2' : 'lucide:play'"
            :class="['w-4 h-4', { 'animate-spin': loading }]"
          />
          <span>{{ loading ? 'Executing...' : 'Execute Flow' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
