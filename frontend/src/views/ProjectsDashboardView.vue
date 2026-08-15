<template>
  <DashboardLayout v-model:search="search">
    <div class="flex justify-between items-end mb-8">
      <div>
        <h2 class="text-4xl font-bold text-on-surface tracking-tight mb-2">Mis Proyectos</h2>
        <p class="text-on-surface-variant text-lg">
          Tienes {{ projects.length }} proyecto{{ projects.length !== 1 ? 's' : '' }} activo{{ projects.length !== 1 ? 's' : '' }} esta semana.
        </p>
      </div>
      <button
        type="button"
        class="bg-primary text-on-primary font-bold px-8 py-4 rounded-full flex items-center gap-2 pink-shadow bouncy hover:brightness-110 transition-all"
        @click="openCreateModal"
      >
        <span class="material-symbols-outlined">add</span>
        Nuevo Proyecto
      </button>
    </div>

    <div v-if="loading" class="text-center py-16 text-on-surface-variant">
      Cargando proyectos...
    </div>

    <div v-else-if="error" class="text-center py-16 text-error bg-error-container rounded-lg px-6">
      {{ error }}
    </div>

    <div v-else-if="filteredProjects.length === 0" class="text-center py-16 text-on-surface-variant">
      No se encontraron proyectos.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProjectCard
        v-for="(project, index) in filteredProjects"
        :key="project.id"
        :project="project"
        :featured="index === 0"
      />
    </div>

    <footer class="mt-16 pt-8 border-t border-outline-variant/30 text-center pb-8">
      <p class="text-sm text-on-surface-variant">© 2024 NariBoard. Keep it sweet.</p>
    </footer>

    <div class="md:hidden fixed bottom-6 right-6 z-50">
      <button
        type="button"
        class="w-16 h-16 bg-primary text-on-primary rounded-full pink-shadow flex items-center justify-center bouncy transition-transform"
        @click="openCreateModal"
      >
        <span class="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>

    <CreateProjectModal
      :open="showCreateModal"
      @close="showCreateModal = false"
      @created="onProjectCreated"
    />
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { fetchProjects } from '../services/projectsService'
import DashboardLayout from '../components/DashboardLayout.vue'
import ProjectCard from '../components/ProjectCard.vue'
import CreateProjectModal from '../components/CreateProjectModal.vue'

const authStore = useAuthStore()

const projects = ref([])
const loading = ref(true)
const error = ref(null)
const search = ref('')
const showCreateModal = ref(false)

const filteredProjects = computed(() => {
  const term = search.value.toLowerCase().trim()
  if (!term) return projects.value
  return projects.value.filter((p) => p.title.toLowerCase().includes(term))
})

async function loadProjects() {
  if (!authStore.session?.access_token) return

  loading.value = true
  error.value = null

  try {
    const data = await fetchProjects(authStore.session.access_token)
    projects.value = data.projects
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  showCreateModal.value = true
}

async function onProjectCreated() {
  await loadProjects()
}

onMounted(loadProjects)
</script>
