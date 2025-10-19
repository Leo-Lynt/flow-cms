<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import AppLayout from '../components/AppLayout.vue'
import ExecutionStatusBadge from '../components/ExecutionStatusBadge.vue'
import { useFlows } from '../composables/useFlows.js'

const router = useRouter()
const { getExecutions, loading } = useFlows()

const executions = ref([])
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  pages: 0
})

const filters = ref({
  flowId: '',
  status: '',
  startDate: '',
  endDate: ''
})

const availableFlows = ref([])

onMounted(async () => {
  await loadExecutions()
  await loadFlows()
})

async function loadExecutions() {
  const params = {
    page: pagination.value.page,
    limit: pagination.value.limit,
    ...filters.value
  }

  // Remove empty filters
  Object.keys(params).forEach(key => {
    if (params[key] === '' || params[key] === null) {
      delete params[key]
    }
  })

  const result = await getExecutions(params)
  if (result.success) {
    executions.value = result.data || []
    if (result.pagination) {
      pagination.value = result.pagination
    }
  }
}

async function loadFlows() {
  // Simple flow list fetch - you might want to use getFlows() from useFlows
  try {
    const { getFlows } = useFlows()
    const result = await getFlows()
    if (result.success) {
      availableFlows.value = result.data.flows || []
    }
  } catch (error) {
    console.error('Error loading flows:', error)
  }
}

function applyFilters() {
  pagination.value.page = 1
  loadExecutions()
}

function clearFilters() {
  filters.value = {
    flowId: '',
    status: '',
    startDate: '',
    endDate: ''
  }
  pagination.value.page = 1
  loadExecutions()
}

function changePage(newPage) {
  pagination.value.page = newPage
  loadExecutions()
}

function viewExecution(execution) {
  router.push(`/executions/${execution._id}`)
}

function viewFlow(flowId) {
  router.push(`/flows/${flowId}`)
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

function formatDuration(ms) {
  if (!ms) return '-'
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

function getTriggeredByLabel(triggeredBy) {
  const labels = {
    manual: 'Manual',
    api: 'API',
    schedule: 'Schedule'
  }
  return labels[triggeredBy] || triggeredBy
}

function getTriggeredByColor(triggeredBy) {
  const colors = {
    manual: 'bg-purple-100 text-purple-800 border-purple-200',
    api: 'bg-blue-100 text-blue-800 border-blue-200',
    schedule: 'bg-orange-100 text-orange-800 border-orange-200'
  }
  return colors[triggeredBy] || 'bg-gray-100 text-gray-800 border-gray-200'
}

const hasActiveFilters = computed(() => {
  return filters.value.flowId || filters.value.status || filters.value.startDate || filters.value.endDate
})
</script>

<template>
  <AppLayout>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Execution History</h1>
      <p class="text-gray-600 mt-1">View and analyze your flow execution history</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Flow Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Flow</label>
          <select
            v-model="filters.flowId"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Flows</option>
            <option v-for="flow in availableFlows" :key="flow._id" :value="flow._id">
              {{ flow.name }}
            </option>
          </select>
        </div>

        <!-- Status Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            v-model="filters.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="running">Running</option>
          </select>
        </div>

        <!-- Start Date Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input
            v-model="filters.startDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- End Date Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <input
            v-model="filters.endDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Filter Actions -->
      <div class="flex items-center space-x-3 mt-4">
        <button
          @click="applyFilters"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Icon icon="lucide:filter" class="w-4 h-4" />
          <span>Apply Filters</span>
        </button>
        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
        >
          <Icon icon="lucide:x" class="w-4 h-4" />
          <span>Clear</span>
        </button>
      </div>
    </div>

    <!-- Executions Table -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div v-if="loading" class="flex justify-center py-12">
        <Icon icon="lucide:loader-2" class="w-8 h-8 animate-spin text-gray-400" />
      </div>

      <div v-else-if="executions.length === 0" class="text-center py-12">
        <Icon icon="lucide:inbox" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No executions found</h3>
        <p class="text-gray-600">
          {{ hasActiveFilters ? 'Try adjusting your filters' : 'Execute a flow to see results here' }}
        </p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flow</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Triggered By</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started At</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nodes</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="execution in executions"
              :key="execution._id"
              class="hover:bg-gray-50 cursor-pointer"
              @click="viewExecution(execution)"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <Icon icon="lucide:workflow" class="w-4 h-4 text-gray-400 mr-2" />
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      {{ execution.flowName || 'Unnamed Flow' }}
                    </div>
                    <div v-if="execution.flowDeleted" class="text-xs text-red-600">
                      Flow deleted
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <ExecutionStatusBadge :status="execution.status" />
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getTriggeredByColor(execution.triggeredBy)"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                >
                  {{ getTriggeredByLabel(execution.triggeredBy) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ formatDate(execution.startedAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ formatDuration(execution.executionTime) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ execution.nodesExecuted || 0 }} / {{ execution.flowSnapshot?.totalNodes || 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click.stop="viewExecution(execution)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  View Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="px-6 py-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600">
            Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to
            {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }} results
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="pagination.page === 1"
              class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span class="text-sm text-gray-600">
              Page {{ pagination.page }} of {{ pagination.pages }}
            </span>
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="pagination.page === pagination.pages"
              class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
