<template>
  <div class="bg-background text-on-surface overflow-hidden min-h-screen">
    <div
      v-if="navOpen"
      class="fixed inset-x-0 bottom-0 z-40 bg-on-surface/40 md:hidden"
      :class="contextTitle ? 'top-[7.5rem]' : 'top-16'"
      @click="navOpen = false"
    />

    <aside
      id="app-sidebar"
      class="fixed left-0 w-64 border-r border-outline-variant bg-surface p-4 flex flex-col z-50 transition-transform duration-300 md:top-0 md:h-full md:translate-x-0"
      :class="[
        navOpen ? 'translate-x-0' : '-translate-x-full',
        contextTitle ? 'top-[7.5rem] h-[calc(100%-7.5rem)]' : 'top-16 h-[calc(100%-4rem)]',
      ]"
    >
      <div class="mb-10 px-4">
        <h1 class="text-lg font-bold text-primary tracking-tight">NariBoard</h1>
        <p class="text-sm text-on-surface-variant">Espacio Candy</p>
      </div>

      <nav class="flex flex-col gap-2 flex-grow">
        <router-link
          :to="{ name: 'dashboard' }"
          class="flex items-center gap-3 rounded-full px-4 py-3 min-h-11 transition-all duration-300 bouncy"
          :class="isProjectsNav
            ? 'bg-primary-container text-on-primary-container scale-[1.03] shadow-sm'
            : 'text-on-surface-variant hover:text-primary'"
          @click="navOpen = false"
        >
          <span class="material-symbols-outlined" :class="{ filled: isProjectsNav }">dashboard</span>
          <span class="font-medium">Proyectos</span>
        </router-link>

        <a
          href="#"
          class="flex items-center gap-3 text-on-surface-variant hover:text-primary px-4 py-3 min-h-11 transition-all duration-300 bouncy"
          @click.prevent="navOpen = false"
        >
          <span class="material-symbols-outlined">person</span>
          <span class="font-medium">Perfil</span>
        </a>

        <div class="mt-auto">
          <button
            type="button"
            class="flex items-center gap-3 text-on-surface-variant hover:text-error px-4 py-3 min-h-11 transition-all duration-300 bouncy w-full"
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

    <header class="fixed top-0 right-0 left-0 md:left-64 bg-surface/80 backdrop-blur-md z-30 border-b border-outline-variant/30">
      <div class="flex items-center gap-2 px-4 py-3 md:px-6">
        <button
          type="button"
          class="md:hidden w-11 h-11 shrink-0 flex items-center justify-center rounded-full hover:bg-surface-container text-on-surface"
          :aria-expanded="navOpen"
          aria-controls="app-sidebar"
          aria-label="Menú"
          @click="navOpen = !navOpen"
        >
          <span class="material-symbols-outlined">{{ navOpen ? 'close' : 'menu' }}</span>
        </button>

        <div class="relative w-full max-w-md min-w-0 flex-1">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            :value="search"
            type="text"
            :placeholder="searchPlaceholder"
            class="w-full pl-10 pr-4 py-2 bg-surface-container-low rounded-full border-none focus:ring-2 focus:ring-primary/30 transition-all outline-none"
            @input="$emit('update:search', $event.target.value)"
          />
        </div>

        <div v-if="contextTitle" class="text-right hidden md:block mr-2 max-w-[14rem]">
          <p class="text-sm font-bold leading-tight truncate">Proyecto: {{ contextTitle }}</p>
          <p v-if="contextSubtitle" class="text-[10px] text-secondary font-medium truncate">{{ contextSubtitle }}</p>
        </div>
        <div v-else class="text-xl font-black text-primary mr-4 hidden md:block">NariBoard</div>

        <div
          v-if="contextTitle"
          class="w-10 h-10 shrink-0 rounded-full bg-secondary-container hidden sm:flex items-center justify-center text-on-secondary-container font-bold border-2 border-surface"
        >
          {{ userInitials }}
        </div>
        <button type="button" class="hidden sm:flex w-10 h-10 items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant bouncy">
          <span class="material-symbols-outlined">notifications</span>
        </button>
        <button type="button" class="hidden sm:flex w-10 h-10 items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant bouncy">
          <span class="material-symbols-outlined">settings</span>
        </button>
      </div>

      <div v-if="contextTitle" class="md:hidden px-4 pb-3">
        <p class="text-sm font-bold leading-tight truncate">Proyecto: {{ contextTitle }}</p>
        <p v-if="contextSubtitle" class="text-[10px] text-secondary font-medium truncate">{{ contextSubtitle }}</p>
      </div>
    </header>

    <main
      class="ml-0 md:ml-64 p-4 md:p-8 min-h-screen overflow-y-auto custom-scrollbar"
      :class="contextTitle ? 'mt-[7.5rem] md:mt-16' : 'mt-16'"
    >
      <slot />
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

defineProps({
  search: { type: String, default: '' },
  searchPlaceholder: { type: String, default: 'Buscar proyectos...' },
  contextTitle: { type: String, default: '' },
  contextSubtitle: { type: String, default: '' },
})

defineEmits(['update:search'])

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const navOpen = ref(false)

const isProjectsNav = computed(() => route.name === 'dashboard' || route.name === 'project-board')

const userInitials = computed(() => {
  const name = authStore.profile?.fullName || authStore.profile?.email || '?'
  return name.charAt(0).toUpperCase()
})

watch(() => route.fullPath, () => {
  navOpen.value = false
})

function onKeydown(event) {
  if (event.key === 'Escape' && navOpen.value) navOpen.value = false
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

async function handleLogout() {
  navOpen.value = false
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>
