<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuth } from '../composables/useAuth.js'

const { login, loading } = useAuth()
const router = useRouter()

const form = ref({
  email: '',
  password: ''
})

const error = ref('')
const showPassword = ref(false)
const attemptsInfo = ref(null)

async function handleSubmit() {
  error.value = ''
  attemptsInfo.value = null

  if (!form.value.email || !form.value.password) {
    error.value = 'Please fill in all fields'
    return
  }

  const result = await login(form.value.email, form.value.password)

  if (!result.success) {
    error.value = result.error
    attemptsInfo.value = result.attemptsInfo
    return
  }

  // Se requer 2FA, redirecionar para página de verificação
  if (result.requires2FA) {
    router.push({
      name: 'verify-2fa',
      query: { tempToken: result.tempToken }
    })
  }
  // Se não requer 2FA, o login já redirecionou para dashboard
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <!-- Logo -->
      <div class="flex justify-center">
        <img src="/Logo.svg" alt="Daflow" class="w-16 h-16" />
      </div>
      <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
        Sign in to Daflow
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Or
        <RouterLink
          to="/register"
          class="font-medium text-blue-600 hover:text-blue-500"
        >
          create a new account
        </RouterLink>
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10 border border-gray-200">
        <!-- Error message -->
        <div
          v-if="error"
          class="mb-4 px-4 py-3 rounded-lg flex items-start"
          :class="[
            attemptsInfo?.attemptsLeft > 0
              ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
              : 'bg-red-50 border border-red-200 text-red-700'
          ]"
        >
          <Icon
            :icon="attemptsInfo?.attemptsLeft > 0 ? 'lucide:alert-triangle' : 'lucide:alert-circle'"
            class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
          />
          <div class="flex-1">
            <p class="font-medium">{{ error }}</p>
            <p v-if="attemptsInfo?.attemptsLeft > 0" class="text-sm mt-1">
              ⚠️ {{ attemptsInfo.attemptsLeft }} {{ attemptsInfo.attemptsLeft === 1 ? 'tentativa' : 'tentativas' }} restante{{ attemptsInfo.attemptsLeft === 1 ? '' : 's' }}
            </p>
            <p v-else-if="attemptsInfo?.remainingMinutes" class="text-sm mt-1">
              🔒 Aguarde {{ attemptsInfo.remainingMinutes }} minuto{{ attemptsInfo.remainingMinutes === 1 ? '' : 's' }} para tentar novamente
            </p>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div class="mt-1 relative">
              <input
                id="email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Icon icon="lucide:mail" class="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          <!-- Password -->
          <div>
            <div class="flex items-center justify-between">
              <label for="password" class="block text-sm font-medium text-gray-700">
                Password
              </label>
              <RouterLink
                to="/forgot-password"
                class="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </RouterLink>
            </div>
            <div class="mt-1 relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                class="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Icon
                  :icon="showPassword ? 'lucide:eye-off' : 'lucide:eye'"
                  class="w-5 h-5 text-gray-400 hover:text-gray-600"
                />
              </button>
            </div>
          </div>

          <!-- Submit button -->
          <div>
            <button
              type="submit"
              :disabled="loading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="!loading" class="flex items-center">
                <Icon icon="lucide:log-in" class="w-4 h-4 mr-2" />
                Sign in
              </span>
              <span v-else class="flex items-center">
                <Icon icon="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </span>
            </button>
          </div>
        </form>

        <!-- Divider -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Demo credentials</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>