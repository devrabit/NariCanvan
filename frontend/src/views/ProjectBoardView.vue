<template>
  <DashboardLayout
    v-model:search="search"
    search-placeholder="Buscar tareas..."
    :context-title="project?.title || ''"
    :context-subtitle="project ? `${project.progress}% completado` : ''"
  >
    <div v-if="loading" class="text-center py-16 text-on-surface-variant">
      Cargando tablero...
    </div>

    <div v-else-if="error" class="text-center py-16">
      <p class="text-error bg-error-container rounded-lg px-6 py-4 inline-block">{{ error }}</p>
      <div class="mt-6">
        <router-link :to="{ name: 'dashboard' }" class="text-primary font-bold hover:underline">
          Volver a Proyectos
        </router-link>
      </div>
    </div>

    <div v-else>
      <KanbanBoard
        :tasks="filteredTasks"
        @create="openCreate"
        @drop="onDrop"
        @dragstart="draggingTask = $event"
        @dragend="draggingTask = null"
      />
    </div>

    <button
      type="button"
      class="fixed bottom-8 right-8 w-16 h-16 bg-primary text-on-primary rounded-full shadow-xl shadow-primary/30 flex items-center justify-center bouncy z-50"
      aria-label="Nueva tarea"
      @click="openCreate('pending')"
    >
      <span class="material-symbols-outlined text-3xl">add</span>
    </button>

    <CreateTaskModal
      :open="showCreate"
      :project-id="route.params.projectId"
      :default-status="createStatus"
      @close="showCreate = false"
      @created="onTaskCreated"
    />
  </DashboardLayout>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { fetchProject } from '../services/projectsService'
import { fetchTasks, patchTask } from '../services/tasksService'
import DashboardLayout from '../components/DashboardLayout.vue'
import KanbanBoard from '../components/KanbanBoard.vue'
import CreateTaskModal from '../components/CreateTaskModal.vue'

const route = useRoute()
const authStore = useAuthStore()

const project = ref(null)
const tasks = ref([])
const loading = ref(true)
const error = ref(null)
const search = ref('')
const showCreate = ref(false)
const createStatus = ref('pending')
const draggingTask = ref(null)

const filteredTasks = computed(() => {
  const term = search.value.toLowerCase().trim()
  if (!term) return tasks.value
  return tasks.value.filter((task) =>
    `${task.title} ${task.description || ''}`.toLowerCase().includes(term),
  )
})

async function loadBoard() {
  if (!authStore.session?.access_token) return
  loading.value = true
  error.value = null
  try {
    const token = authStore.session.access_token
    const projectId = route.params.projectId
    const [projectData, tasksData] = await Promise.all([
      fetchProject(token, projectId),
      fetchTasks(token, projectId),
    ])
    project.value = projectData.project
    tasks.value = tasksData.tasks
  } catch (err) {
    error.value = err.message
    project.value = null
    tasks.value = []
  } finally {
    loading.value = false
  }
}

function openCreate(status) {
  createStatus.value = status || 'pending'
  showCreate.value = true
}

function onTaskCreated(task) {
  tasks.value = [task, ...tasks.value]
}

async function onDrop(status) {
  const task = draggingTask.value
  if (!task || task.status === status) return
  const previous = task.status
  task.status = status
  try {
    const result = await patchTask(
      authStore.session.access_token,
      route.params.projectId,
      task.id,
      { status },
    )
    const index = tasks.value.findIndex((item) => item.id === task.id)
    if (index >= 0) tasks.value[index] = result.task
  } catch (err) {
    task.status = previous
    error.value = err.message
  } finally {
    draggingTask.value = null
  }
}

watch(
  () => route.params.projectId,
  () => {
    search.value = ''
    loadBoard()
  },
  { immediate: true },
)
</script>
