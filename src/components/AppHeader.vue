<script setup>
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useAuth } from '../composables/useAuth.js'
import { useRouter } from 'vue-router'

const emit = defineEmits(['toggle-sidebar'])

const { user, logout } = useAuth()
const router = useRouter()

const profileDropdownOpen = ref(false)

const userInitials = computed(() => {
  if (!user.value?.name) return 'U'
  const names = user.value.name.split(' ')
  return names.length > 1
    ? `${names[0][0]}${names[names.length - 1][0]}`
    : names[0][0]
})

function toggleProfileDropdown() {
  profileDropdownOpen.value = !profileDropdownOpen.value
}

function goToProfile() {
  router.push('/profile')
  profileDropdownOpen.value = false
}

async function handleLogout() {
  await logout()
  profileDropdownOpen.value = false
}

</script>

<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
      <!-- Left section -->
      <div class="flex items-center space-x-4">
        <!-- Mobile menu button -->
        <button
          @click="emit('toggle-sidebar')"
          class="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <Icon icon="lucide:menu" class="w-6 h-6" />
        </button>

        <!-- Logo -->
        <div class="flex items-center space-x-3">
          <img src="/favicon.svg" alt="Lynt flow" class="w-8 h-8" />
          <span class="hidden sm:block text-xl font-thin text-black">Lynt Flow</span>
        </div>
      </div>


      <!-- Right section -->
      <div class="flex items-center space-x-4">
        <!-- Notifications -->
        <button class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
          <Icon icon="lucide:bell" class="w-5 h-5" />
        </button>

        <!-- Profile dropdown -->
        <div class="relative">
          <button
            @click="toggleProfileDropdown"
            class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span class="text-sm font-medium text-white">{{ userInitials }}</span>
            </div>
            <div class="hidden md:block text-left">
              <p class="text-sm font-medium text-gray-900">{{ user?.name || 'User' }}</p>
            </div>
            <Icon icon="lucide:chevron-down" class="w-4 h-4 text-gray-600" />
          </button>

          <!-- Dropdown menu -->
          <div
            v-show="profileDropdownOpen"
            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
          >
            <div class="px-4 py-2 border-b border-gray-100">
              <p class="text-sm font-medium text-gray-900">{{ user?.name }}</p>
              <p class="text-sm text-gray-500">{{ user?.email }}</p>
            </div>
            <button
              @click="goToProfile"
              class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Icon icon="lucide:user" class="w-4 h-4 mr-3" />
              Profile
            </button>
            <button
              @click="handleLogout"
              class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Icon icon="lucide:log-out" class="w-4 h-4 mr-3" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>