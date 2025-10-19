<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuth } from '../composables/useAuth.js'

const { register, loading } = useAuth()

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const error = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

async function handleSubmit() {
  error.value = ''

  // Validation
  if (!form.value.name || !form.value.email || !form.value.password || !form.value.confirmPassword) {
    error.value = 'Please fill in all fields'
    return
  }

  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }

  if (form.value.password.length < 6) {
    error.value = 'Password must be at least 6 characters long'
    return
  }

  const result = await register(form.value.name, form.value.email, form.value.password)

  if (!result.success) {
    error.value = result.error
  }
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

function toggleConfirmPasswordVisibility() {
  showConfirmPassword.value = !showConfirmPassword.value
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
        Create your account
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Or
        <RouterLink
          to="/login"
          class="font-medium text-blue-600 hover:text-blue-500"
        >
          sign in to existing account
        </RouterLink>
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10 border border-gray-200">
        <!-- Error message -->
        <div
          v-if="error"
          class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
        >
          {{ error }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              Full name
            </label>
            <div class="mt-1 relative">
              <input
                id="name"
                v-model="form.name"
                type="text"
                autocomplete="name"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Icon icon="lucide:user" class="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

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
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div class="mt-1 relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                required
                class="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Create a password"
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
            <p class="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              Confirm password
            </label>
            <div class="mt-1 relative">
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                autocomplete="new-password"
                required
                class="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                @click="toggleConfirmPasswordVisibility"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Icon
                  :icon="showConfirmPassword ? 'lucide:eye-off' : 'lucide:eye'"
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
                <Icon icon="lucide:user-plus" class="w-4 h-4 mr-2" />
                Create account
              </span>
              <span v-else class="flex items-center">
                <Icon icon="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
                Creating account...
              </span>
            </button>
          </div>
        </form>

        <!-- Terms -->
        <div class="mt-6">
          <p class="text-center text-xs text-gray-500">
            By creating an account, you agree to our
            <a href="#" class="text-blue-600 hover:text-blue-500">Terms of Service</a>
            and
            <a href="#" class="text-blue-600 hover:text-blue-500">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>