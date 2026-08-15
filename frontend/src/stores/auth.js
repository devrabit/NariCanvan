import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from '../services/firebase'
import { fetchProfile } from '../services/authService'

export const useAuthStore = defineStore('auth', () => {
  const session = ref(null)
  const user = ref(null)
  const profile = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const initialized = ref(false)

  const isAuthenticated = computed(() => !!session.value)

  async function setSessionFromUser(firebaseUser) {
    if (!firebaseUser) {
      session.value = null
      user.value = null
      profile.value = null
      return
    }

    const accessToken = await firebaseUser.getIdToken()
    session.value = { access_token: accessToken }
    user.value = firebaseUser
  }

  async function login(email, password) {
    loading.value = true
    error.value = null

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      await setSessionFromUser(credential.user)

      const userProfile = await fetchProfile(session.value.access_token)

      if (!userProfile.isActive) {
        await signOut(auth)
        session.value = null
        user.value = null
        profile.value = null
        error.value = 'Tu cuenta está desactivada'
        return false
      }

      profile.value = userProfile
      return true
    } catch (err) {
      const code = err?.code || ''
      if (code.startsWith('auth/')) {
        error.value = 'Email o contraseña incorrectos'
      } else {
        error.value = err.message || 'Error al iniciar sesión'
      }
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    await signOut(auth)
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

    await auth.authStateReady()
    await setSessionFromUser(auth.currentUser)
    if (auth.currentUser) {
      await fetchUserProfile()
    }

    onAuthStateChanged(auth, async (firebaseUser) => {
      await setSessionFromUser(firebaseUser)
      if (firebaseUser) {
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
