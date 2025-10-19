import { ref, computed } from 'vue'
import api from '../utils/api.js'

export function useFlows() {
  const flows = ref([])
  const currentFlow = ref(null)
  const executions = ref([])
  const loading = ref(false)

  // Flows CRUD operations
  async function getFlows() {
    try {
      loading.value = true
      const response = await api.get('/flows')

      // Extract flows from the new API response structure
      flows.value = response.data.data.flows

      return { success: true, data: response.data.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar fluxos'
      }
    } finally {
      loading.value = false
    }
  }

  async function getFlow(id) {
    try {
      loading.value = true
      console.log(`Fetching flow with ID: ${id}`)
      const response = await api.get(`/flows/${id}`)
      console.log('Flow API response:', response.data)

      // Extract flow from API response structure
      const flowData = response.data.data || response.data
      currentFlow.value = flowData

      return { success: true, data: flowData }
    } catch (error) {
      console.error('Error fetching flow:', error)
      console.error('Error response:', error.response)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Erro ao buscar fluxo'
      }
    } finally {
      loading.value = false
    }
  }

  async function createFlow(flowData) {
    try {
      loading.value = true

      // Prepare payload with only required fields
      const payload = {
        name: flowData.name,
        description: flowData.description || '',
        category: flowData.category || '',
        isPublic: flowData.isPublic || false
      }

      const response = await api.post('/flows', payload)

      // Add to local flows array - extract from API response structure
      const newFlow = response.data.data || response.data
      flows.value.unshift(newFlow)

      return { success: true, data: newFlow }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar fluxo'
      }
    } finally {
      loading.value = false
    }
  }

  async function updateFlow(id, flowData) {
    try {
      loading.value = true

      // Prepare payload according to API specification
      const payload = {
        name: flowData.name,
        description: flowData.description || '',
        isPublic: flowData.isPublic || false,
        tags: flowData.tags || [],
        category: flowData.category || ''
      }

      // Include flowData if present (for node/edge updates)
      if (flowData.flowData) {
        payload.flowData = flowData.flowData
      }

      const response = await api.put(`/flows/${id}`, payload)

      // Update local flows array - check for both id and _id
      const index = flows.value.findIndex(flow => (flow._id === id) || (flow.id === id))
      if (index !== -1) {
        flows.value[index] = response.data.data || response.data
      }

      currentFlow.value = response.data

      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar fluxo'
      }
    } finally {
      loading.value = false
    }
  }

  async function deleteFlow(id) {
    try {
      loading.value = true
      await api.delete(`/flows/${id}`)

      // Remove from local flows array - check for both id and _id
      flows.value = flows.value.filter(flow => (flow._id !== id) && (flow.id !== id))

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao deletar fluxo'
      }
    } finally {
      loading.value = false
    }
  }

  async function cloneFlow(id) {
    try {
      loading.value = true
      const response = await api.post(`/flows/${id}/clone`)

      // Add cloned flow to local array
      flows.value.unshift(response.data)

      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao clonar fluxo'
      }
    } finally {
      loading.value = false
    }
  }

  async function getFlowStats(id) {
    try {
      const response = await api.get(`/flows/${id}/stats`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar estatísticas'
      }
    }
  }

  async function getFlowInputs(id) {
    try {
      const response = await api.get(`/flows/${id}/inputs`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar inputs do fluxo'
      }
    }
  }

  async function executeFlow(id, inputData = {}) {
    try {
      loading.value = true
      const payload = {
        inputData
      }
      const response = await api.post(`/flows/${id}/execute`, payload)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.response?.data?.message || 'Erro ao executar fluxo'
      }
    } finally {
      loading.value = false
    }
  }

  async function getPublicFlows() {
    try {
      loading.value = true
      const response = await api.get('/flows/public')
      return { success: true, data: response.data.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar fluxos públicos'
      }
    } finally {
      loading.value = false
    }
  }

  // Executions operations
  async function getExecutions(params = {}) {
    try {
      loading.value = true
      const response = await api.get('/executions', { params })

      executions.value = response.data.data || []

      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.response?.data?.message || 'Erro ao buscar execuções'
      }
    } finally {
      loading.value = false
    }
  }

  async function getExecution(id) {
    try {
      const response = await api.get(`/executions/${id}/response`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar execução'
      }
    }
  }

  async function cancelExecution(id) {
    try {
      await api.post(`/executions/${id}/cancel`)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao cancelar execução'
      }
    }
  }

  async function reexecuteFlow(id) {
    try {
      const response = await api.post(`/executions/${id}/reexecute`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao reexecutar fluxo'
      }
    }
  }

  async function getExecutionStats(params = {}) {
    try {
      const response = await api.get('/executions/stats', { params })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar estatísticas'
      }
    }
  }

  // Computed properties
  const totalFlows = computed(() => flows.value.length)
  const activeFlows = computed(() => flows.value.filter(flow => !flow.archived))
  const recentExecutions = computed(() =>
    executions.value.slice(0, 5).sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    )
  )

  return {
    flows: computed(() => flows.value),
    currentFlow: computed(() => currentFlow.value),
    executions: computed(() => executions.value),
    loading: computed(() => loading.value),
    totalFlows,
    activeFlows,
    recentExecutions,

    // Flow operations
    getFlows,
    getFlow,
    createFlow,
    updateFlow,
    deleteFlow,
    cloneFlow,
    getFlowStats,
    getFlowInputs,
    executeFlow,
    getPublicFlows,

    // Execution operations
    getExecutions,
    getExecution,
    cancelExecution,
    reexecuteFlow,
    getExecutionStats
  }
}