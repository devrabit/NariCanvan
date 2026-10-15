<template>
  <DashboardLayout v-model:search="search">
    <div class="flex flex-col gap-4 md:flex-row md:justify-between md:items-end mb-8">
      <div>
        <h2 class="text-2xl md:text-4xl font-bold text-on-surface tracking-tight mb-2">Mis Proyectos</h2>
        <p class="text-on-surface-variant text-base md:text-lg">
          Tienes {{ projects.length }} proyecto{{ projects.length !== 1 ? 's' : '' }} activo{{ projects.length !== 1 ? 's' : '' }} esta semana.
        </p>
      </div>
      <button
        type="button"
        class="hidden md:flex bg-primary text-on-primary font-bold px-8 py-4 rounded-full items-center gap-2 pink-shadow bouncy hover:brightness-110 transition-all"
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
        @delete="openDeleteDialog"
      />
    </div>

    <Teleport to="body">
      <div
        v-if="projectToDelete"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-on-surface/40 px-4"
        @click.self="closeDeleteDialog"
      >
        <div
          class="bg-white rounded-lg purple-shadow w-full max-w-md p-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-project-title"
          @keydown.esc="closeDeleteDialog"
        >
          <h3 id="delete-project-title" class="text-2xl font-bold text-on-surface mb-2">Eliminar proyecto</h3>
          <p class="text-on-surface-variant mb-6">
            ¿Eliminar <span class="font-bold text-on-surface">{{ projectToDelete.title }}</span>? Esta acción es permanente.
          </p>
          <p v-if="deleteError" class="mb-4 text-sm text-error bg-error-container rounded-lg px-4 py-3">
            {{ deleteError }}
          </p>
          <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              class="w-full sm:w-auto px-5 py-3 min-h-11 rounded-full font-bold text-on-surface-variant hover:bg-surface-variant transition-colors"
              :disabled="deleting"
              @click="closeDeleteDialog"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="w-full sm:w-auto px-5 py-3 min-h-11 rounded-full font-bold bg-error text-on-error hover:brightness-110 transition-all disabled:opacity-60"
              :disabled="deleting"
              @click="confirmDelete"
            >
              {{ deleting ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <footer class="mt-16 pt-8 border-t border-outline-variant/30 text-center pb-8">
      <p class="text-sm text-on-surface-variant">© 2024 NariBoard. Keep it sweet.</p>
    </footer>

    <div class="md:hidden fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-4 z-50">
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
import { deleteProject, fetchProjects } from '../services/projectsService'
import DashboardLayout from '../components/DashboardLayout.vue'
import ProjectCard from '../components/ProjectCard.vue'
import CreateProjectModal from '../components/CreateProjectModal.vue'

const authStore = useAuthStore()

const projects = ref([])
const loading = ref(true)
const error = ref(null)
const search = ref('')
const showCreateModal = ref(false)
const projectToDelete = ref(null)
const deleting = ref(false)
const deleteError = ref(null)

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

function openDeleteDialog(project) {
  deleteError.value = null
  projectToDelete.value = project
}

function closeDeleteDialog() {
  if (deleting.value) return
  projectToDelete.value = null
  deleteError.value = null
}

async function confirmDelete() {
  if (!projectToDelete.value || deleting.value) return
  if (!authStore.session?.access_token) return

  const id = projectToDelete.value.id
  deleting.value = true
  deleteError.value = null

  try {
    await deleteProject(authStore.session.access_token, id)
    projects.value = projects.value.filter((project) => project.id !== id)
    deleting.value = false
    closeDeleteDialog()
  } catch (err) {
    deleteError.value = err.message
  } finally {
    deleting.value = false
  }
}

onMounted(loadProjects)
</script>
