<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuth } from '../composables/useAuth.js'

const { verifyEmail } = useAuth()
const router = useRouter()
const route = useRoute()

const verifying = ref(true)
const success = ref(false)
const error = ref('')

onMounted(async () => {
  const token = route.query.token

  if (!token) {
    error.value = 'Token de verificação não encontrado'
    verifying.value = false
    return
  }

  const result = await verifyEmail(token)
  verifying.value = false

  if (result.success) {
    success.value = true
    setTimeout(() => {
      router.push('/dashboard')
    }, 3000)
  } else {
    error.value = result.error
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900">Email Verification</h1>
      </div>

      <div class="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Loading State -->
        <div v-if="verifying" class="text-center">
          <Icon icon="lucide:loader-2" class="w-16 h-16 mx-auto text-blue-600 animate-spin mb-4" />
          <p class="text-gray-600">Verificando seu email...</p>
        </div>

        <!-- Success State -->
        <div v-if="!verifying && success" class="text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <Icon icon="lucide:check-circle" class="w-10 h-10 text-green-600" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Email verificado com sucesso!</h3>
          <p class="text-gray-600 mb-4">
            Seu email foi confirmado. Você será redirecionado em alguns segundos...
          </p>
          <button
            @click="router.push('/dashboard')"
            class="text-blue-600 hover:text-blue-800 font-medium"
          >
            Ir para o dashboard agora
          </button>
        </div>

        <!-- Error State -->
        <div v-if="!verifying && error" class="text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <Icon icon="lucide:alert-circle" class="w-10 h-10 text-red-600" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Erro na verificação</h3>
          <p class="text-red-600 mb-4">{{ error }}</p>
          <div class="space-y-2">
            <button
              @click="router.push('/profile')"
              class="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Ir para o perfil
            </button>
            <button
              @click="router.push('/login')"
              class="block w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Voltar para o login
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
