import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../services/supabase'
import { fetchProfile } from '../services/authService'

export const useAuthStore = defineStore('auth', () => {
  const session = ref(null)
  const user = ref(null)
  const profile = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const initialized = ref(false)

  const isAuthenticated = computed(() => !!session.value)

  async function login(email, password) {
    loading.value = true
    error.value = null

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        error.value = 'Email o contraseña incorrectos'
        return false
      }

      session.value = data.session
      user.value = data.user

      const userProfile = await fetchProfile(data.session.access_token)

      if (!userProfile.isActive) {
        await supabase.auth.signOut()
        session.value = null
        user.value = null
        profile.value = null
        error.value = 'Tu cuenta está desactivada'
        return false
      }

      profile.value = userProfile
      return true
    } catch (err) {
      error.value = err.message || 'Error al iniciar sesión'
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    await supabase.auth.signOut()
    session.value = null
    user.value = null
    profile.value = null
    error.value = null
    loading.value = false
  }

  async function fetchUserProfile() {
    if (!session.value?.access_token) return

    try {
      profile.value = await fetchProfile(session.value.access_token)
    } catch {
      await logout()
    }
  }

  async function initAuth() {
    if (initialized.value) return

    const { data: { session: currentSession } } = await supabase.auth.getSession()

    if (currentSession) {
      session.value = currentSession
      user.value = currentSession.user
      await fetchUserProfile()
    }

    supabase.auth.onAuthStateChange(async (_event, newSession) => {
      session.value = newSession
      user.value = newSession?.user ?? null

      if (newSession) {
        await fetchUserProfile()
      } else {
        profile.value = null
      }
    })

    initialized.value = true
  }

  return {
    session,
    user,
    profile,
    loading,
    error,
    initialized,
    isAuthenticated,
    login,
    logout,
    initAuth,
  }
})
