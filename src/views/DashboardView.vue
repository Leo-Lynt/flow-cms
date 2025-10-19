<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import AppLayout from '../components/AppLayout.vue'
import StatsCard from '../components/StatsCard.vue'
import BaseCard from '../components/BaseCard.vue'
import ExecutionStatusBadge from '../components/ExecutionStatusBadge.vue'
import { useFlows } from '../composables/useFlows.js'
import { useSchedules } from '../composables/useSchedules.js'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const route = useRoute()
const { user, getDashboardStats } = useAuth()
const {
  loading,
  getExecutions
} = useFlows()
const { getSchedules } = useSchedules()

const dashboardData = ref(null)
const recentExecutions = ref([])
const schedules = ref([])
const dataLoading = ref(true)

const statsCards = computed(() => {
  if (!dashboardData.value) return []

  return [
    {
      title: 'Total Flows',
      value: dashboardData.value.totalFlows || 0,
      change: 0,
      subtitle: 'Flows created in your workspace',
      icon: 'lucide:workflow',
      color: 'blue',
      actionText: 'Create new flow'
    },
    {
      title: 'Shared Flows',
      value: dashboardData.value.sharedFlows || 0,
      change: 0,
      subtitle: 'Published to library',
      icon: 'lucide:share-2',
      color: 'purple'
    },
    {
      title: 'Active Schedules',
      value: dashboardData.value.activeSchedules || 0,
      change: 0,
      subtitle: 'Automated flows',
      icon: 'lucide:calendar-clock',
      color: 'indigo'
    },
    {
      title: 'Total Executions',
      value: dashboardData.value.totalExecutions || 0,
      change: 0,
      subtitle: 'All time executions',
      icon: 'lucide:activity',
      color: 'green'
    }
  ]
})

onMounted(async () => {
  await loadData()
})

async function loadData() {
  try {
    dataLoading.value = true

    const [dashboardResult, executionsResult, schedulesResult] = await Promise.all([
      getDashboardStats(),
      getExecutions({ limit: 5, page: 1 }),
      getSchedules({ enabled: true })
    ])

    if (dashboardResult.success) {
      dashboardData.value = dashboardResult.data
    }

    if (executionsResult.success) {
      recentExecutions.value = executionsResult.data || []
    }

    if (schedulesResult.success) {
      schedules.value = schedulesResult.data || []
    }
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error)
  } finally {
    dataLoading.value = false
  }
}

function createFlow() {
  router.push('/flows/create')
}

function formatRelativeTime(date) {
  if (!date) return 'Never'

  const now = new Date()
  const then = new Date(date)
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 30) return `${diffDays} days ago`

  return then.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function formatAccountDate(date) {
  if (!date) return 'Unknown'

  const then = new Date(date)
  return then.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}




function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatDateShort(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusColor(status) {
  const colors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    error: 'bg-red-100 text-red-800'
  }
  return colors[status] || colors.inactive
}
</script>

<template>
  <AppLayout>
    <!-- Page header -->
    <div class="mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-600 mt-2">Welcome back, {{ user?.name || 'User' }}! Here's your Daflow overview.</p>
      </div>
    </div>

    <!-- Workspace Overview -->
    <div v-if="dataLoading" class="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <div class="flex justify-center items-center h-32">
        <Icon icon="lucide:loader-2" class="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    </div>

    <div v-else-if="dashboardData" class="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Workspace Overview</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <Icon icon="lucide:calendar" class="w-6 h-6 text-gray-600 mx-auto mb-2" />
          <p class="text-sm text-gray-600">Account Created</p>
          <p class="font-semibold text-gray-900">{{ formatAccountDate(dashboardData.accountCreated) }}</p>
        </div>
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <Icon icon="lucide:clock" class="w-6 h-6 text-gray-600 mx-auto mb-2" />
          <p class="text-sm text-gray-600">Last Login</p>
          <p class="font-semibold text-gray-900">{{ formatRelativeTime(dashboardData.lastLoginAt) }}</p>
        </div>
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <Icon icon="lucide:users" class="w-6 h-6 text-gray-600 mx-auto mb-2" />
          <p class="text-sm text-gray-600">Team Members</p>
          <p class="font-semibold text-gray-900">{{ dashboardData.teamMembers }} (You)</p>
        </div>
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <Icon icon="lucide:star" class="w-6 h-6 text-gray-600 mx-auto mb-2" />
          <p class="text-sm text-gray-600">Plan</p>
          <p class="font-semibold text-gray-900">{{ dashboardData.plan }}</p>
        </div>
      </div>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        v-for="card in statsCards"
        :key="card.title"
        v-bind="card"
        @action-click="card.actionText === 'Create new flow' ? createFlow() : null"
      />
    </div>

    <!-- Recent Executions & Schedules -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Recent Executions -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Recent Executions</h2>
          <button
            @click="router.push('/executions')"
            class="text-sm text-blue-600 hover:text-blue-700"
          >
            View all →
          </button>
        </div>
        <div v-if="recentExecutions.length > 0" class="space-y-3">
          <div
            v-for="execution in recentExecutions"
            :key="execution._id"
            @click="router.push(`/executions/${execution._id}`)"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <div class="flex items-center space-x-3 flex-1 min-w-0">
              <Icon icon="lucide:play-circle" class="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div class="min-w-0 flex-1">
                <div class="text-sm font-medium text-gray-900 truncate">
                  {{ execution.flowName || 'Unknown Flow' }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ formatDateShort(execution.startedAt) }}
                </div>
              </div>
            </div>
            <ExecutionStatusBadge :status="execution.status" />
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          <Icon icon="lucide:inbox" class="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p class="text-sm">No recent executions</p>
        </div>
      </div>

      <!-- Active Schedules -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Active Schedules</h2>
          <button
            @click="router.push('/schedules')"
            class="text-sm text-blue-600 hover:text-blue-700"
          >
            View all →
          </button>
        </div>
        <div v-if="schedules.length > 0" class="space-y-3">
          <div
            v-for="schedule in schedules.slice(0, 5)"
            :key="schedule._id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-3 flex-1 min-w-0">
              <Icon icon="lucide:clock" class="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div class="min-w-0 flex-1">
                <div class="text-sm font-medium text-gray-900 truncate">
                  {{ schedule.flowId?.name || 'Unknown Flow' }}
                </div>
                <div class="text-xs text-gray-500">
                  Next: {{ formatDateShort(schedule.nextExecutionAt) }}
                </div>
              </div>
            </div>
            <span class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
              {{ schedule.scheduleType }}
            </span>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          <Icon icon="lucide:calendar-off" class="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p class="text-sm">No active schedules</p>
          <button
            @click="router.push('/schedules')"
            class="mt-3 text-sm text-blue-600 hover:text-blue-700"
          >
            Create your first schedule
          </button>
        </div>
      </div>
    </div>

  </AppLayout>
</template>