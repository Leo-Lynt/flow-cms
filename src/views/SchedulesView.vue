<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import AppLayout from '../components/AppLayout.vue'
import ScheduleStatusBadge from '../components/ScheduleStatusBadge.vue'
import ScheduleWizard from '../components/ScheduleWizard.vue'
import { useSchedules } from '../composables/useSchedules.js'
import { useFlows } from '../composables/useFlows.js'

const router = useRouter()
const { schedules, loading, getSchedules, deleteSchedule, enableSchedule, disableSchedule } = useSchedules()
const { getFlows, getFlowInputs } = useFlows()

const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const scheduleToDelete = ref(null)
const availableFlows = ref([])
const selectedFlowFilter = ref('')
const flowInputs = ref([])
const loadingInputs = ref(false)

onMounted(async () => {
  await loadSchedules()
  await loadFlows()
})

async function loadSchedules() {
  const params = {}
  if (selectedFlowFilter.value) {
    params.flowId = selectedFlowFilter.value
  }
  await getSchedules(params)
}

async function loadFlows() {
  const result = await getFlows()
  if (result.success) {
    availableFlows.value = result.data.flows || []
  }
}

// Handle flow selection from wizard
async function handleFlowSelected(flowId) {
  loadingInputs.value = true
  const result = await getFlowInputs(flowId)
  loadingInputs.value = false

  if (result.success) {
    flowInputs.value = result.data.data?.inputs || []
  } else {
    flowInputs.value = []
  }
}

async function handleCreateSchedule(scheduleData) {
  const { createSchedule } = useSchedules()
  const result = await createSchedule(scheduleData)

  if (result.success) {
    showCreateModal.value = false
    await loadSchedules()
  }
}

async function handleToggleEnabled(schedule) {
  if (schedule.enabled) {
    await disableSchedule(schedule._id)
  } else {
    await enableSchedule(schedule._id)
  }
  await loadSchedules()
}

function confirmDelete(schedule) {
  scheduleToDelete.value = schedule
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!scheduleToDelete.value) return

  const result = await deleteSchedule(scheduleToDelete.value._id)
  if (result.success) {
    showDeleteModal.value = false
    scheduleToDelete.value = null
    await loadSchedules()
  }
}

function viewScheduleExecutions(schedule) {
  router.push(`/executions?scheduleId=${schedule._id}`)
}

function formatDate(date) {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getScheduleDescription(schedule) {
  switch (schedule.scheduleType) {
    case 'interval':
      return `Every ${schedule.intervalValue} ${schedule.intervalUnit}`

    case 'daily':
      return `Daily at ${schedule.time} (${schedule.timezone})`

    case 'weekly':
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const dayLabels = schedule.daysOfWeek.map(d => days[d]).join(', ')
      return `${dayLabels} at ${schedule.time} (${schedule.timezone})`

    case 'monthly':
      return `Monthly on day ${schedule.dayOfMonth} at ${schedule.time} (${schedule.timezone})`

    case 'cron':
      return `Cron: ${schedule.cronExpression} (${schedule.timezone})`

    default:
      return 'Unknown schedule type'
  }
}

function getTimeUntilNext(nextExecutionAt) {
  if (!nextExecutionAt) return null

  const now = new Date()
  const next = new Date(nextExecutionAt)
  const diff = next - now

  if (diff < 0) return 'Overdue'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `in ${days} day${days > 1 ? 's' : ''}`
  } else if (hours > 0) {
    return `in ${hours}h ${minutes}m`
  } else {
    return `in ${minutes}m`
  }
}

const filteredSchedules = computed(() => {
  if (!selectedFlowFilter.value) return schedules.value
  return schedules.value.filter(s => s.flowId._id === selectedFlowFilter.value)
})

const hasSchedules = computed(() => schedules.value.length > 0)
</script>

<template>
  <AppLayout>
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Schedules</h1>
          <p class="text-gray-600 mt-1">Automate your flows with scheduled executions</p>
        </div>
        <button
          @click="showCreateModal = true"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Icon icon="lucide:plus" class="w-4 h-4" />
          <span>Create Schedule</span>
        </button>
      </div>
    </div>

    <!-- Filter -->
    <div class="mb-6">
      <div class="max-w-md">
        <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Flow</label>
        <select
          v-model="selectedFlowFilter"
          @change="loadSchedules"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Flows</option>
          <option v-for="flow in availableFlows" :key="flow._id" :value="flow._id">
            {{ flow.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Schedules List -->
    <div v-if="loading" class="flex justify-center py-12">
      <Icon icon="lucide:loader-2" class="w-8 h-8 animate-spin text-gray-400" />
    </div>

    <div v-else-if="!hasSchedules" class="text-center py-12 bg-white rounded-lg border border-gray-200">
      <Icon icon="lucide:clock" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">No schedules yet</h3>
      <p class="text-gray-600 mb-6">Create your first schedule to automate flow execution</p>
      <button
        @click="showCreateModal = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
      >
        <Icon icon="lucide:plus" class="w-4 h-4" />
        <span>Create First Schedule</span>
      </button>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="schedule in filteredSchedules"
        :key="schedule._id"
        class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <!-- Schedule Info -->
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ schedule.flowId?.name || 'Unknown Flow' }}
              </h3>
              <ScheduleStatusBadge
                :enabled="schedule.enabled"
                :is-currently-running="schedule.isCurrentlyRunning"
                :paused-reason="schedule.pausedReason"
              />
            </div>

            <p class="text-sm text-gray-600 mb-3">{{ getScheduleDescription(schedule) }}</p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <!-- Next Execution -->
              <div class="flex items-center text-sm">
                <Icon icon="lucide:calendar-clock" class="w-4 h-4 text-gray-400 mr-2" />
                <div>
                  <div class="text-gray-500">Next execution:</div>
                  <div class="font-medium text-gray-900">
                    {{ schedule.nextExecutionAt ? formatDate(schedule.nextExecutionAt) : 'N/A' }}
                  </div>
                  <div v-if="schedule.enabled && schedule.nextExecutionAt" class="text-xs text-blue-600">
                    {{ getTimeUntilNext(schedule.nextExecutionAt) }}
                  </div>
                </div>
              </div>

              <!-- Execution Stats -->
              <div class="flex items-center text-sm">
                <Icon icon="lucide:activity" class="w-4 h-4 text-gray-400 mr-2" />
                <div>
                  <div class="text-gray-500">Total executions:</div>
                  <div class="font-medium text-gray-900">{{ schedule.executionCount || 0 }}</div>
                  <div
                    v-if="schedule.lastExecutionStatus"
                    :class="[
                      'text-xs',
                      schedule.lastExecutionStatus === 'success' ? 'text-green-600' : 'text-red-600'
                    ]"
                  >
                    Last: {{ schedule.lastExecutionStatus }}
                  </div>
                </div>
              </div>

              <!-- Failures -->
              <div v-if="schedule.consecutiveFailures > 0" class="flex items-center text-sm">
                <Icon icon="lucide:alert-triangle" class="w-4 h-4 text-red-500 mr-2" />
                <div>
                  <div class="text-gray-500">Consecutive failures:</div>
                  <div class="font-medium text-red-600">{{ schedule.consecutiveFailures }}</div>
                </div>
              </div>
            </div>

            <!-- Paused Reason -->
            <div v-if="schedule.pausedReason" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
              <div class="flex items-start">
                <Icon icon="lucide:alert-circle" class="w-4 h-4 text-yellow-600 mr-2 mt-0.5" />
                <div class="text-sm text-yellow-800">
                  <strong>Paused:</strong> {{ schedule.pausedReason }}
                </div>
              </div>
            </div>

            <!-- Metadata -->
            <div class="flex items-center space-x-4 text-xs text-gray-500">
              <span>Created {{ formatDate(schedule.createdAt) }}</span>
              <span v-if="schedule.maxExecutions">
                Max executions: {{ schedule.maxExecutions }}
              </span>
              <span v-if="schedule.expiresAt">
                Expires: {{ formatDate(schedule.expiresAt) }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-2 ml-4">
            <button
              @click="handleToggleEnabled(schedule)"
              :title="schedule.enabled ? 'Disable' : 'Enable'"
              :class="[
                'p-2 rounded-lg transition-colors',
                schedule.enabled
                  ? 'text-orange-600 hover:bg-orange-50'
                  : 'text-green-600 hover:bg-green-50'
              ]"
            >
              <Icon
                :icon="schedule.enabled ? 'lucide:pause-circle' : 'lucide:play-circle'"
                class="w-5 h-5"
              />
            </button>
            <button
              @click="viewScheduleExecutions(schedule)"
              title="View Executions"
              class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Icon icon="lucide:history" class="w-5 h-5" />
            </button>
            <button
              @click="confirmDelete(schedule)"
              title="Delete"
              class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Icon icon="lucide:trash-2" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Schedule Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4"
      @click="showCreateModal = false"
    >
      <div
        class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900">Create Schedule</h2>
          <button
            @click="showCreateModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <Icon icon="lucide:x" class="w-6 h-6" />
          </button>
        </div>

        <div class="p-6">
          <ScheduleWizard
            :available-flows="availableFlows"
            :flow-inputs="flowInputs"
            @flow-selected="handleFlowSelected"
            @submit="handleCreateSchedule"
            @cancel="showCreateModal = false"
          />
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50"
      @click="showDeleteModal = false"
    >
      <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4" @click.stop>
        <div class="flex items-center mb-4">
          <Icon icon="lucide:alert-triangle" class="w-6 h-6 text-red-600 mr-3" />
          <h3 class="text-lg font-semibold text-gray-900">Delete Schedule</h3>
        </div>
        <p class="text-gray-600 mb-6">
          Are you sure you want to delete this schedule? This action cannot be undone.
        </p>
        <div class="flex space-x-3">
          <button
            @click="showDeleteModal = false"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="handleDelete"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
