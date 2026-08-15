<template>
  <div class="bg-background text-on-surface overflow-hidden min-h-screen">
    <!-- Sidebar -->
    <aside class="fixed left-0 top-0 h-full w-64 border-r border-outline-variant bg-surface p-4 flex flex-col z-50">
      <div class="mb-10 px-4">
        <h1 class="text-lg font-bold text-primary tracking-tight">NariBoard</h1>
        <p class="text-sm text-on-surface-variant">Espacio Candy</p>
      </div>

      <nav class="flex flex-col gap-2 flex-grow">
        <router-link
          :to="{ name: 'dashboard' }"
          class="flex items-center gap-3 rounded-full px-4 py-3 transition-all duration-300 bouncy"
          :class="isDashboard
            ? 'bg-primary-container text-on-primary-container scale-[1.03] shadow-sm'
            : 'text-on-surface-variant hover:text-primary'"
        >
          <span class="material-symbols-outlined" :class="{ filled: isDashboard }">dashboard</span>
          <span class="font-medium">Proyectos</span>
        </router-link>

        <a
          href="#"
          class="flex items-center gap-3 text-on-surface-variant hover:text-primary px-4 py-3 transition-all duration-300 bouncy"
          @click.prevent
        >
          <span class="material-symbols-outlined">person</span>
          <span class="font-medium">Perfil</span>
        </a>

        <div class="mt-auto">
          <button
            type="button"
            class="flex items-center gap-3 text-on-surface-variant hover:text-error px-4 py-3 transition-all duration-300 bouncy w-full"
            @click="handleLogout"
          >
            <span class="material-symbols-outlined">logout</span>
            <span class="font-medium">Cerrar sesión</span>
          </button>
        </div>
      </nav>

      <div class="mt-6 px-2 flex items-center gap-3 pt-6 border-t border-outline-variant">
        <div class="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold">
          {{ userInitials }}
        </div>
        <div class="overflow-hidden">
          <p class="text-sm font-bold truncate">{{ authStore.profile?.fullName || authStore.profile?.email }}</p>
          <p class="text-[10px] text-on-surface-variant uppercase tracking-wider">{{ authStore.profile?.role }}</p>
        </div>
      </div>
    </aside>

    <!-- Top bar -->
    <header class="fixed top-0 right-0 left-64 flex justify-between items-center px-6 py-3 bg-surface/80 backdrop-blur-md z-40 border-b border-outline-variant/30">
      <div class="flex items-center gap-4 flex-1">
        <div class="relative w-full max-w-md">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            :value="search"
            type="text"
            placeholder="Buscar proyectos..."
            class="w-full pl-10 pr-4 py-2 bg-surface-container-low rounded-full border-none focus:ring-2 focus:ring-primary/30 transition-all outline-none"
            @input="$emit('update:search', $event.target.value)"
          />
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div class="text-xl font-black text-primary mr-4 hidden sm:block">NariBoard</div>
        <button type="button" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant bouncy">
          <span class="material-symbols-outlined">notifications</span>
        </button>
        <button type="button" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant bouncy">
          <span class="material-symbols-outlined">settings</span>
        </button>
      </div>
    </header>

    <!-- Content -->
    <main class="ml-64 mt-16 p-8 min-h-screen overflow-y-auto custom-scrollbar">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

defineProps({
  search: { type: String, default: '' },
})

defineEmits(['update:search'])

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isDashboard = computed(() => route.name === 'dashboard')

const userInitials = computed(() => {
  const name = authStore.profile?.fullName || authStore.profile?.email || '?'
  return name.charAt(0).toUpperCase()
})

async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>
