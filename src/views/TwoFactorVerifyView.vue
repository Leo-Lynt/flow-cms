<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuth } from '../composables/useAuth.js'

const { verify2FALogin, loading } = useAuth()
const router = useRouter()
const route = useRoute()

const code = ref('')
const error = ref('')
const tempToken = ref('')
const attemptsInfo = ref(null)

onMounted(() => {
  // Obter tempToken da rota
  tempToken.value = route.query.tempToken

  if (!tempToken.value) {
    error.value = 'Sessão inválida. Por favor, faça login novamente.'
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  }
})

async function handleSubmit() {
  error.value = ''
  attemptsInfo.value = null

  if (!code.value || code.value.length !== 6) {
    error.value = 'Please enter a valid 6-digit code'
    return
  }

  const result = await verify2FALogin(tempToken.value, code.value)

  if (!result.success) {
    error.value = result.error
    attemptsInfo.value = result.attemptsInfo
    code.value = '' // Limpar código para tentar novamente
  }
  // Se success for true, o verify2FALogin já faz o redirecionamento
}

function handleCodeInput(event) {
  // Permitir apenas números
  const value = event.target.value.replace(/[^0-9]/g, '')
  code.value = value.slice(0, 6)
}

function goBack() {
  router.push('/login')
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
        Two-Factor Authentication
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Enter the 6-digit code from your authenticator app
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10 border border-gray-200">
        <!-- Error message -->
        <div
          v-if="error"
          class="mb-6 px-4 py-3 rounded-lg flex items-start"
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
          <!-- Code input -->
          <div>
            <label for="code" class="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              id="code"
              v-model="code"
              @input="handleCodeInput"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              autocomplete="one-time-code"
              maxlength="6"
              required
              class="appearance-none block w-full px-3 py-2 text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="000000"
            />
            <p class="mt-2 text-xs text-gray-500 text-center">
              Open your authenticator app to view your code
            </p>
          </div>

          <!-- Submit button -->
          <div>
            <button
              type="submit"
              :disabled="loading || code.length !== 6"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="!loading" class="flex items-center">
                <Icon icon="lucide:shield-check" class="w-4 h-4 mr-2" />
                Verify Code
              </span>
              <span v-else class="flex items-center">
                <Icon icon="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </span>
            </button>
          </div>

          <!-- Back to login -->
          <div class="text-center">
            <button
              type="button"
              @click="goBack"
              class="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center w-full"
            >
              <Icon icon="lucide:arrow-left" class="w-4 h-4 mr-1" />
              Back to login
            </button>
          </div>
        </form>

        <!-- Help text -->
        <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-start">
            <Icon icon="lucide:info" class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
            <div class="text-sm text-blue-800">
              <p class="font-medium mb-1">Need help?</p>
              <p class="text-blue-700">
                If you've lost access to your authenticator app, please contact support to recover your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
