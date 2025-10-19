<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import AppLayout from '../components/AppLayout.vue'
import ImportFlowModal from '../components/ImportFlowModal.vue'
import { usePublicFlows } from '../composables/usePublicFlows.js'

const router = useRouter()
const { listPublicFlows, getLibraryStats, loading } = usePublicFlows()

const publicFlows = ref([])
const stats = ref({
  totalFlows: 0,
  totalDownloads: 0,
  verifiedFlows: 0
})

const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedDifficulty = ref('all')
const sortBy = ref('popular')
const showVerifiedOnly = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)

const showImportModal = ref(false)
const selectedFlow = ref(null)

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'automation', label: 'Automation' },
  { value: 'data-processing', label: 'Data Processing' },
  { value: 'api-integration', label: 'API Integration' },
  { value: 'notification', label: 'Notification' },
  { value: 'utility', label: 'Utility' }
]

const difficulties = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
]

onMounted(async () => {
  await loadFlows()
  await loadStats()
})

watch([searchQuery, selectedCategory, selectedDifficulty, sortBy, showVerifiedOnly], () => {
  currentPage.value = 1
  loadFlows()
})

async function loadFlows() {
  const filters = {
    search: searchQuery.value || undefined,
    category: selectedCategory.value !== 'all' ? selectedCategory.value : undefined,
    difficulty: selectedDifficulty.value !== 'all' ? selectedDifficulty.value : undefined,
    verifiedOnly: showVerifiedOnly.value,
    sortBy: sortBy.value,
    page: currentPage.value,
    limit: 12
  }

  const result = await listPublicFlows(filters)
  if (result.success) {
    publicFlows.value = result.flows || []
    if (result.pagination) {
      totalPages.value = result.pagination.pages
    }
  }
}

async function loadStats() {
  const result = await getLibraryStats()
  if (result.success) {
    stats.value = result.data
  }
}

function viewFlowDetails(flow) {
  router.push(`/library/${flow._id}`)
}

function importFlow(flow) {
  selectedFlow.value = flow
  showImportModal.value = true
}

function handleFlowImported() {
  showImportModal.value = false
  selectedFlow.value = null
}

function getCategoryColor(category) {
  const colors = {
    'automation': 'bg-blue-100 text-blue-800',
    'data-processing': 'bg-green-100 text-green-800',
    'api-integration': 'bg-purple-100 text-purple-800',
    'notification': 'bg-yellow-100 text-yellow-800',
    'utility': 'bg-gray-100 text-gray-800'
  }
  return colors[category] || colors.utility
}

function getDifficultyColor(difficulty) {
  const colors = {
    'beginner': 'bg-green-100 text-green-800',
    'intermediate': 'bg-yellow-100 text-yellow-800',
    'advanced': 'bg-red-100 text-red-800'
  }
  return colors[difficulty] || colors.beginner
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function generateAvatar(name) {
  const initials = name?.split(' ').map(n => n[0]).join('').substring(0, 2) || '??'
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500']
  const color = colors[name?.length % colors.length] || colors[0]
  return { initials, color }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadFlows()
  }
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    loadFlows()
  }
}
</script>

<template>
  <AppLayout>
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Public Library</h1>
          <p class="text-gray-600 mt-1">Discover and import flows shared by the community</p>
        </div>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-lg p-4 border border-gray-200">
        <div class="flex items-center">
          <Icon icon="lucide:users" class="w-8 h-8 text-blue-500 mr-3" />
          <div>
            <p class="text-sm text-gray-600">Community Flows</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.totalFlows }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-4 border border-gray-200">
        <div class="flex items-center">
          <Icon icon="lucide:download" class="w-8 h-8 text-green-500 mr-3" />
          <div>
            <p class="text-sm text-gray-600">Total Downloads</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.totalDownloads?.toLocaleString() || 0 }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg p-4 border border-gray-200">
        <div class="flex items-center">
          <Icon icon="lucide:shield-check" class="w-8 h-8 text-purple-500 mr-3" />
          <div>
            <p class="text-sm text-gray-600">Verified Flows</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.verifiedFlows }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <Icon icon="lucide:search" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search public flows..."
              class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div class="flex gap-2 flex-wrap">
          <select
            v-model="selectedCategory"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option v-for="cat in categories" :key="cat.value" :value="cat.value">
              {{ cat.label }}
            </option>
          </select>
          <select
            v-model="selectedDifficulty"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option v-for="diff in difficulties" :key="diff.value" :value="diff.value">
              {{ diff.label }}
            </option>
          </select>
          <select
            v-model="sortBy"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="popular">Most Popular</option>
            <option value="recent">Recently Added</option>
            <option value="rating">Highest Rated</option>
            <option value="name">Name A-Z</option>
          </select>
          <label class="flex items-center px-3 py-2 bg-gray-50 rounded-lg text-sm cursor-pointer">
            <input
              v-model="showVerifiedOnly"
              type="checkbox"
              class="mr-2 h-4 w-4 text-blue-600"
            />
            Verified Only
          </label>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Icon icon="lucide:loader-2" class="w-12 h-12 text-blue-600 animate-spin" />
    </div>

    <!-- Empty State -->
    <div v-else-if="publicFlows.length === 0" class="text-center py-12 bg-white rounded-lg border border-gray-200">
      <Icon icon="lucide:search-x" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">No flows found</h3>
      <p class="text-gray-600">Try adjusting your search terms or filters</p>
    </div>

    <!-- Flows Grid -->
    <div v-else>
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        <div
          v-for="flow in publicFlows"
          :key="flow._id"
          class="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
        >
          <!-- Flow Header -->
          <div class="p-6">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <div class="flex items-center mb-2">
                  <h3 class="text-lg font-semibold text-gray-900 mr-2">{{ flow.name }}</h3>
                  <Icon
                    v-if="flow.publicationData?.isVerified"
                    icon="lucide:shield-check"
                    class="w-5 h-5 text-blue-500"
                    title="Verified Flow"
                  />
                </div>
                <div class="flex gap-2 mb-2">
                  <span :class="['px-2 py-1 text-xs font-medium rounded-full', getCategoryColor(flow.category)]">
                    {{ categories.find(c => c.value === flow.category)?.label || flow.category }}
                  </span>
                  <span v-if="flow.publicMetadata?.difficulty" :class="['px-2 py-1 text-xs font-medium rounded-full', getDifficultyColor(flow.publicMetadata.difficulty)]">
                    {{ flow.publicMetadata.difficulty }}
                  </span>
                </div>
              </div>
            </div>

            <p class="text-sm text-gray-600 mb-4 line-clamp-3">
              {{ flow.description }}
            </p>

            <!-- Author -->
            <div class="flex items-center mb-4">
              <div
                :class="['w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium mr-3', generateAvatar(flow.publicMetadata?.author?.name).color]"
              >
                {{ generateAvatar(flow.publicMetadata?.author?.name).initials }}
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ flow.publicMetadata?.author?.name || 'Unknown' }}</p>
                <p class="text-xs text-gray-500">Updated {{ formatDate(flow.updatedAt) }}</p>
              </div>
            </div>

            <!-- Tags -->
            <div v-if="flow.publicMetadata?.tags && flow.publicMetadata.tags.length > 0" class="flex flex-wrap gap-1 mb-4">
              <span
                v-for="tag in flow.publicMetadata.tags.slice(0, 5)"
                :key="tag"
                class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {{ tag }}
              </span>
            </div>

            <!-- Stats -->
            <div class="flex items-center justify-between text-sm text-gray-500">
              <div class="flex items-center space-x-4">
                <span class="flex items-center">
                  <Icon icon="lucide:download" class="w-4 h-4 mr-1" />
                  {{ flow.publicStats?.imports?.toLocaleString() || 0 }}
                </span>
                <span class="flex items-center">
                  <Icon icon="lucide:star" class="w-4 h-4 mr-1 text-yellow-500" />
                  {{ flow.publicStats?.averageRating?.toFixed(1) || '0.0' }}
                </span>
                <span class="flex items-center">
                  <Icon icon="lucide:message-circle" class="w-4 h-4 mr-1" />
                  {{ flow.publicStats?.totalReviews || 0 }}
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div class="flex items-center justify-between">
              <button
                @click="viewFlowDetails(flow)"
                class="text-gray-600 hover:text-gray-800 flex items-center text-sm"
              >
                <Icon icon="lucide:eye" class="w-4 h-4 mr-1" />
                View Details
              </button>
              <button
                @click="importFlow(flow)"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm transition-colors flex items-center space-x-1"
              >
                <Icon icon="lucide:download" class="w-4 h-4" />
                <span>Import Flow</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-2">
        <button
          @click="previousPage"
          :disabled="currentPage === 1"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon icon="lucide:chevron-left" class="w-5 h-5" />
        </button>
        <span class="text-sm text-gray-600">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon icon="lucide:chevron-right" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Import Modal -->
    <ImportFlowModal
      :show="showImportModal"
      :flow="selectedFlow"
      @close="showImportModal = false"
      @imported="handleFlowImported"
    />
  </AppLayout>
</template>
