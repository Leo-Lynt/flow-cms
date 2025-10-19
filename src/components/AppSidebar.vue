<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { jwtDecode } from 'jwt-decode'

const props = defineProps({
  open: Boolean
})

const emit = defineEmits(['close'])

const route = useRoute()
const router = useRouter()
const userRole = ref('user')

onMounted(() => {
  // Decodificar token para obter role do usuário
  const token = localStorage.getItem('accessToken')
  console.log('[AppSidebar] Token:', token ? 'exists' : 'not found')

  if (token) {
    try {
      const decoded = jwtDecode(token)
      console.log('[AppSidebar] Decoded token:', decoded)
      console.log('[AppSidebar] User role:', decoded.role)

      userRole.value = decoded.role || 'user'
      console.log('[AppSidebar] userRole set to:', userRole.value)
    } catch (error) {
      console.error('[AppSidebar] Error decoding token:', error)
    }
  } else {
    console.log('[AppSidebar] No token found in localStorage')
  }
})

const menuItems = [
  {
    name: 'Dashboard',
    icon: 'lucide:layout-dashboard',
    route: '/dashboard',
    section: 'main'
  },
  {
    name: 'Flows',
    icon: 'lucide:workflow',
    route: '/flows',
    section: 'main'
  },
  {
    name: 'Executions',
    icon: 'lucide:play-circle',
    route: '/executions',
    section: 'main'
  },
  {
    name: 'Schedules',
    icon: 'lucide:calendar-clock',
    route: '/schedules',
    section: 'main'
  },
  {
    name: 'Public Library',
    icon: 'lucide:globe',
    route: '/library',
    section: 'main'
  },
  {
    name: 'Profile',
    icon: 'lucide:user-circle',
    route: '/profile',
    section: 'others'
  },
  {
    name: 'Documentation',
    icon: 'lucide:book-open',
    route: '/docs',
    section: 'others'
  }
]

const adminItems = [
  {
    name: 'Users',
    icon: 'lucide:users',
    route: '/admin/users',
    requiredRole: 'administrator'
  },
  {
    name: 'Moderation',
    icon: 'lucide:shield',
    route: '/admin/moderation',
    requiredRole: 'moderator'
  }
]

const mainItems = computed(() => menuItems.filter(item => item.section === 'main'))
const otherItems = computed(() => menuItems.filter(item => item.section === 'others'))

const visibleAdminItems = computed(() => {
  console.log('[AppSidebar] Computing visibleAdminItems, userRole:', userRole.value)

  if (userRole.value === 'administrator') {
    console.log('[AppSidebar] User is administrator, showing all admin items')
    return adminItems // Admin vê tudo
  } else if (userRole.value === 'moderator') {
    console.log('[AppSidebar] User is moderator, showing moderation only')
    return adminItems.filter(item => item.requiredRole === 'moderator') // Moderador vê só moderação
  }
  console.log('[AppSidebar] User is regular user, no admin items')
  return []
})

const showAdminSection = computed(() => {
  const show = userRole.value === 'administrator' || userRole.value === 'moderator'
  console.log('[AppSidebar] showAdminSection:', show, 'userRole:', userRole.value)
  return show
})

function isActive(itemRoute) {
  return route.path === itemRoute || route.path.startsWith(itemRoute + '/')
}

function navigateTo(routePath) {
  router.push(routePath)
  emit('close')
}
</script>

<template>
  <!-- Mobile sidebar overlay -->
  <div
    v-show="open"
    class="fixed inset-0 bg-gray-900/50 lg:hidden z-40"
    @click="emit('close')"
  ></div>

  <!-- Sidebar -->
  <div
    :class="[
      'fixed top-20 bottom-4 left-4 w-64 bg-white border border-gray-200 rounded-lg shadow-sm z-30 transition-transform duration-300 ease-in-out',
      'lg:translate-x-0',
      open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]"
  >
    <!-- Close button for mobile -->
    <div class="flex justify-end p-4 lg:hidden">
      <button
        @click="emit('close')"
        class="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      >
        <Icon icon="lucide:x" class="w-6 h-6" />
      </button>
    </div>

    <!-- Sidebar content -->
    <div class="flex flex-col h-full">
      <!-- Navigation -->
      <nav class="flex-1 px-4 pb-4">
        <!-- Main section -->
        <div class="space-y-1">
          <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2 mb-2">
            MENU
          </div>
          <div v-for="item in mainItems" :key="item.name">
            <button
              @click="navigateTo(item.route)"
              :class="[
                'group flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive(item.route)
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              ]"
            >
              <Icon
                :icon="item.icon"
                :class="[
                  'w-5 h-5 mr-3 flex-shrink-0',
                  isActive(item.route) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                ]"
              />
              {{ item.name }}
            </button>
          </div>
        </div>

        <!-- Admin section -->
        <div v-if="showAdminSection" class="mt-8 space-y-1">
          <div class="text-xs font-semibold text-purple-600 uppercase tracking-wider px-3 py-2 mb-2">
            ADMIN
          </div>
          <div v-for="item in visibleAdminItems" :key="item.name">
            <button
              @click="navigateTo(item.route)"
              :class="[
                'group flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive(item.route)
                  ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              ]"
            >
              <Icon
                :icon="item.icon"
                :class="[
                  'w-5 h-5 mr-3 flex-shrink-0',
                  isActive(item.route) ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-500'
                ]"
              />
              {{ item.name }}
            </button>
          </div>
        </div>

        <!-- Others section -->
        <div class="mt-8 space-y-1">
          <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2 mb-2">
            OTHERS
          </div>
          <div v-for="item in otherItems" :key="item.name">
            <button
              @click="navigateTo(item.route)"
              :class="[
                'group flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive(item.route)
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              ]"
            >
              <Icon
                :icon="item.icon"
                :class="[
                  'w-5 h-5 mr-3 flex-shrink-0',
                  isActive(item.route) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                ]"
              />
              {{ item.name }}
            </button>
          </div>
        </div>
      </nav>
    </div>
  </div>
</template>