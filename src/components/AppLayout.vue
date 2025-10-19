<script setup>
import { ref } from 'vue'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'

const sidebarOpen = ref(false)

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header - Fixed at top -->
    <AppHeader @toggle-sidebar="toggleSidebar" class="fixed top-0 left-0 right-0 z-40" />

    <!-- Main container -->
    <div class="flex flex-1 pt-16">
      <!-- Page content -->
      <main class="flex-1 px-4 sm:px-6 lg:px-8 py-8 lg:pl-80 lg:pr-8">
        <slot />
      </main>

      <!-- Sidebar - Fixed on the right -->
      <AppSidebar
        :open="sidebarOpen"
        @close="sidebarOpen = false"
      />
    </div>
  </div>
</template>