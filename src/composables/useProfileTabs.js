import { ref, computed } from 'vue'

export function useProfileTabs() {
  const activeTab = ref('profile')
  const message = ref('')
  const error = ref('')

  const tabs = [
    { id: 'profile', name: 'Profile', icon: 'lucide:user' },
    { id: 'security', name: 'Security', icon: 'lucide:shield' },
    { id: 'preferences', name: 'Preferences', icon: 'lucide:settings' },
    { id: 'sessions', name: 'Sessions', icon: 'lucide:monitor' },
    { id: 'account', name: 'Account', icon: 'lucide:trash-2' }
  ]

  function setActiveTab(tab) {
    activeTab.value = tab
    clearMessages()
  }

  function clearMessages() {
    error.value = ''
    message.value = ''
  }

  function setMessage(msg) {
    message.value = msg
    error.value = ''
  }

  function setError(err) {
    error.value = err
    message.value = ''
  }

  return {
    activeTab: computed(() => activeTab.value),
    message: computed(() => message.value),
    error: computed(() => error.value),
    tabs,
    setActiveTab,
    clearMessages,
    setMessage,
    setError
  }
}
